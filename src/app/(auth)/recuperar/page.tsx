"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: ForgotPasswordSchema) {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });

        if (error) {
            form.setError("root", {
                message: error.message,
            });
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    }

    if (success) {
        return (
            <div className="space-y-6 text-center">
                <h1 className="text-2xl font-bold">Revise su correo</h1>
                <p className="text-muted-foreground">
                    Hemos enviado un enlace para restablecer su contraseña al correo proporcionado.
                </p>
                <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Volver al inicio de sesión</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Recuperar Contraseña</h1>
                <p className="text-muted-foreground">
                    Ingrese su correo electrónico y le enviaremos instrucciones.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="nombre@ejemplo.com" {...field} />
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
                        {loading ? "Enviando..." : "Enviar enlace"}
                    </Button>

                    <Button variant="link" asChild className="w-full">
                        <Link href="/login">Volver al inicio de sesión</Link>
                    </Button>
                </form>
            </Form>
        </div>
    );
}
