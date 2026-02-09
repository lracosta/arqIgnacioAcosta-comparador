"use client";

import { updatePasswordSchema, UpdatePasswordSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<UpdatePasswordSchema>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: UpdatePasswordSchema) {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: values.password,
        });

        if (error) {
            form.setError("root", {
                message: error.message,
            });
            setLoading(false);
            return;
        }

        setLoading(false);
        router.push("/login?message=Contraseña actualizada exitosamente");
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Nueva Contraseña</h1>
                <p className="text-muted-foreground">
                    Ingrese su nueva contraseña y confírmela.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmar Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.formState.errors.root && (
                        <div className="text-sm font-medium text-destructive">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
