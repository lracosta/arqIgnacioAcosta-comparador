"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteUser } from "./actions";
import { toast } from "sonner";

export default function DeleteUserButton({ id, name }: { id: string; name: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteUser(id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Usuario eliminado");
            }
        } catch (error) {
            toast.error("Error al eliminar usuario");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará al usuario <strong>{name}</strong> de la base de datos pública.
                        Tenga en cuenta que si no tiene permisos de administrador de Auth, el usuario aún podría iniciar sesión si su cuenta de Auth persiste.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
