
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
import VersionActions from "@/components/admin/version-actions";

export default async function PlantillasPage() {
    const supabase = await createClient();
    const { data: versiones, error } = await supabase
        .from("plantilla_versiones")
        .select("*")
        .order("version", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gestión de Plantillas</h1>
                <Button asChild>
                    <Link href="/admin/plantillas/nueva">Nueva Versión</Link>
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-md">
                    <p className="font-medium">Error al cargar las plantillas</p>
                    <p className="text-sm">{error.message}</p>
                    <pre className="text-[10px] mt-2">{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {!error && versiones?.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No hay plantillas creadas todavía.</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/admin/plantillas/nueva">Crear la primera versión</Link>
                    </Button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {!error && versiones?.map((version) => (
                    <Card key={version.id} className={version.activa ? "border-primary shadow-md" : ""}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>Versión {version.version}</CardTitle>
                                {version.activa && <Badge variant="default">Activa</Badge>}
                            </div>
                            <CardDescription>
                                Creada el {format(new Date(version.created_at), "dd/MM/yyyy")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {version.descripcion || "Sin descripción"}
                            </p>
                            <div className="flex justify-between gap-2">
                                <Button variant="outline" asChild className="w-full">
                                    <Link href={`/admin/plantillas/${version.id}`}>
                                        Editar Estructura
                                    </Link>
                                </Button>
                                <VersionActions version={version} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}
