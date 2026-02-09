"use client";

import { createNewVersion } from "@/app/admin/plantillas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Creando..." : "Crear Versión"}
        </Button>
    );
}

const initialState = {
    error: "",
};

export function CreateVersionForm({ versiones }: { versiones: any[] }) {
    const [state, formAction] = useActionState(createNewVersion, initialState);

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Versión</Label>
                <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Versión 2.0 - Nuevos Criterios"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="Describa los cambios principales..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="fromVersionId">Copiar estructura de:</Label>
                <Select name="fromVersionId">
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar versión anterior (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">-- Nueva en blanco --</SelectItem>
                        {versiones.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                                Versión {v.version} - {v.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                    Si selecciona una versión anterior, se copiará toda su estructura.
                </p>
            </div>

            {state?.error && (
                <div className="text-sm font-medium text-destructive">
                    Error: {state.error}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => window.history.back()}
                >
                    Cancelar
                </Button>
                <SubmitButton />
            </div>
        </form>
    );
}
