"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return false;
        }

        // Redirect based on role or default dashboard
        // We'll handle redirection in the page component or middleware usually, 
        // but here we can just refresh or push.
        // The middleware will handle redirection if we refresh.
        // However, for better UX, we can check role here if needed.
        // For now, just return success.

        setLoading(false);
        return true;
    };

    const signOut = async (): Promise<void> => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push("/login");
        setLoading(false);
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/callback?next=/update-password`,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
            return false;
        }

        toast.success("Se ha enviado un correo para restablecer tu contraseña.");
        return true;
    };

    const updatePassword = async (password: string): Promise<boolean> => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        setLoading(false);

        if (error) {
            toast.error(error.message);
            return false;
        }

        toast.success("Contraseña actualizada exitosamente.");
        return true;
    };

    const signUp = async (email: string, password: string, full_name: string): Promise<boolean> => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    role: 'cliente' // Default role
                }
            }
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
            return false;
        }

        return true;
    };

    return {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword
    };
}
