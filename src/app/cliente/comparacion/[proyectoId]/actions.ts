"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveEvaluation(
    loteId: string,
    factorId: string,
    projectId: string
) {
    const supabase = await createClient();

    // 1. Get the criterion ID for this factor
    const { data: factor } = await supabase
        .from("factores")
        .select("criterio_id")
        .eq("id", factorId)
        .single();

    if (!factor) return { error: "Factor no encontrado" };

    // 2. Perform upsert (one factor per criterion per lote)
    const { error } = await supabase.from("evaluaciones").upsert({
        lote_id: loteId,
        criterio_id: factor.criterio_id,
        factor_id: factorId,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'lote_id,criterio_id'
    });

    if (error) return { error: error.message };

    revalidatePath(`/cliente/comparacion/${projectId}`);
    return { success: true };
}

export async function finalizarProyecto(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("proyectos")
        .update({
            estado: "finalizado",
            updated_at: new Date().toISOString()
        })
        .eq("id", projectId)
        .eq("cliente_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/cliente/dashboard");
    revalidatePath(`/cliente/comparacion/${projectId}`);
    revalidatePath(`/admin/proyectos`);

    return { success: true };
}
