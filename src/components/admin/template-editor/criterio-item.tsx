"use client";

import {
    deleteCriterio,
    updateCriterio,
    createFactor,
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
import { useState, useEffect } from "react";
import FactorItem from "./factor-item";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CriterioItem({ criterio }: { criterio: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [name, setName] = useState(criterio.nombre);
    const [score, setScore] = useState(criterio.puntaje_maximo);
    const [description, setDescription] = useState(criterio.descripcion || "");

    const [isAddFactorOpen, setIsAddFactorOpen] = useState(false);
    const [newFactorName, setNewFactorName] = useState("");
    const [newFactorValue, setNewFactorValue] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setName(criterio.nombre);
        setScore(criterio.puntaje_maximo);
        setDescription(criterio.descripcion || "");
    }, [criterio]);

    const handleUpdate = async () => {
        if (!name.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const result = await updateCriterio(criterio.id, name, score, description);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Error al actualizar el criterio");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await deleteCriterio(criterio.id);
        } catch (error) {
            toast.error("Error al eliminar el criterio");
            setIsLoading(false);
        }
    };

    const handleCreateFactor = async () => {
        if (!newFactorName.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const result = await createFactor(criterio.id, newFactorName, newFactorValue);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setNewFactorName("");
                setNewFactorValue(0);
                setIsAddFactorOpen(false);
                setIsExpanded(true);
            }
        } catch (error) {
            toast.error("Error al crear el factor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-border/50 bg-card rounded-lg overflow-hidden transition-all shadow-sm">
            <div className="flex items-start justify-between py-2 px-3 bg-secondary/5 group">
                <div className="flex items-start gap-2 flex-1 pt-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing mt-1" />

                    {isEditing ? (
                        <div className="flex flex-col gap-3 flex-1 mr-2 bg-background p-3 rounded-md border border-primary/20 shadow-inner">
                            <div className="grid gap-2">
                                <div className="grid grid-cols-4 items-center gap-2">
                                    <Label className="text-[10px] text-right">Nombre</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-7 text-xs col-span-2 font-semibold"
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                    <Input
                                        type="number"
                                        value={score}
                                        onChange={(e) => setScore(Number(e.target.value))}
                                        className="h-7 text-xs col-span-1"
                                        placeholder="Pts"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-2">
                                    <Label className="text-[10px] text-right mt-1">Descripción</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="text-[11px] min-h-[60px] col-span-3 resize-none"
                                        placeholder="Descripción del criterio..."
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                                <Button size="sm" className="h-7 px-3 text-[11px]" onClick={handleUpdate} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                    Guardar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-3 text-[11px]"
                                    disabled={isLoading}
                                    onClick={() => {
                                        setName(criterio.nombre);
                                        setScore(criterio.puntaje_maximo);
                                        setDescription(criterio.descripcion || "");
                                        setIsEditing(false);
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1" onClick={() => setIsExpanded(!isExpanded)}>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-sm">{criterio.nombre}</span>
                                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-secondary-foreground font-medium">
                                    {criterio.puntaje_maximo} pts
                                </span>
                                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                            </div>
                            {criterio.descripcion && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-all">
                                    {criterio.descripcion}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={isLoading}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                    >
                        <Edit className="h-3 w-3" />
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive/70 hover:text-destructive"
                                disabled={isLoading}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Criterio?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Se eliminarán todos los factores asociados al criterio "{criterio.nombre}".
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

            <div className={cn("px-3 pb-2 pt-1 transition-all duration-200", !isExpanded && "hidden")}>
                <Droppable droppableId={`factores-${criterio.id}`} type="factor">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-1 ml-5 border-l border-border/50 pl-3"
                        >
                            {criterio.factores?.length === 0 ? (
                                <div className="text-[11px] text-muted-foreground italic py-1">
                                    Sin factores definidos.
                                </div>
                            ) : (
                                criterio.factores?.map((factor: any, index: number) => (
                                    <Draggable key={factor.id} draggableId={factor.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <FactorItem factor={factor} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}

                            <div className="pt-1">
                                <Dialog open={isAddFactorOpen} onOpenChange={setIsAddFactorOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="w-full h-7 text-[11px] border border-dashed border-border hover:bg-muted/50" disabled={isLoading}>
                                            <Plus className="mr-1.5 h-3 w-3" /> Agregar Factor
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-sm">Nuevo Factor</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-3 py-2">
                                            <div className="grid grid-cols-4 items-center gap-3">
                                                <Label htmlFor="factorName" className="text-right text-xs">Nombre</Label>
                                                <Input
                                                    id="factorName"
                                                    value={newFactorName}
                                                    onChange={(e) => setNewFactorName(e.target.value)}
                                                    className="col-span-3 h-8 text-xs"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-3">
                                                <Label htmlFor="factorValue" className="text-right text-xs">Valor (0-1)</Label>
                                                <Input
                                                    id="factorValue"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="1"
                                                    value={newFactorValue}
                                                    onChange={(e) => setNewFactorValue(Number(e.target.value))}
                                                    className="col-span-3 h-8 text-xs"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button size="sm" onClick={handleCreateFactor} disabled={isLoading}>
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
