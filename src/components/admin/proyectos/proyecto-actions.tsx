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
import { updateProyecto, deleteProyecto } from "@/app/admin/proyectos/actions";
import { toast } from "sonner";

interface ProyectoActionsProps {
    proyecto: any;
}

export default function ProyectoActions({ proyecto }: ProyectoActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
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
        </>
    );
}
