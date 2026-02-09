import { createClient } from "@/lib/supabase/server";
import { Plus, Archive, ExternalLink, MoreVertical, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import NewProyectoDialog from "@/components/admin/proyectos/new-proyecto-dialog";
import ProyectoActions from "@/components/admin/proyectos/proyecto-actions";

export default async function ProyectosPage() {
    const supabase = await createClient();

    // Fetch proyectos with their clients and versions
    const { data: proyectos } = await supabase
        .from("proyectos")
        .select(`
            *,
            cliente:users!cliente_id(full_name, email),
            version:plantilla_versiones!plantilla_version_id(nombre, version)
        `)
        .order("created_at", { ascending: false });

    // Fetch clients for the dialog
    const { data: clientes } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "cliente")
        .order("full_name");

    // Fetch active version
    const { data: activeVersion } = await supabase
        .from("plantilla_versiones")
        .select("id, nombre, version")
        .eq("activa", true)
        .single();

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestione las comparaciones de lotes para sus clientes
                    </p>
                </div>
                <NewProyectoDialog
                    clientes={clientes || []}
                    activeVersion={activeVersion}
                />
            </div>

            {proyectos?.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Archive className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No hay proyectos</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            Comience creando su primer proyecto para un cliente y agregue lotes para comparar.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proyectos?.map((proyecto) => (
                        <Card key={proyecto.id} className="group hover:shadow-md transition-all overflow-hidden border-primary/10">
                            <CardHeader className="pb-3 bg-primary/5">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                                                {proyecto.nombre}
                                            </CardTitle>
                                            <Badge variant={proyecto.estado === 'activo' ? 'outline' : 'secondary'} className={cn(
                                                "h-5 text-[10px] uppercase tracking-wider font-bold",
                                                proyecto.estado === 'activo' && "border-primary text-primary"
                                            )}>
                                                {proyecto.estado}
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-1 text-xs">
                                            {proyecto.descripcion || "Sin descripción"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between py-1 border-b border-border/50 text-xs">
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span className="font-medium">{(proyecto.cliente as any)?.full_name || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/50 text-xs">
                                        <span className="text-muted-foreground">Plantilla:</span>
                                        <span className="font-medium text-xs">
                                            v{(proyecto.version as any)?.version} - {(proyecto.version as any)?.nombre}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1 text-xs">
                                        <span className="text-muted-foreground">Creado:</span>
                                        <span>{format(new Date(proyecto.created_at), "PPP", { locale: es })}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild size="sm" className="flex-1 h-9">
                                        <Link href={`/admin/proyectos/${proyecto.id}`}>
                                            Gestionar Lotes <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <ProyectoActions proyecto={proyecto} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
