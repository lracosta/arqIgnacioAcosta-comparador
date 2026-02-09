"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Proyectos
export async function createProyecto(
    nombre: string,
    descripcion: string,
    clienteId: string,
    plantillaVersionId: string
) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("proyectos").insert({
        nombre,
        descripcion,
        cliente_id: clienteId,
        plantilla_version_id: plantillaVersionId,
        estado: "activo",
    }).select().single();

    if (error) return { error: error.message };
    revalidatePath("/admin/proyectos");
    return { data };
}

export async function updateProyecto(
    id: string,
    nombre: string,
    descripcion: string,
    clienteId: string,
    estado: string
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("proyectos")
        .update({ nombre, descripcion, cliente_id: clienteId, estado })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/proyectos");
    revalidatePath(`/admin/proyectos/${id}`);
}

export async function deleteProyecto(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("proyectos").delete().eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/proyectos");
}

// Lotes
export async function createLote(
    proyectoId: string,
    nombre: string,
    ubicacion: string,
    descripcion: string
) {
    const supabase = await createClient();

    // Get max order
    const { data: existing } = await supabase
        .from('lotes')
        .select('orden')
        .eq('proyecto_id', proyectoId)
        .order('orden', { ascending: false })
        .limit(1);

    const nextOrder = (existing?.[0]?.orden || 0) + 1;

    const { error } = await supabase.from("lotes").insert({
        proyecto_id: proyectoId,
        nombre,
        ubicacion,
        descripcion,
        orden: nextOrder,
    });

    if (error) return { error: error.message };
    revalidatePath(`/admin/proyectos/${proyectoId}`);
}

export async function updateLote(
    id: string,
    nombre: string,
    ubicacion: string,
    descripcion: string,
    proyectoId: string
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("lotes")
        .update({ nombre, ubicacion, descripcion })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath(`/admin/proyectos/${proyectoId}`);
}

export async function deleteLote(id: string, proyectoId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("lotes").delete().eq("id", id);

    if (error) return { error: error.message };
    revalidatePath(`/admin/proyectos/${proyectoId}`);
}

export async function updateLoteOrder(proyectoId: string, items: { id: string; orden: number }[]) {
    const supabase = await createClient();
    await Promise.all(
        items.map((item) =>
            supabase.from("lotes").update({ orden: item.orden }).eq("id", item.id)
        )
    );
    revalidatePath(`/admin/proyectos/${proyectoId}`);
}
