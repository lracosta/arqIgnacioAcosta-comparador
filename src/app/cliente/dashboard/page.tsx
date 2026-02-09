import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, ArrowRight, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Mis Proyectos
                </h1>
                <p className="text-muted-foreground">
                    Seleccione un proyecto para comenzar la comparación de lotes.
                </p>
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
                        <Link key={proyecto.id} href={`/cliente/comparacion/${proyecto.id}`}>
                            <Card className="group hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md">
                                <CardHeader className="pb-4 relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                                            Proyecto Activo
                                        </Badge>
                                        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                            {proyecto.nombre}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {proyecto.descripcion || "Sin descripción proporcionada."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-md bg-secondary/50 flex items-center justify-center">
                                                <Layers className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Lotes</span>
                                                <span className="text-sm font-bold">{(proyecto.lotes as any)[0]?.count || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-md bg-secondary/50 flex items-center justify-center">
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
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
