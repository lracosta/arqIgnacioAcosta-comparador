"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, Edit, Layers, ChevronLeft } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { finalizarProyecto } from "@/app/cliente/proyecto/[proyectoId]/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LotEditorCliente from "./lot-editor-cliente";
import ProjectEditorCliente from "./project-editor-cliente";

// ── Styles ──────────────────────────────────────────────────────────────────────
const s = {
    // Layout
    root:           "min-h-[calc(100vh-64px)] bg-[#F8FAFC]",
    header:         "bg-card border-b px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-40",
    headerLeft:     "flex items-center gap-4",
    headerIcon:     "h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-xl flex items-center justify-center transition-colors cursor-pointer",
    projectTitle:   "text-xl font-black tracking-tight leading-none",
    projectSubtitle:"text-xs text-muted-foreground mt-1 font-medium italic",

    // Tabs
    tabsList:       "bg-muted/20 p-1 rounded-xl h-auto border border-border/40 inline-flex",
    tabTrigger:     "rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground",

    // Main content
    main:           "max-w-4xl mx-auto p-8 space-y-8",

    // Config Cards
    mgmtCard:       "border-border/60 shadow-xl rounded-3xl overflow-hidden",
    mgmtCardHeader: "bg-muted/10 border-b pb-6",
    mgmtIconBlue:   "h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-500/20",
    mgmtIconPrimary:"h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20",
    mgmtTitle:      "text-2xl font-black tracking-tight",

    // Finalization zone
    finCard:        "border-border/60 shadow-lg rounded-3xl overflow-hidden border-orange-200 bg-orange-50/20",
    finHeader:      "bg-orange-50/50 border-b border-orange-100 py-4",
    finHeaderTitle: "text-sm font-black uppercase tracking-widest text-orange-800 flex items-center gap-2",
    finContent:     "p-8",
    finLayout:      "flex flex-col md:flex-row gap-8 items-start md:items-center",
    finTitle:       "font-bold text-lg text-orange-950",
    finDescription: "text-sm text-orange-800/70 leading-relaxed",
    finInfoGrid:    "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2",
    finInfoBox:     "bg-white/50 p-3 rounded-xl border border-orange-200",
    finInfoLabel:   "text-[9px] font-black uppercase tracking-widest text-orange-800/60 block mb-1",
    finInfoValue:   "text-sm font-bold truncate",
    finStatusBadge: "bg-orange-200 text-orange-800 border-none font-bold uppercase text-[9px]",
    finDoneBadge:   "bg-green-500 text-white border-none font-black px-6 py-3 h-auto text-sm w-full md:w-auto",
    finBtn:         "w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black shadow-xl shadow-orange-200 px-8 py-6 rounded-2xl",
    finConfirmBtn:  "bg-orange-600 hover:bg-orange-700",
} as const;

interface ManagementInterfaceProps {
    proyecto: any;
    lotes: any[];
    readOnly?: boolean;
}

export default function ManagementInterface({
    proyecto,
    lotes,
    readOnly = false,
}: ManagementInterfaceProps) {
    const router = useRouter();
    const [isFinalizing, setIsFinalizing] = useState(false);

    const handleFinalizar = async () => {
        setIsFinalizing(true);
        try {
            const result = await finalizarProyecto(proyecto.id);
            if (result.success) {
                toast.success("Proyecto finalizado y guardado correctamente");
                router.push("/cliente/dashboard");
            } else {
                toast.error(result.error || "Error al finalizar el proyecto");
            }
        } catch (error) {
            toast.error("Error al finalizar el proyecto");
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <div className={s.root}>
            {/* Project Header */}
            <header className={s.header}>
                <div className={s.headerLeft}>
                    <Link href="/cliente/dashboard" className={s.headerIcon}>
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className={s.projectTitle}>{proyecto.nombre}</h1>
                        <p className={s.projectSubtitle}>
                            Gestión y Configuración del Proyecto
                        </p>
                    </div>
                </div>
            </header>

            <main className={s.main}>
                <Tabs defaultValue="datos" className="w-full">
                    <TabsList className={s.tabsList}>
                        <TabsTrigger value="datos" className={s.tabTrigger}>Datos del Proyecto</TabsTrigger>
                        <TabsTrigger value="lotes" className={s.tabTrigger}>Lotes</TabsTrigger>
                        <TabsTrigger value="finalizacion" className={s.tabTrigger}>Zona de Finalización</TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-6">
                        <TabsContent value="datos" className="focus-visible:outline-none focus-visible:ring-0">
                            <Card className={s.mgmtCard}>
                                <CardHeader className={s.mgmtCardHeader}>
                                    <div className="flex items-center gap-3">
                                        <div className={s.mgmtIconBlue}>
                                            <Edit className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className={s.mgmtTitle}>Datos del Proyecto</CardTitle>
                                            <CardDescription>Modifique la información general del proyecto.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 px-8">
                                    <ProjectEditorCliente proyecto={proyecto} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="lotes" className="focus-visible:outline-none focus-visible:ring-0">
                            <Card className={s.mgmtCard}>
                                <CardHeader className={s.mgmtCardHeader}>
                                    <div className="flex items-center gap-3">
                                        <div className={s.mgmtIconPrimary}>
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className={s.mgmtTitle}>Gestión de Lotes</CardTitle>
                                            <CardDescription>Agregue, edite o elimine los lotes que desea comparar en este proyecto.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 px-8">
                                    <LotEditorCliente proyectoId={proyecto.id} initialLotes={lotes || []} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="finalizacion" className="focus-visible:outline-none focus-visible:ring-0">
                            <Card className={s.finCard}>
                                <CardHeader className={s.finHeader}>
                                    <h3 className={s.finHeaderTitle}>
                                        <AlertCircle className="h-4 w-4" /> Zona de Finalización
                                    </h3>
                                </CardHeader>
                                <CardContent className={s.finContent}>
                                    <div className={s.finLayout}>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1">
                                                <h4 className={s.finTitle}>¿Listo para concluir?</h4>
                                                <p className={s.finDescription}>
                                                    Al finalizar, el proyecto se guardará de forma definitiva y pasará a un estado de lectura.
                                                    El administrador será notificado para comenzar el análisis de sus resultados.
                                                </p>
                                            </div>
                                            <div className={s.finInfoGrid}>
                                                <div className={s.finInfoBox}>
                                                    <span className={s.finInfoLabel}>Proyecto</span>
                                                    <p className={s.finInfoValue}>{proyecto.nombre}</p>
                                                </div>
                                                <div className={s.finInfoBox}>
                                                    <span className={s.finInfoLabel}>Estado Actual</span>
                                                    <Badge className={s.finStatusBadge}>{proyecto.estado}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 w-full md:w-auto">
                                            {!readOnly && (
                                                proyecto.estado === 'finalizado' ? (
                                                    <Badge className={s.finDoneBadge}>PROYECTO FINALIZADO</Badge>
                                                ) : (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button disabled={isFinalizing} size="lg" className={s.finBtn}>
                                                                {isFinalizing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                                                Finalizar Ahora
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Está seguro de finalizar el proyecto?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción guardará el estado actual de forma permanente y notificará al administrador. Una vez finalizado, no podrá realizar más cambios.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleFinalizar} className={s.finConfirmBtn}>
                                                                    Confirmar Finalización
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    );
}
