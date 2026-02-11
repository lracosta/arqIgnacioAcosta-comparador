import { createClient } from "@/lib/supabase/server";
import { Plus, Archive, ExternalLink, MoreVertical, Trash2, Edit, BarChart3 } from "lucide-react";
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
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestione las comparaciones de lotes y visualice resultados para sus clientes.
                    </p>
                </div>
                <NewProyectoDialog
                    clientes={clientes || []}
                    activeVersion={activeVersion}
                />
            </div>

            {proyectos?.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                            <Archive className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-foreground">No hay proyectos</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Comience creando su primer proyecto para un cliente y agregue lotes para comparar.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proyectos?.map((proyecto) => (
                        <Card key={proyecto.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/60 flex flex-col">
                            <CardHeader className="pb-4 bg-muted/10 relative">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors truncate">
                                                {proyecto.nombre}
                                            </CardTitle>
                                            <Badge variant={proyecto.estado === 'activo' ? 'outline' : 'secondary'} className={cn(
                                                "h-5 text-[9px] uppercase tracking-tighter font-black",
                                                proyecto.estado === 'activo' && "border-primary/30 text-primary bg-primary/[0.03]"
                                            )}>
                                                {proyecto.estado}
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-1 text-xs">
                                            {proyecto.descripcion || "Sin descripción proporcionada"}
                                        </CardDescription>
                                    </div>
                                    <ProyectoActions proyecto={proyecto} />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-5 flex-1 flex flex-col justify-between">
                                <div className="grid gap-2.5">
                                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente</span>
                                        <span className="text-xs font-semibold">{(proyecto.cliente as any)?.full_name || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metodología</span>
                                        <span className="text-xs font-semibold">
                                            v{(proyecto.version as any)?.version} - {(proyecto.version as any)?.nombre}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Creado</span>
                                        <span className="text-xs text-muted-foreground">{format(new Date(proyecto.created_at), "PPP", { locale: es })}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild size="sm" className="flex-1 h-9 shadow-sm">
                                        <Link href={`/admin/proyectos/${proyecto.id}/resultados`}>
                                            <BarChart3 className="mr-2 h-3.5 w-3.5" /> Resultados
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="flex-1 h-9 hover:bg-primary/5 hover:text-primary border-primary/10">
                                        <Link href={`/admin/proyectos/${proyecto.id}`}>
                                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Lotes
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
