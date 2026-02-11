import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ComparisonInterface from "@/components/cliente/comparison-interface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminResultadosPage({
    params,
}: {
    params: Promise<{ proyectoId: string }>;
}) {
    const { proyectoId } = await params;
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

    if (proyectoError || !proyecto) {
        notFound();
    }

    // 2. Fetch Lotes for this project
    const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("proyecto_id", proyectoId)
        .order("orden");

    // 3. Fetch Evaluations for these lotes
    const loteIds = lotes?.map(l => l.id) || [];
    const { data: evaluaciones } = await supabase
        .from("evaluaciones")
        .select("*")
        .in("lote_id", loteIds);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/admin/proyectos">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold leading-none">{proyecto.nombre}</h1>
                        <p className="text-xs text-muted-foreground mt-1">Vista de Administrador - Resultados de Comparación</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <ComparisonInterface
                    proyecto={proyecto}
                    lotes={lotes || []}
                    evaluaciones={evaluaciones || []}
                    readOnly={true}
                    showManagement={false}
                />
            </div>
        </div>
    );
}
