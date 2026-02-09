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
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveEvaluation } from "@/app/cliente/comparacion/[proyectoId]/actions";
import { toast } from "sonner";
import EvaluationCard from "./evaluation-card";
import ResultsView from "./results-view";
import ExportButton from "./export-button";

interface ComparisonInterfaceProps {
    proyecto: any;
    lotes: any[];
    evaluaciones: any[];
}

export default function ComparisonInterface({ proyecto, lotes, evaluaciones: initialEvaluaciones }: ComparisonInterfaceProps) {
    const [selectedLoteId, setSelectedLoteId] = useState(lotes[0]?.id);
    const [evaluaciones, setEvaluaciones] = useState(initialEvaluaciones);
    const [activeTab, setActiveTab] = useState("evaluacion");
    const [isSaving, setIsSaving] = useState(false);

    // Sync with initial evaluations if they change on server
    useEffect(() => {
        setEvaluaciones(initialEvaluaciones);
    }, [initialEvaluaciones]);

    const template = (proyecto.version as any);

    const handleSelectFactor = async (loteId: string, factorId: string) => {
        // 1. Find which criterion this factor belongs to
        let targetCriterioId: string | null = null;
        let allFactorsOfCriterio: string[] = [];

        template.clasificaciones.forEach((clasif: any) => {
            clasif.criterios.forEach((crit: any) => {
                if (crit.factores.some((f: any) => f.id === factorId)) {
                    targetCriterioId = crit.id;
                    allFactorsOfCriterio = crit.factores.map((f: any) => f.id);
                }
            });
        });

        if (!targetCriterioId) return;

        // 2. Optimistic update: Remove any previous selection for the same criterion on this lote
        const newEvaluations = evaluaciones.filter(e =>
            !(e.lote_id === loteId && allFactorsOfCriterio.includes(e.factor_id))
        );

        // Add the new selection
        newEvaluations.push({
            lote_id: loteId,
            factor_id: factorId,
            updated_at: new Date().toISOString()
        });

        setEvaluaciones(newEvaluations);

        // 3. Server action
        try {
            await saveEvaluation(loteId, factorId, proyecto.id);
        } catch (error) {
            toast.error("Error al guardar la evaluación");
            // Optionally revert: setEvaluaciones(evaluaciones)
        }
    };

    const selectedLote = lotes.find(l => l.id === selectedLoteId);

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Lotes List */}
            <aside className="w-80 border-r bg-muted/20 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-card">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Lotes Disponibles
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-3 space-y-2">
                        {lotes.map((lote) => {
                            // Progress is based on criteria evaluated
                            const evaluatedFactorsOfLote = evaluaciones.filter(e => e.lote_id === lote.id);

                            let totalCriteria = 0;
                            let evaluatedCriteria = 0;

                            template.clasificaciones.forEach((c: any) => {
                                c.criterios.forEach((cr: any) => {
                                    totalCriteria++;
                                    const criterionFactorsIds = cr.factores.map((f: any) => f.id);
                                    if (evaluatedFactorsOfLote.some(e => criterionFactorsIds.includes(e.factor_id))) {
                                        evaluatedCriteria++;
                                    }
                                });
                            });

                            const progress = totalCriteria > 0 ? (evaluatedCriteria / totalCriteria) * 100 : 0;

                            return (
                                <button
                                    key={lote.id}
                                    onClick={() => {
                                        setSelectedLoteId(lote.id);
                                        setActiveTab("evaluacion");
                                    }}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                                        selectedLoteId === lote.id
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02] z-10"
                                            : "bg-card hover:bg-muted text-card-foreground border-border hover:border-primary/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm leading-tight">{lote.nombre}</p>
                                            <p className={cn(
                                                "text-[10px] leading-tight line-clamp-1",
                                                selectedLoteId === lote.id ? "text-primary-foreground/70" : "text-muted-foreground"
                                            )}>
                                                {lote.ubicacion}
                                            </p>
                                        </div>
                                        {progress === 100 && (
                                            <CheckCircle2 className={cn("h-4 w-4", selectedLoteId === lote.id ? "text-white" : "text-primary")} />
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                                            <span>Progreso</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500", selectedLoteId === lote.id ? "bg-white" : "bg-primary")}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t bg-card">
                    <Button
                        variant={activeTab === 'resultados' ? 'default' : 'outline'}
                        className="w-full gap-2 shadow-sm"
                        onClick={() => setActiveTab("resultados")}
                    >
                        <BarChart3 className="h-4 w-4" /> Ver Resultados Full
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-background flex flex-col overflow-hidden relative">
                {activeTab === "evaluacion" && selectedLote ? (
                    <>
                        <div className="p-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20 print:border-none print:bg-white">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        Evaluando: <span className="text-primary print:text-black">{selectedLote.nombre}</span>
                                    </h2>
                                    <p className="text-muted-foreground text-sm">{selectedLote.ubicacion}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <ExportButton proyectoId={proyecto.id} projectName={proyecto.nombre} />
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Puntaje Actual</p>
                                        <div className="text-3xl font-black text-primary print:text-black">
                                            {calculateLoteScore(selectedLote.id, template, evaluaciones).toFixed(1)}
                                            <span className="text-sm font-medium text-muted-foreground/60 ml-1">pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                                {template.clasificaciones.map((clasificacion: any) => (
                                    <div key={clasificacion.id} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-border" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">
                                                {clasificacion.nombre}
                                            </h3>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>

                                        <div className="space-y-8">
                                            {clasificacion.criterios.map((criterio: any) => (
                                                <EvaluationCard
                                                    key={criterio.id}
                                                    criterio={criterio}
                                                    loteId={selectedLote.id}
                                                    evaluaciones={evaluaciones}
                                                    onSelectFactor={handleSelectFactor}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <ResultsView
                        proyecto={proyecto}
                        lotes={lotes}
                        evaluaciones={evaluaciones}
                    />
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
