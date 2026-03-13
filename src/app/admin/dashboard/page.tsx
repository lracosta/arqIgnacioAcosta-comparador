import { createClient } from "@/lib/supabase/server";
import { Users, LayoutDashboard, Target, Briefcase, ChevronRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch data for KPIs
    const [
        { count: totalUsers },
        { data: proyectos },
        { count: totalLotes },
    ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "cliente"),
        supabase.from("proyectos").select("id, nombre, estado, created_at, users!inner(full_name, email)").order("created_at", { ascending: false }),
        supabase.from("lotes").select("*", { count: "exact", head: true })
    ]);

    const activeProjects = proyectos?.filter(p => p.estado === 'activo').length || 0;
    const finishedProjects = proyectos?.filter(p => p.estado === 'finalizado').length || 0;
    const totalProjects = proyectos?.length || 0;

    // Lotes average calculation
    const averageLotesText = totalProjects > 0 ? (totalLotes! / totalProjects).toFixed(1) : "0";

    const recentProjects = (proyectos || []).slice(0, 5);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Panel de Control</h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">Vision global del sistema y actividad reciente.</p>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="border-primary/10 shadow-sm relative overflow-hidden bg-primary/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="h-16 w-16" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-bold tracking-wider uppercase text-xs">Total Clientes</CardDescription>
                        <CardTitle className="text-4xl font-black">{totalUsers || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma</p>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardDescription className="font-bold tracking-wider uppercase text-xs">Proyectos Activos</CardDescription>
                            <CardTitle className="text-4xl font-black text-blue-600">{activeProjects}</CardTitle>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">En evaluación por clientes</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardDescription className="font-bold tracking-wider uppercase text-xs text-orange-800/60">Finalizados</CardDescription>
                            <CardTitle className="text-4xl font-black text-orange-600">{finishedProjects}</CardTitle>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                            <Target className="h-6 w-6 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-orange-800/60">Listos para revisión</p>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardDescription className="font-bold tracking-wider uppercase text-xs">Lotes Analizados</CardDescription>
                            <div className="flex items-baseline gap-2">
                                <CardTitle className="text-4xl font-black">{totalLotes || 0}</CardTitle>
                                <span className="text-sm font-bold text-muted-foreground">({averageLotesText} / proy)</span>
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Volumen total de terrenos</p>
                    </CardContent>
                </Card>
            </div>

            {/* List Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 border-border/60 shadow-md">
                    <CardHeader className="bg-muted/20 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Proyectos Recientes</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs font-bold h-8">
                                <Link href="/admin/proyectos">Ir a Proyectos <ChevronRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentProjects.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic text-sm">
                                No hay actividad reciente.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentProjects.map((p) => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{p.nombre}</p>
                                            <p className="text-xs text-muted-foreground">Cliente: {(p.users as any)?.full_name || (p.users as any)?.email}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.estado === 'finalizado' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {p.estado}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {format(new Date(p.created_at), "dd MMM yyyy", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
