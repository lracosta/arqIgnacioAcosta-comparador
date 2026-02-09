"use client";

import { activateVersion, deleteVersion } from "@/app/admin/plantillas/actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export default function VersionActions({ version }: { version: any }) {
    const handleActivate = async () => {
        try {
            await activateVersion(version.id);
            toast.success(`Versión ${version.version} activada correctamente.`);
        } catch (error) {
            toast.error("Error al activar la versión.");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteVersion(version.id);
            toast.success("Versión eliminada correctamente.");
        } catch (error) {
            toast.error("Error al eliminar la versión.");
        }
    };

    return (
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(version.id)}>
                        Copiar ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {!version.activa && (
                        <DropdownMenuItem onClick={handleActivate}>
                            <Play className="mr-2 h-4 w-4" /> Activar
                        </DropdownMenuItem>
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Eliminará permanentemente la versión {version.version} y todos sus datos asociados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
