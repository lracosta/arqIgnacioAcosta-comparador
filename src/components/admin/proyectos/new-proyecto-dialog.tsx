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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProyecto } from "@/app/admin/proyectos/actions";

interface NewProyectoDialogProps {
    clientes: { id: string; full_name: string | null; email: string }[];
    activeVersion: { id: string; nombre: string; version: number } | null;
}

export default function NewProyectoDialog({ clientes, activeVersion }: NewProyectoDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [clienteId, setClienteId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }
        if (!clienteId) {
            toast.error("Debe seleccionar un cliente");
            return;
        }
        if (!activeVersion) {
            toast.error("No hay una versión de plantilla activa. Active una en el panel de Plantillas.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createProyecto(nombre, descripcion, clienteId, activeVersion.id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Proyecto creado exitosamente");
                setNombre("");
                setDescripcion("");
                setClienteId("");
                setIsOpen(false);
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Proyecto</DialogTitle>
                        <DialogDescription>
                            Cree un nuevo proyecto de comparación para un cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre" className="text-xs">Nombre del Proyecto</Label>
                            <Input
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Comparación Terrenos Zona Norte"
                                disabled={isLoading}
                                className="h-9"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="descripcion" className="text-xs">Descripción (opcional)</Label>
                            <Textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Breve descripción del objetivo..."
                                disabled={isLoading}
                                className="min-h-[80px] text-xs resize-none"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cliente" className="text-xs">Asignar Cliente</Label>
                            <Select
                                value={clienteId}
                                onValueChange={setClienteId}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="cliente" className="h-9">
                                    <SelectValue placeholder="Seleccione un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id}>
                                            {cliente.full_name || cliente.email}
                                        </SelectItem>
                                    ))}
                                    {clientes.length === 0 && (
                                        <div className="p-2 text-xs text-muted-foreground text-center">
                                            No hay clientes registrados
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Plantilla Aplicada</p>
                            <p className="text-xs text-foreground font-medium">
                                {activeVersion ? (
                                    `v${activeVersion.version} - ${activeVersion.nombre}`
                                ) : (
                                    <span className="text-destructive">NINGUNA (Active una plantilla primero)</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Proyecto
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
