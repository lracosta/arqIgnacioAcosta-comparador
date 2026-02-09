"use client";

import {
    createClasificacion,
    updateClasificacionOrder,
    updateCriterioOrder,
    updateFactorOrder,
} from "@/app/admin/plantillas/actions";
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
import { useEffect, useState } from "react";
import ClasificacionItem from "./clasificacion-item";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

export default function TemplateEditor({
    version: initialVersion,
}: {
    version: any;
}) {
    // Local state for optimistic updates and DND responsiveness
    const [version, setVersion] = useState(initialVersion);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newClasificacionName, setNewClasificacionName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Sync state when server data changes (revalidatePath)
    useEffect(() => {
        setVersion(initialVersion);
    }, [initialVersion]);

    const handleCreateClasificacion = async () => {
        if (!newClasificacionName.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const result = await createClasificacion(version.id, newClasificacionName);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setNewClasificacionName("");
                setIsDialogOpen(false);
            }
        } catch (error) {
            toast.error("Error al crear la clasificación");
        } finally {
            setIsLoading(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, type, draggableId } = result;

        if (!destination || isLoading) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Helper to reorder array
        const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };

        const newVersion = { ...version };
        setIsLoading(true);

        try {
            // Case 1: Reordering Clasificaciones
            if (type === "clasificacion") {
                const items = reorder(
                    newVersion.clasificaciones,
                    source.index,
                    destination.index
                );
                newVersion.clasificaciones = items;
                setVersion(newVersion);

                const updates = items.map((item: any, index: number) => ({
                    id: item.id,
                    orden: index,
                }));
                await updateClasificacionOrder(updates);
                return;
            }

            // Case 2: Reordering Criterios
            if (type === "criterio") {
                const clasificacionId = source.droppableId.replace("criterios-", "");
                const clasificacionIndex = newVersion.clasificaciones.findIndex(
                    (c: any) => c.id === clasificacionId
                );

                if (clasificacionIndex === -1) return;

                const clasificacion = newVersion.clasificaciones[clasificacionIndex];
                const items = reorder(
                    clasificacion.criterios,
                    source.index,
                    destination.index
                );

                // Mutate deep clone properly
                newVersion.clasificaciones[clasificacionIndex] = {
                    ...clasificacion,
                    criterios: items,
                };
                setVersion(newVersion);

                const updates = items.map((item: any, index: number) => ({
                    id: item.id,
                    orden: index,
                }));
                await updateCriterioOrder(updates);
                return;
            }

            // Case 3: Reordering Factores
            if (type === "factor") {
                const criterioId = source.droppableId.replace("factores-", "");

                let found = false;
                for (let i = 0; i < newVersion.clasificaciones.length; i++) {
                    const clasif = newVersion.clasificaciones[i];
                    const critIndex = clasif.criterios.findIndex((c: any) => c.id === criterioId);

                    if (critIndex !== -1) {
                        const criterio = clasif.criterios[critIndex];
                        const items = reorder(criterio.factores, source.index, destination.index);

                        newVersion.clasificaciones[i].criterios[critIndex] = {
                            ...criterio,
                            factores: items
                        };
                        setVersion(newVersion);

                        const updates = items.map((item: any, index: number) => ({
                            id: item.id,
                            orden: index,
                        }));
                        await updateFactorOrder(updates);

                        found = true;
                        break;
                    }
                }
                if (!found) toast.error("Error al reordenar factores: Criterio no encontrado");
                return;
            }
        } catch (error) {
            toast.error("Error al reordenar los elementos");
            setVersion(initialVersion); // Rollback on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl font-bold">Estructura de la Plantilla</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Organiza clasificaciones, criterios y factores</p>
                    </div>
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" disabled={isLoading}>
                            <Plus className="mr-2 h-4 w-4" /> Agregar Clasificación
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-sm">Nueva Clasificación</DialogTitle>
                            <DialogDescription className="text-xs">
                                Cree una nueva categoría principal para agrupar criterios.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right text-xs">
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    value={newClasificacionName}
                                    onChange={(e) => setNewClasificacionName(e.target.value)}
                                    className="col-span-3 h-8 text-xs"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button size="sm" onClick={handleCreateClasificacion} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                Crear
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="clasificaciones" type="clasificacion" isDropDisabled={isLoading}>
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {version.clasificaciones?.length === 0 ? (
                                <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground bg-muted/10">
                                    <p className="text-sm">No hay clasificaciones creadas.</p>
                                    <Button variant="link" size="sm" onClick={() => setIsDialogOpen(true)} disabled={isLoading}>
                                        Comienza agregando una aquí
                                    </Button>
                                </div>
                            ) : (
                                version.clasificaciones?.map((clasificacion: any, index: number) => (
                                    <Draggable
                                        key={clasificacion.id}
                                        draggableId={clasificacion.id}
                                        index={index}
                                        isDragDisabled={isLoading}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <ClasificacionItem
                                                    clasificacion={clasificacion}
                                                />
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
        </div>
    );
}
