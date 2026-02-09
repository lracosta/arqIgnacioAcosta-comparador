"use client";

import {
    deleteFactor,
    updateFactor,
} from "@/app/admin/plantillas/actions";
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
import { Input } from "@/components/ui/input";
import { Check, Edit, GripVertical, Trash2, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FactorItem({ factor }: { factor: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(factor.nombre);
    const [value, setValue] = useState(factor.valor || 0);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const result = await updateFactor(factor.id, name, value);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Error al actualizar el factor");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await deleteFactor(factor.id);
        } catch (error) {
            toast.error("Error al eliminar el factor");
            setIsLoading(false);
        }
    };

    return (
        <div className="group/factor py-1 px-2 hover:bg-muted/30 rounded-md transition-colors border border-transparent hover:border-border/40">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />

                    {isEditing ? (
                        <div className="flex gap-2 items-center flex-1">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-7 text-xs flex-1"
                                autoFocus
                                disabled={isLoading}
                            />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">Valor:</span>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={value}
                                    onChange={(e) => setValue(Number(e.target.value))}
                                    className="h-7 w-16 text-xs"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button size="icon" className="h-7 w-7" onClick={handleUpdate} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                disabled={isLoading}
                                onClick={() => {
                                    setName(factor.nombre);
                                    setValue(factor.valor);
                                    setIsEditing(false);
                                }}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground/80 lowercase first-letter:uppercase">{factor.nombre}</span>
                                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-bold">
                                    {factor.valor}
                                </Badge>
                                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                            </div>

                            <div className="opacity-0 group-hover/factor:opacity-100 flex gap-0.5 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={isLoading}
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive/60 hover:text-destructive"
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar Factor?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará permanentemente el factor "{factor.nombre}".
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
                    )}
                </div>
            </div>
        </div>
    );
}
