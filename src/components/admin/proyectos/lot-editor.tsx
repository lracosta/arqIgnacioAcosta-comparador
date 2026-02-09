"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, Edit, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { createLote, updateLote, deleteLote, updateLoteOrder } from "@/app/admin/proyectos/actions";

interface LotEditorProps {
    proyectoId: string;
    initialLotes: any[];
}

export default function LotEditor({ proyectoId, initialLotes }: LotEditorProps) {
    const [lotes, setLotes] = useState(initialLotes);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [nombre, setNombre] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [descripcion, setDescripcion] = useState("");

    useEffect(() => {
        setLotes(initialLotes);
    }, [initialLotes]);

    const handleCreateLote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !ubicacion.trim()) {
            toast.error("Nombre y ubicación son obligatorios");
            return;
        }

        setIsLoading(true);
        try {
            await createLote(proyectoId, nombre, ubicacion, descripcion);
            toast.success("Lote agregado");
            resetForm();
            setIsAddDialogOpen(false);
        } catch (error) {
            toast.error("Error al crear lote");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;

        setIsLoading(true);
        try {
            await updateLote(isEditing, nombre, ubicacion, descripcion, proyectoId);
            toast.success("Lote actualizado");
            setIsEditing(null);
            resetForm();
        } catch (error) {
            toast.error("Error al actualizar lote");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLote = async (id: string) => {
        setIsLoading(true);
        try {
            await deleteLote(id, proyectoId);
            toast.success("Lote eliminado");
        } catch (error) {
            toast.error("Error al eliminar lote");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setNombre("");
        setUbicacion("");
        setDescripcion("");
    };

    const startEditing = (lote: any) => {
        setNombre(lote.nombre);
        setUbicacion(lote.ubicacion);
        setDescripcion(lote.descripcion || "");
        setIsEditing(lote.id);
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;

        const newItems = Array.from(lotes);
        const [removed] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, removed);

        setLotes(newItems);

        const updates = newItems.map((item, index) => ({
            id: item.id,
            orden: index,
        }));

        await updateLoteOrder(proyectoId, updates);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Lotes del Proyecto</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Agregar Lote
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateLote}>
                            <DialogHeader>
                                <DialogTitle>Nuevo Lote</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre">Nombre del Lote</Label>
                                    <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Lote A - Los Alisos" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ubicacion">Ubicación / Dirección</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="ubicacion" className="pl-9" value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ej: Av. Central 450" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion">Descripción Adicional</Label>
                                    <Textarea id="descripcion" className="text-xs resize-none" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Superficie, servicios, etc." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Lote
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="lotes">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {lotes.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                                    <p className="text-sm text-muted-foreground">Aún no hay lotes en este proyecto.</p>
                                </div>
                            ) : (
                                lotes.map((lote, index) => (
                                    <Draggable key={lote.id} draggableId={lote.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all p-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div {...provided.dragHandleProps} className="mt-1 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                                                        <GripVertical className="h-5 w-5" />
                                                    </div>

                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-base">{lote.nombre}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <MapPin className="h-3 w-3" />
                                                            {lote.ubicacion}
                                                        </div>
                                                        {lote.descripcion && (
                                                            <p className="text-xs text-muted-foreground/80 mt-2 italic border-l-2 border-primary/20 pl-2">
                                                                {lote.descripcion}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEditing(lote)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar Lote?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Se eliminarán permanentemente el lote "{lote.nombre}" y todas sus evaluaciones asociadas.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteLote(lote.id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Edit Dialog */}
            <Dialog open={!!isEditing} onOpenChange={(open) => {
                if (!open) {
                    setIsEditing(null);
                    resetForm();
                }
            }}>
                <DialogContent>
                    <form onSubmit={handleUpdateLote}>
                        <DialogHeader>
                            <DialogTitle>Editar Lote</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre">Nombre del Lote</Label>
                                <Input id="edit-nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-ubicacion">Ubicación / Dirección</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="edit-ubicacion" className="pl-9" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-descripcion">Descripción Adicional</Label>
                                <Textarea id="edit-descripcion" className="text-xs resize-none" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
