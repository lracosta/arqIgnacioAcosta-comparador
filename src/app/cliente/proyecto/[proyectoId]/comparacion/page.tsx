import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ComparisonInterface from "@/components/cliente/comparison-interface";

export const dynamic = "force-dynamic";

export default async function ComparacionPage({
    params,
    searchParams,
}: {
    params: Promise<{ proyectoId: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { proyectoId } = await params;
    const { tab } = await searchParams;
    const supabase = await createClient();

    // 1. Fetch Project and the associated version structure
    const { data: proyecto, error: proyectoError } = await supabase
        .from("proyectos")
        .select(`
            *,
            version:plantilla_versiones(
                id,
                nombre,
                version,
                clasificaciones(
                    id,
                    nombre,
                    orden,
                    criterios(
                        id,
                        nombre,
                        descripcion,
                        puntaje_maximo,
                        orden,
                        factores(
                            id,
                            nombre,
                            descripcion,
                            orden,
                            valor
                        )
                    )
                )
            )
        `)
        .eq("id", proyectoId)
        .single();

    if (proyectoError) {
        return (
            <div className="p-8">
                <h1 className="text-red-500 font-bold">Error fetching project</h1>
                <pre>{JSON.stringify(proyectoError, null, 2)}</pre>
            </div>
        );
    }

    if (!proyecto) return <div className="p-8">No se encontró el proyecto.</div>;

    // 2. Fetch Lotes for this project
    const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("proyecto_id", proyectoId)
        .order("orden");

    // 3. Fetch Evaluations for these lotes
    const loteIds = lotes?.map(l => l.id) || [];
    let evaluaciones = [];
    if (loteIds.length > 0) {
        const { data: evals } = await supabase
            .from("evaluaciones")
            .select("*")
            .in("lote_id", loteIds);
        evaluaciones = evals || [];
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
            <ComparisonInterface
                proyecto={proyecto}
                lotes={lotes || []}
                evaluaciones={evaluaciones}
                readOnly={proyecto.estado === 'finalizado'}
                initialTab={tab}
            />
        </div>
    );
}
