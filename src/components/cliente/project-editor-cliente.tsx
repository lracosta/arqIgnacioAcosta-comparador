"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProyectoCliente } from "@/app/cliente/actions";

interface ProjectEditorClienteProps {
    proyecto: {
        id: string;
        nombre: string;
        descripcion: string | null;
    };
}

export default function ProjectEditorCliente({ proyecto }: ProjectEditorClienteProps) {
    const [nombre, setNombre] = useState(proyecto.nombre);
    const [descripcion, setDescripcion] = useState(proyecto.descripcion || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            toast.error("El nombre del proyecto es obligatorio");
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateProyectoCliente(proyecto.id, nombre, descripcion);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Proyecto actualizado correctamente");
            }
        } catch (error) {
            toast.error("Error al actualizar el proyecto");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="nombre-proyecto" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre del Proyecto</Label>
                    <Input
                        id="nombre-proyecto"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        className="h-10 font-bold"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="descripcion-proyecto" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción</Label>
                    <Textarea
                        id="descripcion-proyecto"
                        className="min-h-[80px] text-sm resize-none"
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="Descripción breve del proyecto..."
                    />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white font-bold">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </div>
        </form>
    );
}
