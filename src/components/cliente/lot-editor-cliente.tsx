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
import { createLoteCliente, updateLoteCliente, deleteLoteCliente, updateLoteOrderCliente } from "@/app/cliente/actions";

interface LotEditorClienteProps {
    proyectoId: string;
    initialLotes: any[];
}

export default function LotEditorCliente({ proyectoId, initialLotes }: LotEditorClienteProps) {
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
            await createLoteCliente(proyectoId, nombre, ubicacion, descripcion);
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
            await updateLoteCliente(isEditing, nombre, ubicacion, descripcion, proyectoId);
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
            await deleteLoteCliente(id, proyectoId);
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

        await updateLoteOrderCliente(proyectoId, updates);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Lotes a Comparar</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 border-dashed hover:border-primary hover:text-primary transition-all">
                            <Plus className="mr-1 h-3.5 w-3.5" /> Agregar Lote
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateLote}>
                            <DialogHeader>
                                <DialogTitle>Agregar Nuevo Lote</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</Label>
                                    <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Lote A - Los Alisos" className="h-10" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ubicacion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ubicación</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="ubicacion" className="pl-9 h-10" value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ej: Av. Central 450" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas (opcional)</Label>
                                    <Textarea id="descripcion" className="min-h-[80px] text-sm resize-none" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Superficie, orientación, servicios..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Lote
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="lotes-cliente">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {lotes.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-muted/5 group hover:bg-muted/10 transition-colors">
                                    <p className="text-xs font-medium text-muted-foreground">Aún no ha agregado lotes para comparar.</p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">Presione "Agregar Lote" para comenzar.</p>
                                </div>
                            ) : (
                                lotes.map((lote, index) => (
                                    <Draggable key={lote.id} draggableId={lote.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="group relative bg-card rounded-xl border border-border/60 hover:border-primary/30 shadow-sm hover:shadow-md transition-all p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div {...provided.dragHandleProps} className="text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm truncate">{lote.nombre}</h3>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                                            <MapPin className="h-2.5 w-2.5" />
                                                            {lote.ubicacion}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); startEditing(lote); }}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar Lote?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Se eliminará permanentemente el lote "{lote.nombre}".
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
                                <Label htmlFor="edit-nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</Label>
                                <Input id="edit-nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="h-10" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-ubicacion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ubicación</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="edit-ubicacion" className="pl-9 h-10" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas</Label>
                                <Textarea id="edit-descripcion" className="min-h-[80px] text-sm resize-none" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
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
