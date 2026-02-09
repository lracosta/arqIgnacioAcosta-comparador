"use client";

import {
    deleteClasificacion,
    updateClasificacion,
    createCriterio,
} from "@/app/admin/plantillas/actions";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Edit, GripVertical, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import CriterioItem from "./criterio-item";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ClasificacionItem({
    clasificacion,
}: {
    clasificacion: any;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [name, setName] = useState(clasificacion.nombre);

    const [isAddCriterioOpen, setIsAddCriterioOpen] = useState(false);
    const [newCriterioName, setNewCriterioName] = useState("");
    const [newCriterioDescription, setNewCriterioDescription] = useState("");
    const [newCriterioScore, setNewCriterioScore] = useState(100);

    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const result = await updateClasificacion(clasificacion.id, name);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Error al actualizar la clasificación");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await deleteClasificacion(clasificacion.id);
        } catch (error) {
            toast.error("Error al eliminar la clasificación");
            setIsLoading(false);
        }
    };

    const handleCreateCriterio = async () => {
        if (!newCriterioName.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const result = await createCriterio(clasificacion.id, newCriterioName, newCriterioScore, newCriterioDescription);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setNewCriterioName("");
                setNewCriterioDescription("");
                setNewCriterioScore(100);
                setIsAddCriterioOpen(false);
                setIsExpanded(true);
            }
        } catch (error) {
            toast.error("Error al crear el criterio");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-primary/20 bg-background rounded-xl overflow-hidden shadow-sm transition-all border-l-4 border-l-primary/60">
            <div className="flex items-center justify-between py-3 px-4 bg-primary/5 group">
                <div className="flex items-center gap-3 flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-primary/10 text-primary"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>

                    <GripVertical className="h-5 w-5 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />

                    {isEditing ? (
                        <div className="flex gap-2 items-center flex-1">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 text-base font-semibold flex-1"
                                autoFocus
                                disabled={isLoading}
                            />
                            <Button onClick={handleUpdate} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Guardar
                            </Button>
                            <Button
                                variant="ghost"
                                disabled={isLoading}
                                onClick={() => {
                                    setName(clasificacion.nombre);
                                    setIsEditing(false);
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 flex-1">
                            <h3
                                className="text-lg font-bold text-foreground cursor-pointer"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {clasificacion.nombre}
                            </h3>
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary mt-0.5" />}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isLoading}
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Clasificación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Se eliminarán todos los criterios y factores asociados a "{clasificacion.nombre}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className={cn("px-4 pb-4 pt-2", !isExpanded && "hidden")}>
                <Droppable droppableId={`criterios-${clasificacion.id}`} type="criterio">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-3 ml-6 border-l-2 border-primary/5 pl-5"
                        >
                            {clasificacion.criterios?.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic py-2">
                                    No hay criterios en esta clasificación.
                                </div>
                            ) : (
                                clasificacion.criterios?.map((criterio: any, index: number) => (
                                    <Draggable key={criterio.id} draggableId={criterio.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <CriterioItem criterio={criterio} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}

                            <div className="pt-2">
                                <Dialog open={isAddCriterioOpen} onOpenChange={setIsAddCriterioOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full h-9 text-xs border-dashed border-primary/30 hover:bg-primary/5" disabled={isLoading}>
                                            <Plus className="mr-2 h-4 w-4" /> Nuevo Criterio
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-sm">Nuevo Criterio</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-3 py-2">
                                            <div className="grid grid-cols-4 items-center gap-3">
                                                <Label htmlFor="criterioName" className="text-right text-xs">Nombre</Label>
                                                <Input
                                                    id="criterioName"
                                                    value={newCriterioName}
                                                    onChange={(e) => setNewCriterioName(e.target.value)}
                                                    className="col-span-3 h-9 text-xs"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-3">
                                                <Label htmlFor="criterioDescription" className="text-right text-xs">Descripción</Label>
                                                <Textarea
                                                    id="criterioDescription"
                                                    value={newCriterioDescription}
                                                    onChange={(e) => setNewCriterioDescription(e.target.value)}
                                                    className="col-span-3 text-xs resize-none"
                                                    placeholder="Breve descripción..."
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-3">
                                                <Label htmlFor="criterioScore" className="text-right text-xs">Puntaje Máx</Label>
                                                <Input
                                                    id="criterioScore"
                                                    type="number"
                                                    value={newCriterioScore}
                                                    onChange={(e) => setNewCriterioScore(Number(e.target.value))}
                                                    className="col-span-3 h-9 text-xs"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button size="sm" onClick={handleCreateCriterio} disabled={isLoading}>
                                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                Crear
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                </Droppable>
            </div>
        </div>
    );
}
