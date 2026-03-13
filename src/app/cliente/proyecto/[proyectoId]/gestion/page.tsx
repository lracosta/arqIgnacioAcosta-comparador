import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ManagementInterface from "@/components/cliente/management-interface";

export const dynamic = "force-dynamic";

export default async function GestionPage({
    params,
}: {
    params: Promise<{ proyectoId: string }>;
}) {
    const { proyectoId } = await params;
    const supabase = await createClient();

    // Fetch Project
    const { data: proyecto, error: proyectoError } = await supabase
        .from("proyectos")
        .select("*")
        .eq("id", proyectoId)
        .single();

    if (proyectoError || !proyecto) {
        return (
            <div className="p-8">
                <h1 className="text-red-500 font-bold">Error fetching project</h1>
            </div>
        );
    }

    // Fetch Lotes for this project
    const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("proyecto_id", proyectoId)
        .order("orden");

    return (
        <ManagementInterface
            proyecto={proyecto}
            lotes={lotes || []}
            readOnly={proyecto.estado === 'finalizado'}
        />
    );
}
