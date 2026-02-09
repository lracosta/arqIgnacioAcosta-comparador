"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveEvaluation(
    loteId: string,
    factorId: string,
    projectId: string
) {
    const supabase = await createClient();

    // 1. Get the criterion ID for this factor to replace any existing selection in the same criterion
    const { data: factor } = await supabase
        .from("factores")
        .select("criterio_id")
        .eq("id", factorId)
        .single();

    if (!factor) return { error: "Factor no encontrado" };

    // 2. Ideally evaluations table has criterio_id now. 
    // If not, we have to find and delete others. 
    // Let's assume the table structure is: id, lote_id, criterio_id, factor_id, updated_at

    // For now, let's try a simple upsert if the user updated the table, 
    // or a delete/insert if they didn't.
    // Based on the prompt 'one factor per criterion', the most logical schema is UNIQUE(lote_id, criterio_id).

    const { error } = await supabase.from("evaluaciones").upsert({
        lote_id: loteId,
        criterio_id: factor.criterio_id, // We assume this column exists now
        factor_id: factorId,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'lote_id,criterio_id'
    });

    if (error) {
        // Fallback in case criterio_id doesn't exist yet in the table
        console.error("Upsert failed, trying manual replacement:", error.message);

        // Find all factors of the same criterion
        const { data: otherFactors } = await supabase
            .from("factores")
            .select("id")
            .eq("criterio_id", factor.criterio_id);

        const factorIds = otherFactors?.map(f => f.id) || [];

        // Delete previous evaluations for this criterion
        await supabase
            .from("evaluaciones")
            .delete()
            .eq("lote_id", loteId)
            .in("factor_id", factorIds);

        // Insert new one
        const { error: insertError } = await supabase.from("evaluaciones").insert({
            lote_id: loteId,
            factor_id: factorId,
            updated_at: new Date().toISOString()
        });

        if (insertError) return { error: insertError.message };
    }

    revalidatePath(`/cliente/comparacion/${projectId}`);
    return { success: true };
}
