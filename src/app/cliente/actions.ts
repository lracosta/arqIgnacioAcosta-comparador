"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProyectoCliente(
    nombre: string,
    descripcion: string,
    plantillaVersionId: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const { data, error } = await supabase.from("proyectos").insert({
        nombre,
        descripcion,
        cliente_id: user.id,
        plantilla_version_id: plantillaVersionId,
        estado: "activo",
    }).select().single();

    if (error) return { error: error.message };
    revalidatePath("/cliente/dashboard");
    return { data };
}

export async function updateProyectoCliente(
    id: string,
    nombre: string,
    descripcion: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("proyectos")
        .update({ nombre, descripcion })
        .eq("id", id)
        .eq("cliente_id", user.id);

    if (error) return { error: error.message };
    revalidatePath("/cliente/dashboard");
    revalidatePath(`/cliente/comparacion/${id}`);
}

export async function deleteProyectoCliente(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const { error } = await supabase
        .from("proyectos")
        .delete()
        .eq("id", id)
        .eq("cliente_id", user.id);

    if (error) return { error: error.message };
    revalidatePath("/cliente/dashboard");
}

export async function createLoteCliente(
    proyectoId: string,
    nombre: string,
    ubicacion: string,
    descripcion: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Verify project belongs to user
    const { data: proyecto } = await supabase
        .from("proyectos")
        .select("id")
        .eq("id", proyectoId)
        .eq("cliente_id", user.id)
        .single();

    if (!proyecto) return { error: "Proyecto no encontrado o no autorizado" };

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
    revalidatePath(`/cliente/comparacion/${proyectoId}`);
}

export async function updateLoteCliente(
    id: string,
    nombre: string,
    ubicacion: string,
    descripcion: string,
    proyectoId: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Verify project belongs to user
    const { data: proyecto } = await supabase
        .from("proyectos")
        .select("id")
        .eq("id", proyectoId)
        .eq("cliente_id", user.id)
        .single();

    if (!proyecto) return { error: "No autorizado" };

    const { error } = await supabase
        .from("lotes")
        .update({ nombre, ubicacion, descripcion })
        .eq("id", id)
        .eq("proyecto_id", proyectoId);

    if (error) return { error: error.message };
    revalidatePath(`/cliente/comparacion/${proyectoId}`);
}

export async function deleteLoteCliente(id: string, proyectoId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Verify project belongs to user
    const { data: proyecto } = await supabase
        .from("proyectos")
        .select("id")
        .eq("id", proyectoId)
        .eq("cliente_id", user.id)
        .single();

    if (!proyecto) return { error: "No autorizado" };

    const { error } = await supabase
        .from("lotes")
        .delete()
        .eq("id", id)
        .eq("proyecto_id", proyectoId);

    if (error) return { error: error.message };
    revalidatePath(`/cliente/comparacion/${proyectoId}`);
}

export async function updateLoteOrderCliente(proyectoId: string, items: { id: string; orden: number }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Verify project belongs to user
    const { data: proyecto } = await supabase
        .from("proyectos")
        .select("id")
        .eq("id", proyectoId)
        .eq("cliente_id", user.id)
        .single();

    if (!proyecto) return { error: "No autorizado" };

    await Promise.all(
        items.map((item) =>
            supabase.from("lotes").update({ orden: item.orden }).eq("id", item.id).eq("proyecto_id", proyectoId)
        )
    );
    revalidatePath(`/cliente/comparacion/${proyectoId}`);
}
