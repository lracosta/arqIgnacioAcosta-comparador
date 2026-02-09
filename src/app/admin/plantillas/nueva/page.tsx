import { createClient } from "@/lib/supabase/server";
import { CreateVersionForm } from "@/components/admin/create-version-form";

export default async function NuevaPlantillaPage() {
    const supabase = await createClient();
    const { data: versiones, error } = await supabase
        .from("plantilla_versiones")
        .select("id, version, nombre")
        .order("version", { ascending: false });

    if (error) {
        console.error("Error fetching versions for selection:", error);
        // Continue with empty list or show error
    }

    const versionsList = versiones || [];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Nueva Versión de Plantilla</h1>
                <p className="text-muted-foreground">
                    Cree una nueva versión para comenzar a editar. Puede copiar la estructura de una versión anterior.
                </p>
            </div>

            <CreateVersionForm versiones={versionsList} />
        </div>
    );
}
