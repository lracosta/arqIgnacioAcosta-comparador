"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function UserNav() {
    const { user, loading, signOut } = useAuth();

    if (loading) {
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (!user) return null;

    const initials = user.email?.substring(0, 2).toUpperCase() || "U";
    const name = user.user_metadata?.full_name || user.email?.split("@")[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-primary/10 p-0 hover:bg-primary/5 transition-all">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                    <Settings className="h-4 w-4" />
                    <span>Ajustes</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
