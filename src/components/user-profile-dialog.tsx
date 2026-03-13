"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface UserProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
}

export function UserProfileDialog({ open, onOpenChange, user }: UserProfileDialogProps) {
    const supabase = createClient();
    const router = useRouter();

    const [nome, setNome] = useState(user.user_metadata?.full_name || "");
    const [avatarUrl, setAvatarUrl] = useState<string>(user.user_metadata?.avatar_url || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initials = user.email?.substring(0, 2).toUpperCase() || "U";

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen debe ser menor a 2MB");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("El archivo debe ser una imagen");
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('user-profile')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('user-profile')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast.success("Imagen subida. No olvides guardar los cambios.");
        } catch (error: any) {
            toast.error(error.message || "Error al subir la imagen");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nome.trim()) {
            toast.error("El nombre no puede estar vacío");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Update auth.users metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: nome,
                    avatar_url: avatarUrl
                }
            });

            if (authError) throw authError;

            // 2. Update public.users table
            const { error: dbError } = await supabase.from('users').update({
                full_name: nome,
                avatar_url: avatarUrl
            }).eq('id', user.id);

            if (dbError) throw dbError;

            toast.success("Perfil actualizado con éxito");
            onOpenChange(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar perfil");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                        <DialogDescription>
                            Actualiza tu foto y nombre visible en la plataforma.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-6 py-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                                    <AvatarImage src={avatarUrl} alt="Avatar" />
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isLoading}
                                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">Max 2MB (JPG, PNG)</span>
                        </div>

                        {/* Name Input */}
                        <div className="grid w-full gap-2">
                            <Label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Nombre Completo
                            </Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="font-semibold"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || isUploading} className="bg-primary hover:bg-primary/90">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
