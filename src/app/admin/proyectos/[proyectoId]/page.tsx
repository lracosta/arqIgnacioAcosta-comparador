import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Plus, GripVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LotEditor from "@/components/admin/proyectos/lot-editor";

export default async function ProyectoDetailPage({
    params,
}: {
    params: { proyectoId: string };
}) {
    const { proyectoId } = await params;
    const supabase = await createClient();

    // Fetch project details
    const { data: proyecto } = await supabase
        .from("proyectos")
        .select(`
            *,
            cliente:users!cliente_id(full_name, email),
            version:plantilla_versiones!plantilla_version_id(nombre, version)
        `)
        .eq("id", proyectoId)
        .single();

    if (!proyecto) {
        notFound();
    }

    // Fetch lots for the project
    const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("proyecto_id", proyectoId)
        .order("orden");

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href="/admin/proyectos">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{proyecto.nombre}</h1>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-primary/20">
                            {proyecto.estado}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Cliente: {(proyecto.cliente as any)?.full_name || (proyecto.cliente as any)?.email}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Información</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Plantilla Aplicada</p>
                                <p className="text-xs font-medium">v{(proyecto.version as any)?.version} - {(proyecto.version as any)?.nombre}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Descripción</p>
                                <p className="text-xs leading-relaxed">{proyecto.descripcion || "Sin descripción"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <LotEditor proyectoId={proyectoId} initialLotes={lotes || []} />
                </div>
            </div>
        </div>
    );
}
