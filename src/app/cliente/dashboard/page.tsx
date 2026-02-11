import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, ArrowRight, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import NewProyectoDialog from "@/components/cliente/new-proyecto-dialog";

export default async function ClienteDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch projects assigned to this client
    const { data: proyectos } = await supabase
        .from("proyectos")
        .select(`
            *,
            lotes(count),
            version:plantilla_versiones(nombre, version)
        `)
        .eq("cliente_id", user.id)
        .eq("estado", "activo")
        .order("created_at", { ascending: false });

    // Fetch active version for creation
    const { data: activeVersion } = await supabase
        .from("plantilla_versiones")
        .select("id, nombre, version")
        .eq("activa", true)
        .single();

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Mis Proyectos
                    </h1>
                    <p className="text-muted-foreground">
                        Gestione sus proyectos y compare lotes de manera profesional.
                    </p>
                </div>
                <NewProyectoDialog activeVersion={activeVersion} />
            </div>

            {proyectos?.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/5 py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted/10 flex items-center justify-center">
                            <Archive className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">No tiene proyectos asignados</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Cuando el administrador le asigne un proyecto de comparación, aparecerá aquí automáticamente.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proyectos?.map((proyecto) => (
                        <Card key={proyecto.id} className="group hover:shadow-md transition-all duration-300 border-border/60 flex flex-col overflow-hidden">
                            <CardHeader className="pb-4 relative bg-muted/5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                                            Proyecto Activo
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground font-medium">#{proyecto.id.slice(0, 8)}</span>
                                    </div>
                                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                        {proyecto.nombre}
                                    </CardTitle>
                                    <CardDescription className="text-xs line-clamp-1">
                                        {proyecto.descripcion || "Sin descripción proporcionada."}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5 flex-1 flex flex-col justify-between space-y-6">
                                <div className="grid grid-cols-2 gap-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Lotes</span>
                                            <span className="text-sm font-bold">{(proyecto.lotes as any)[0]?.count || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Alta</span>
                                            <span className="text-sm font-bold">
                                                {format(new Date(proyecto.created_at), "dd/MM/yy")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                                    <Button asChild size="sm" className="w-full h-10 shadow-sm font-bold">
                                        <Link href={`/cliente/comparacion/${proyecto.id}`}>
                                            <ArrowRight className="mr-2 h-4 w-4" /> Ir a Comparación
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="w-full h-10 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors text-xs">
                                        <Link href={`/cliente/comparacion/${proyecto.id}?tab=gestion`}>
                                            Configurar Lotes e Info
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
