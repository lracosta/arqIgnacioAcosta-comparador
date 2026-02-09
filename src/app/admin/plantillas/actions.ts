"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNewVersion(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const fromVersionId = formData.get("fromVersionId") as string | null;

    if (!nombre) {
        return { error: "El nombre es obligatorio" };
    }

    const { data, error } = await supabase.rpc("create_new_plantilla_version", {
        p_nombre: nombre,
        p_descripcion: descripcion,
        p_from_version_id: fromVersionId === "none" ? null : fromVersionId,
    });

    if (error) {
        console.error("Error creating version:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/plantillas");
    redirect(`/admin/plantillas/${data}`);
}

export async function activateVersion(versionId: string) {
    const supabase = await createClient();

    const { error } = await supabase.rpc("activate_plantilla_version", {
        p_version_id: versionId,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/plantillas");
}

export async function deleteVersion(versionId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("plantilla_versiones").delete().eq("id", versionId);

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

// Clasificaciones
export async function createClasificacion(versionId: string, nombre: string) {
    const supabase = await createClient();

    // Get max order to append at end
    const { data: existing } = await supabase
        .from('clasificaciones')
        .select('orden')
        .eq('plantilla_version_id', versionId)
        .order('orden', { ascending: false })
        .limit(1);

    const nextOrder = (existing?.[0]?.orden || 0) + 1;

    const { error } = await supabase.from("clasificaciones").insert({
        plantilla_version_id: versionId,
        nombre,
        orden: nextOrder,
    });

    if (error) return { error: error.message };
    revalidatePath(`/admin/plantillas`);
}

export async function updateClasificacion(id: string, nombre: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("clasificaciones")
        .update({ nombre })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function deleteClasificacion(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("clasificaciones").delete().eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function updateClasificacionOrder(items: { id: string; orden: number }[]) {
    const supabase = await createClient();
    await Promise.all(
        items.map((item) =>
            supabase.from("clasificaciones").update({ orden: item.orden }).eq("id", item.id)
        )
    );
    revalidatePath("/admin/plantillas");
}


// Criterios
export async function createCriterio(clasificacionId: string, nombre: string, puntaje_maximo: number, descripcion: string = "") {
    const supabase = await createClient();

    const { data: existing } = await supabase
        .from('criterios')
        .select('orden')
        .eq('clasificacion_id', clasificacionId)
        .order('orden', { ascending: false })
        .limit(1);

    const nextOrder = (existing?.[0]?.orden || 0) + 1;

    const { error } = await supabase.from("criterios").insert({
        clasificacion_id: clasificacionId,
        nombre,
        descripcion: descripcion,
        puntaje_maximo,
        orden: nextOrder,
    });

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function updateCriterio(id: string, nombre: string, puntaje_maximo: number, descripcion: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("criterios")
        .update({ nombre, puntaje_maximo, descripcion })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function deleteCriterio(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("criterios").delete().eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function updateCriterioOrder(items: { id: string; orden: number }[]) {
    const supabase = await createClient();
    await Promise.all(
        items.map((item) =>
            supabase.from("criterios").update({ orden: item.orden }).eq("id", item.id)
        )
    );
    revalidatePath("/admin/plantillas");
}


// Factores
export async function createFactor(criterioId: string, nombre: string, valor: number = 0) {
    const supabase = await createClient();

    const { data: existing } = await supabase
        .from('factores')
        .select('orden')
        .eq('criterio_id', criterioId)
        .order('orden', { ascending: false })
        .limit(1);

    const nextOrder = (existing?.[0]?.orden || 0) + 1;

    const { error } = await supabase.from("factores").insert({
        criterio_id: criterioId,
        nombre,
        descripcion: "",
        orden: nextOrder,
        valor: valor
    });

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function updateFactor(id: string, nombre: string, valor: number) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("factores")
        .update({ nombre, valor })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/plantillas");
}

export async function deleteFactor(id: string) {
    const supabase = await createClient();
    const { error = null } = await supabase.from("factores").delete().eq("id", id);

    if (error) return { error: (error as any).message };
    revalidatePath("/admin/plantillas");
}

export async function updateFactorOrder(items: { id: string; orden: number }[]) {
    const supabase = await createClient();
    await Promise.all(
        items.map((item) =>
            supabase.from("factores").update({ orden: item.orden }).eq("id", item.id)
        )
    );
    revalidatePath("/admin/plantillas");
}
