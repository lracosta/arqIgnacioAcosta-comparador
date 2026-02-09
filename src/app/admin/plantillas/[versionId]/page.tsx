
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import TemplateEditor from "@/components/admin/template-editor/template-editor";

export default async function PlantillaEditorPage({
    params,
}: {
    params: Promise<{ versionId: string }>;
}) {
    const { versionId } = await params;
    const supabase = await createClient();

    const { data: version, error } = await supabase
        .from("plantilla_versiones")
        .select(
            `
      *,
      clasificaciones (
        *,
        criterios (
          *,
          factores (
            *
          )
        )
      )
    `
        )
        .eq("id", versionId)
        .single();

    if (error) {
        console.error("Error fetching version:", error);
        return <div>Error al cargar la plantilla.</div>;
    }

    // Sort by order
    version.clasificaciones.sort((a: any, b: any) => a.orden - b.orden);
    version.clasificaciones.forEach((c: any) => {
        c.criterios.sort((a: any, b: any) => a.orden - b.orden);
        c.criterios.forEach((cr: any) => {
            cr.factores.sort((a: any, b: any) => a.orden - b.orden);
        });
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        Editando: {version.nombre}
                        {version.activa && <Badge variant="default">Activa</Badge>}
                    </h1>
                    <p className="text-muted-foreground">{version.descripcion}</p>
                </div>
            </div>

            <TemplateEditor version={version} />
        </div>
    );
}
