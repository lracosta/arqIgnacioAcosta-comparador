"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { loginSchema, LoginSchema } from "@/lib/schemas/auth";
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
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginSchema) {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (error) {
            form.setError("root", {
                message: error.message,
            });
            setLoading(false);
            return;
        }

        // Redirect handled by middleware or subsequent fetch
        // But let's verify user role to redirect correctly
        const { data: { user } } = await supabase.auth.getUser();

        // We can fetch role from DB or metadata if present
        // For now, let's redirect to appropriate dashboard
        // The middleware might interfere if we just push, but it's fine.

        // Check role in DB public.users
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user?.id)
            .single();

        if (userData?.role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/cliente/dashboard');
        }

        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
                <p className="text-muted-foreground">
                    Ingresa tus credenciales para acceder
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

                    {form.formState.errors.root && (
                        <div className="text-sm font-medium text-destructive">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Link
                            href="/recuperar"
                            className="text-sm text-primary hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Iniciando sesión..." : "Ingresar"}
                    </Button>

                    <div className="mt-4 text-center text-sm">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="underline hover:text-primary">
                            Regístrate
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
}
