"use client";

import { useState } from "react";
import { MoreVertical, Archive, ArchiveRestore, Trash2, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProyecto, deleteProyecto } from "@/app/admin/proyectos/actions";
import { toast } from "sonner";

interface ProyectoActionsProps {
    proyecto: any;
}

export default function ProyectoActions({ proyecto }: ProyectoActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    const [nombre, setNombre] = useState(proyecto.nombre);
    const [descripcion, setDescripcion] = useState(proyecto.descripcion || "");

    const handleToggleEstado = async () => {
        setIsLoading(true);
        const nuevoEstado = proyecto.estado === "activo" ? "archivado" : "activo";
        try {
            await updateProyecto(
                proyecto.id,
                proyecto.nombre,
                proyecto.descripcion,
                proyecto.cliente_id,
                nuevoEstado
            );
            toast.success(`Proyecto ${nuevoEstado === 'activo' ? 'activado' : 'archivado'}`);
        } catch (error) {
            toast.error("Error al cambiar estado");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteProyecto(proyecto.id);
            toast.success("Proyecto eliminado");
        } catch (error) {
            toast.error("Error al eliminar proyecto");
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleEditDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProyecto(
                proyecto.id,
                nombre,
                descripcion,
                proyecto.cliente_id,
                proyecto.estado
            );
            toast.success("Detalles del proyecto actualizados");
            setIsEditDialogOpen(false);
        } catch (error) {
            toast.error("Error al actualizar detalles");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="h-4 w-4" /> Editar Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleToggleEstado}>
                        {proyecto.estado === "activo" ? (
                            <>
                                <Archive className="h-4 w-4" /> Archivar Proyecto
                            </>
                        ) : (
                            <>
                                <ArchiveRestore className="h-4 w-4" /> Activar Proyecto
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" /> Eliminar Proyecto
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el proyecto <strong>{proyecto.nombre}</strong>,
                            todos sus lotes y evaluaciones asociadas. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                    setNombre(proyecto.nombre);
                    setDescripcion(proyecto.descripcion || "");
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Detalles</DialogTitle>
                        <DialogDescription>Modifique el nombre o descripción del proyecto.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditDetails} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nombre">Nombre</Label>
                            <Input
                                id="edit-nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-descripcion">Descripción (opcional)</Label>
                            <Textarea
                                id="edit-descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
