import { createClient } from "@/lib/supabase/server";
import { Users, Mail, Shield, ShieldAlert, Trash2, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DeleteUserButton from "./delete-user-button";

export default async function UsuariosPage() {
    const supabase = await createClient();

    const { data: users } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gestione los clientes y administradores del sistema
                    </p>
                </div>
                <Button disabled>
                    <UserPlus className="mr-2 h-4 w-4" /> Invitar Usuario
                </Button>
            </div>

            <Card className="border-primary/10 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow>
                                <TableHead className="text-xs uppercase font-bold tracking-wider">Usuario</TableHead>
                                <TableHead className="text-xs uppercase font-bold tracking-wider">Rol</TableHead>
                                <TableHead className="text-xs uppercase font-bold tracking-wider">Email</TableHead>
                                <TableHead className="text-xs uppercase font-bold tracking-wider">Fecha de Alta</TableHead>
                                <TableHead className="text-right text-xs uppercase font-bold tracking-wider px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id} className="group hover:bg-primary/5 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{user.full_name || "Sin nombre"}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">#{user.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="h-6 gap-1 px-2 text-[10px] font-bold uppercase tracking-wide">
                                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 opacity-40" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(user.created_at), "PPP", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DeleteUserButton id={user.id} name={user.full_name || user.email} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!users || users.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                        No se encontraron usuarios registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
