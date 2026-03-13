import { createClient } from "@/lib/supabase/server";
import { Plus, Archive, ExternalLink, MoreVertical, Trash2, Edit, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import NewProyectoDialog from "@/components/admin/proyectos/new-proyecto-dialog";
import ProyectosView from "@/components/admin/proyectos/proyectos-view";

export default async function ProyectosPage() {
    const supabase = await createClient();

    // Fetch proyectos with their clients and versions
    const { data: proyectos } = await supabase
        .from("proyectos")
        .select(`
            *,
            cliente:users!cliente_id(full_name, email),
            version:plantilla_versiones!plantilla_version_id(nombre, version)
        `)
        .order("created_at", { ascending: false });

    // Fetch clients for the dialog
    const { data: clientes } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "cliente")
        .order("full_name");

    // Fetch active version
    const { data: activeVersion } = await supabase
        .from("plantilla_versiones")
        .select("id, nombre, version")
        .eq("activa", true)
        .single();

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestione las comparaciones de lotes y visualice resultados para sus clientes.
                    </p>
                </div>
                <NewProyectoDialog
                    clientes={clientes || []}
                    activeVersion={activeVersion}
                />
            </div>

            <ProyectosView proyectos={proyectos || []} />
        </div>
    );
}
