"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Table as TableIcon,
    BarChart3,
    ChevronRight,
    CheckCircle2,
    Circle,
    Loader2,
    AlertCircle,
    Check,
    Layers,
    Info
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { saveEvaluation, finalizarProyecto } from "@/app/cliente/comparacion/[proyectoId]/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EvaluationCard from "./evaluation-card";
import ResultsView from "./results-view";
import ExportButton from "./export-button";
import LotEditorCliente from "./lot-editor-cliente";
import ComparisonTable from "./comparison-table";

interface ComparisonInterfaceProps {
    proyecto: any;
    lotes: any[];
    evaluaciones: any[];
    initialTab?: string;
    readOnly?: boolean;
    showManagement?: boolean;
}

export default function ComparisonInterface({
    proyecto,
    lotes,
    evaluaciones: initialEvaluaciones,
    initialTab = "evaluacion",
    readOnly = false,
    showManagement = true
}: ComparisonInterfaceProps) {
    const router = useRouter();
    const [selectedLoteId, setSelectedLoteId] = useState(lotes[0]?.id);
    const [evaluaciones, setEvaluaciones] = useState(initialEvaluaciones);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isSaving, setIsSaving] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Sync with initial evaluations if they change on server
    useEffect(() => {
        setEvaluaciones(initialEvaluaciones);
    }, [initialEvaluaciones]);

    const template = (proyecto.version as any);

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

    const handleSelectFactor = async (loteId: string, factorId: string) => {
        // 1. Find which criterion this factor belongs to
        let targetCriterioId: string | null = null;
        template.clasificaciones.forEach((clasif: any) => {
            clasif.criterios.forEach((crit: any) => {
                if (crit.factores.some((f: any) => f.id === factorId)) {
                    targetCriterioId = crit.id;
                }
            });
        });

        if (!targetCriterioId) return;

        // 2. Optimistic update
        const newEvaluations = [...evaluaciones];
        const existingEvalIndex = newEvaluations.findIndex(
            e => e.lote_id === loteId && e.criterio_id === targetCriterioId
        );

        const newEval = {
            lote_id: loteId,
            criterio_id: targetCriterioId,
            factor_id: factorId,
            updated_at: new Date().toISOString()
        };

        if (existingEvalIndex >= 0) {
            newEvaluations[existingEvalIndex] = newEval;
        } else {
            newEvaluations.push(newEval);
        }
        setEvaluaciones(newEvaluations);

        // 3. Server action
        setIsSaving(true);
        try {
            const result = await saveEvaluation(loteId, factorId, proyecto.id);
            if (result?.error) {
                toast.error(`Error al guardar: ${result.error}`);
                setEvaluaciones(initialEvaluaciones); // Revert on specific error
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Error al conectar con el servidor");
            setEvaluaciones(initialEvaluaciones); // Revert on catch
        } finally {
            setIsSaving(false);
        }
    };

    const selectedLote = lotes.find(l => l.id === selectedLoteId);

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC]">
            {/* Project Header */}
            <header className="bg-card border-b px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-40">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <TableIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none">{proyecto.nombre}</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                            Evaluando con metodología: {template.nombre} (v{template.version})
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40">
                    {!showManagement && (
                        <>
                            <button
                                onClick={() => setActiveTab("evaluacion")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    activeTab === "evaluacion"
                                        ? "bg-card text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-card/50"
                                )}
                            >
                                <TableIcon className="h-3.5 w-3.5" /> Evaluar
                            </button>
                            <button
                                onClick={() => setActiveTab("resultados")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    activeTab === "resultados"
                                        ? "bg-card text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-card/50"
                                )}
                            >
                                <BarChart3 className="h-3.5 w-3.5" /> Resultados
                            </button>
                        </>
                    )}
                    {showManagement && (
                        <button
                            onClick={() => setActiveTab("gestion")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                activeTab === "gestion"
                                    ? "bg-card text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-card/50"
                            )}
                        >
                            <LayoutDashboard className="h-3.5 w-3.5" /> Lotes
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 ml-auto md:ml-0">
                    {activeTab === 'evaluacion' && (
                        <div className="hidden md:flex flex-col items-end mr-2">
                            {isSaving ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary animate-pulse">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40">
                                    <CheckCircle2 className="h-3 w-3" /> Cambios Guardados
                                </div>
                            )}
                        </div>
                    )}

                    <ExportButton proyectoId={proyecto.id} projectName={proyecto.nombre} />

                    <Button variant="ghost" size="sm" asChild className="text-xs h-9 font-bold">
                        <Link href="/cliente/dashboard">Salir</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col">
                {activeTab === "evaluacion" && (
                    <div className="h-full overflow-y-auto p-8 bg-muted/[0.04]">
                        <div className="max-w-[1400px] mx-auto space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Evaluación Comparativa</h2>
                                    <p className="text-sm text-muted-foreground">Complete los criterios para cada lote para generar el ranking.</p>
                                </div>
                            </div>
                            <ComparisonTable
                                template={template}
                                lotes={lotes}
                                evaluaciones={evaluaciones}
                                onSelectFactor={handleSelectFactor}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "resultados" && (
                    <ResultsView
                        proyecto={proyecto}
                        lotes={lotes}
                        evaluaciones={evaluaciones}
                    />
                )}

                {activeTab === "gestion" && (
                    <div className="h-full overflow-y-auto p-8 bg-muted/[0.04]">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <Card className="border-border/60 shadow-xl rounded-3xl overflow-hidden">
                                <CardHeader className="bg-muted/10 border-b pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black tracking-tight">Gestión de Lotes</CardTitle>
                                            <CardDescription>Agregue, edite o elimine los lotes que desea comparar en este proyecto.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 px-8">
                                    <LotEditorCliente proyectoId={proyecto.id} initialLotes={lotes || []} />
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 shadow-lg rounded-3xl overflow-hidden border-orange-200 bg-orange-50/20">
                                <CardHeader className="bg-orange-50/50 border-b border-orange-100 py-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-orange-800 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" /> Zona de Finalización
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-lg text-orange-950">¿Listo para concluir?</h4>
                                                <p className="text-sm text-orange-800/70 leading-relaxed">
                                                    Al finalizar, el proyecto se guardará de forma definitiva y pasará a un estado de lectura.
                                                    El administrador será notificado para comenzar el análisis de sus resultados.
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div className="bg-white/50 p-3 rounded-xl border border-orange-200">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-800/60 block mb-1">Proyecto</span>
                                                    <p className="text-sm font-bold truncate">{proyecto.nombre}</p>
                                                </div>
                                                <div className="bg-white/50 p-3 rounded-xl border border-orange-200">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-800/60 block mb-1">Estado Actual</span>
                                                    <Badge className="bg-orange-200 text-orange-800 border-none font-bold uppercase text-[9px]">
                                                        {proyecto.estado}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 w-full md:w-auto">
                                            {!readOnly && (
                                                proyecto.estado === 'finalizado' ? (
                                                    <Badge className="bg-green-500 text-white border-none font-black px-6 py-3 h-auto text-sm w-full md:w-auto">
                                                        PROYECTO FINALIZADO
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        onClick={handleFinalizar}
                                                        disabled={isFinalizing}
                                                        size="lg"
                                                        className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black shadow-xl shadow-orange-200 px-8 py-6 rounded-2xl"
                                                    >
                                                        {isFinalizing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                                        Finalizar Ahora
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Score Calculation Logic (based on new selection model: one factor per criterion)
function calculateLoteScore(loteId: string, template: any, evaluaciones: any[]) {
    let totalScore = 0;
    const evaluationsOfLote = evaluaciones.filter(e => e.lote_id === loteId);

    template.clasificaciones.forEach((clasificacion: any) => {
        clasificacion.criterios.forEach((criterio: any) => {
            // Find if any factor of this criterion is evaluated for this lote
            const factorIds = criterio.factores.map((f: any) => f.id);
            const evaluation = evaluationsOfLote.find(e => factorIds.includes(e.factor_id));

            if (evaluation) {
                const selectedFactor = criterio.factores.find((f: any) => f.id === evaluation.factor_id);
                if (selectedFactor) {
                    // Score = Factor Value (0 to 1) * Criterion Max Score
                    totalScore += (parseFloat(selectedFactor.valor.toString()) * parseFloat(criterio.puntaje_maximo.toString()));
                }
            }
        });
    });

    return totalScore;
}
