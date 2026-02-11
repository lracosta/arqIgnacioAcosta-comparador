"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProyectoCliente } from "../../app/cliente/actions";
import { useRouter } from "next/navigation";

interface NewProyectoDialogProps {
    activeVersion: { id: string; nombre: string; version: number } | null;
}

export default function NewProyectoDialog({ activeVersion }: NewProyectoDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }
        if (!activeVersion) {
            toast.error("No hay una versión de plantilla activa disponible.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createProyectoCliente(nombre, descripcion, activeVersion.id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Proyecto creado exitosamente");
                setNombre("");
                setDescripcion("");
                setIsOpen(false);
                router.refresh();
                if (result.data) {
                    router.push(`/cliente/comparacion/${result.data.id}`);
                }
            }
        } catch (error) {
            toast.error("Error al crear el proyecto");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="rounded-full px-6 shadow-lg hover:shadow-xl transition-all gap-2">
                    <Plus className="h-5 w-5" /> Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nuevo Proyecto de Comparación</DialogTitle>
                        <DialogDescription>
                            Defina el nombre y descripción de su nueva comparativa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Nombre del Proyecto
                            </Label>
                            <Input
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Comparación Lotes - Zona Norte"
                                disabled={isLoading}
                                className="h-10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Descripción (opcional)
                            </Label>
                            <Textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Notas adicionales sobre esta comparación..."
                                disabled={isLoading}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Metodología de Evaluación</p>
                            <p className="text-xs text-foreground font-medium">
                                {activeVersion ? (
                                    `v${activeVersion.version} - ${activeVersion.nombre}`
                                ) : (
                                    <span className="text-destructive">Error: No hay plantilla activa</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="px-8">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear e Iniciar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
