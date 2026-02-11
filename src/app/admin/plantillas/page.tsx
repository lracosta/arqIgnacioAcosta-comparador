
import { createClient } from "@/lib/supabase/server";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import VersionActions from "@/components/admin/version-actions";

export default async function PlantillasPage() {
    const supabase = await createClient();
    const { data: versiones, error } = await supabase
        .from("plantilla_versiones")
        .select("*")
        .order("version", { ascending: false });

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Plantillas</h1>
                    <p className="text-muted-foreground mt-1">
                        Defina y administre la estructura de criterios de evaluación del sistema.
                    </p>
                </div>
                <Button asChild className="shadow-sm">
                    <Link href="/admin/plantillas/nueva">Nueva Versión</Link>
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-xl shadow-sm">
                    <p className="font-bold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        Error al cargar las plantillas
                    </p>
                    <p className="text-sm mt-1">{error.message}</p>
                </div>
            )}

            {!error && versiones?.length === 0 && (
                <Card className="border-dashed border-2 bg-muted/5">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                            <Archive className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">No hay plantillas</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Cree su primera versión de plantilla para empezar a definir los criterios de evaluación.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="mt-4">
                            <Link href="/admin/plantillas/nueva">Crear primera versión</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {!error && versiones?.map((version) => (
                    <Card key={version.id} className={cn(
                        "group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col",
                        version.activa ? "border-primary/50 ring-1 ring-primary/10 shadow-md" : "border-border/60"
                    )}>
                        <CardHeader className={cn(
                            "pb-4 relative",
                            version.activa ? "bg-primary/[0.03]" : "bg-muted/10"
                        )}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl">Versión {version.version}</CardTitle>
                                        {version.activa && (
                                            <Badge variant="default" className="bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider">
                                                Activa
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-xs font-medium">
                                        Creada el {format(new Date(version.created_at), "PPP", { locale: es })}
                                    </CardDescription>
                                </div>
                                <VersionActions version={version} />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 flex-1 flex flex-col justify-between space-y-6">
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {version.descripcion || "Sin descripción proporcionada para esta versión."}
                            </p>

                            <Button variant="outline" asChild className="w-full h-10 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                                <Link href={`/admin/plantillas/${version.id}`}>
                                    Editar Estructura
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
