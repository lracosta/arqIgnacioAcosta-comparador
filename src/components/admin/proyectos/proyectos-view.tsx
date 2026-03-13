"use client";

import { useState } from "react";
import { Archive, ExternalLink, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ProyectoActions from "@/components/admin/proyectos/proyecto-actions";

interface ProyectosViewProps {
    proyectos: any[];
}

export default function ProyectosView({ proyectos }: ProyectosViewProps) {
    const [search, setSearch] = useState("");
    const [showFinished, setShowFinished] = useState(false);

    const filteredProyectos = proyectos?.filter(proyecto => {
        // Filter by state
        if (!showFinished && proyecto.estado === "finalizado") {
            return false;
        }

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            const nombreProyecto = proyecto.nombre.toLowerCase();
            const nombreCliente = ((proyecto.cliente as any)?.full_name || "").toLowerCase();
            const emailCliente = ((proyecto.cliente as any)?.email || "").toLowerCase();

            if (!nombreProyecto.includes(searchLower) && !nombreCliente.includes(searchLower) && !emailCliente.includes(searchLower)) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar proyecto o cliente..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="show-finished"
                        checked={showFinished}
                        onCheckedChange={(checked) => setShowFinished(checked === true)}
                    />
                    <Label htmlFor="show-finished" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground">
                        Mostrar finalizados
                    </Label>
                </div>
            </div>

            {/* List */}
            {filteredProyectos?.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                            <Archive className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-foreground">No hay proyectos</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                No se encontraron proyectos que coincidan con los filtros.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProyectos?.map((proyecto) => (
                        <Card key={proyecto.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/60 flex flex-col">
                            <CardHeader className="pb-4 bg-muted/10 relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                                        <div className="mb-2">
                                            <Badge variant={
                                                proyecto.estado === 'activo' ? 'outline' : 'secondary'
                                            } className={cn(
                                                "h-5 text-[9px] uppercase tracking-tighter font-black",
                                                proyecto.estado === 'activo' && "border-primary/30 text-primary bg-primary/[0.03]"
                                            )}>
                                                {proyecto.estado}
                                            </Badge>
                                        </div>
                                        <CardTitle
                                            className="text-lg leading-tight group-hover:text-primary transition-colors truncate mb-1"
                                            title={proyecto.nombre}
                                        >
                                            {proyecto.nombre.length > 15 ? `${proyecto.nombre.substring(0, 15)}...` : proyecto.nombre}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-xs">
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
