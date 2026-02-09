"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { registerSchema } from "@/lib/schemas/auth";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const auth = useAuth();
    const router = useRouter();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            full_name: "",
        },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        try {
            const success = await auth.signUp(values.email, values.password, values.full_name);
            if (success) {
                toast.success("Cuenta creada exitosamente. Por favor verifica tu correo.");
                // Optional: redirect to login or check-email page
                router.push("/login?registered=true");
            }
        } catch (error) {
            // Error handling is inside useAuth mostly, but just in case
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-4 sm:mx-0">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
                <CardDescription className="text-center">
                    Ingresa tus datos para registrarte
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                        <Input type="password" placeholder="******" {...field} />
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
                                    <FormLabel>Confirmar contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrarse
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="underline hover:text-primary">
                        Inicia sesión
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
