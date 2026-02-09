import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    // 1. Ensure we have an admin and a client
    // For this test, we assume they exist or use the service role if we had it.
    // Instead, we'll try to get the current user or direct them to sign up.

    // 2. Create a Project if none exists
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clientEmail = "cliente-test@ejemplo.com";
    // Search for a client user
    const { data: clients } = await supabase.from("users").select("id").eq("role", "cliente").limit(1);

    if (!clients || clients.length === 0) {
        return NextResponse.json({ error: "Debe existir al menos un usuario con rol 'cliente' en public.users" });
    }

    const clienteId = clients[0].id;

    // Get active version
    const { data: version } = await supabase.from("plantilla_versiones").select("id").eq("activa", true).single();
    if (!version) return NextResponse.json({ error: "No active version" });

    // Create Sample Project
    const { data: proyecto, error: pError } = await supabase.from("proyectos").insert({
        nombre: "Proyecto de Prueba Residencial",
        descripcion: "Comparación de lotes para vivienda unifamiliar en zona suburbana.",
        cliente_id: clienteId,
        plantilla_version_id: version.id,
        estado: "activo"
    }).select().single();

    if (pError) return NextResponse.json({ error: pError.message });

    // Create 3 Sample Lots
    const lotesData = [
        { proyecto_id: proyecto.id, nombre: "Lote Las Acacias 45", ubicacion: "Calle Las Acacias 450, Barrio Norte", descripcion: "Esquina, 500m2", orden: 0 },
        { proyecto_id: proyecto.id, nombre: "Terreno El Ombú", ubicacion: "Ruta 9 km 250", descripcion: "Lote central, 450m2, arbolado", orden: 1 },
        { proyecto_id: proyecto.id, nombre: "Solar del Valle 12", ubicacion: "Valle Escondido, Manzana 3", descripcion: "Pendiente suave, vistas al valle", orden: 2 },
    ];

    const { data: lotes, error: lError } = await supabase.from("lotes").insert(lotesData).select();
    if (lError) return NextResponse.json({ error: lError.message });

    return NextResponse.json({
        success: true,
        message: "Datos de prueba creados exitosamente",
        projectId: proyecto.id,
        lotesCount: lotes.length
    });
}
