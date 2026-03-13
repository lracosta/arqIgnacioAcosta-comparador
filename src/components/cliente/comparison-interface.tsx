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
    Info,
    Edit
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { saveEvaluation } from "@/app/cliente/proyecto/[proyectoId]/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EvaluationCard from "./evaluation-card";
import ResultsView from "./results-view";
import ExportButton from "./export-button";
import ComparisonTable from "./comparison-table";

// ── Styles ──────────────────────────────────────────────────────────────────────
const s = {
    // Layout
    root:           "h-full flex flex-col bg-[#F8FAFC]",
    header:         "bg-card border-b px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-40",
    headerLeft:     "flex items-center gap-4",
    headerIcon:     "h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary",
    projectTitle:   "text-xl font-black tracking-tight leading-none",
    projectSubtitle:"text-xs text-muted-foreground mt-1 font-medium italic",
    savingIndicator:"hidden md:flex flex-col items-end mr-2",
    savingText:     "flex items-center gap-1.5 text-[10px] font-bold text-primary animate-pulse",
    savedText:      "flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40",

    // Nav tabs
    navBar:         "flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40",
    navBtn:         "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
    navBtnActive:   "bg-card text-primary shadow-sm",
    navBtnInactive: "text-muted-foreground hover:bg-card/50",
    exitBtn:        "text-xs h-9 font-bold",

    // Main content
    main:           "flex-1 overflow-hidden flex flex-col",
    evalSection:    "h-full overflow-y-auto p-8 bg-muted/[0.04]",
    evalContainer:  "max-w-[1400px] mx-auto space-y-6",
    evalTitleRow:   "flex justify-between items-center mb-4",
    evalTitle:      "text-2xl font-black tracking-tight",
    evalSubtitle:   "text-sm text-muted-foreground",

    // Management tab
    mgmtSection:    "h-full overflow-y-auto p-8 bg-muted/[0.04]",
    mgmtContainer:  "max-w-4xl mx-auto space-y-8",
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

interface ComparisonInterfaceProps {
    proyecto: any;
    lotes: any[];
    evaluaciones: any[];
    initialTab?: string;
    readOnly?: boolean;
}

export default function ComparisonInterface({
    proyecto,
    lotes,
    evaluaciones: initialEvaluaciones,
    initialTab = "evaluacion",
    readOnly = false
}: ComparisonInterfaceProps) {
    const router = useRouter();
    const [selectedLoteId, setSelectedLoteId] = useState(lotes[0]?.id);
    const [evaluaciones, setEvaluaciones] = useState(initialEvaluaciones);
    const [activeTab, setActiveTab] = useState(initialTab === "resultados" ? "resultados" : "evaluacion");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEvaluaciones(initialEvaluaciones);
    }, [initialEvaluaciones]);

    const template = (proyecto.version as any);

    const handleSelectFactor = async (loteId: string, factorId: string) => {
        let targetCriterioId: string | null = null;
        template.clasificaciones.forEach((clasif: any) => {
            clasif.criterios.forEach((crit: any) => {
                if (crit.factores.some((f: any) => f.id === factorId)) {
                    targetCriterioId = crit.id;
                }
            });
        });

        if (!targetCriterioId) return;

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

        setIsSaving(true);
        try {
            const result = await saveEvaluation(loteId, factorId, proyecto.id);
            if (result?.error) {
                toast.error(`Error al guardar: ${result.error}`);
                setEvaluaciones(initialEvaluaciones);
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Error al conectar con el servidor");
            setEvaluaciones(initialEvaluaciones);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedLote = lotes.find(l => l.id === selectedLoteId);

    return (
        <div className={s.root}>
            {/* Project Header */}
            <header className={s.header}>
                <div className={s.headerLeft}>
                    <div className={s.headerIcon}>
                        <TableIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className={s.projectTitle}>{proyecto.nombre}</h1>
                        <p className={s.projectSubtitle}>
                            Evaluando con metodología: {template.nombre} (v{template.version})
                        </p>
                    </div>
                    {activeTab === 'evaluacion' && (
                        <div className={s.savingIndicator}>
                            {isSaving ? (
                                <div className={s.savingText}>
                                    <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
                                </div>
                            ) : (
                                <div className={s.savedText}>
                                    <CheckCircle2 className="h-3 w-3" /> Cambios Guardados
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={s.navBar}>
                        <>
                            <button
                                onClick={() => setActiveTab("evaluacion")}
                                className={cn(s.navBtn, activeTab === "evaluacion" ? s.navBtnActive : s.navBtnInactive)}
                            >
                                <TableIcon className="h-3.5 w-3.5" /> Evaluar
                            </button>
                            <button
                                onClick={() => setActiveTab("resultados")}
                                className={cn(s.navBtn, activeTab === "resultados" ? s.navBtnActive : s.navBtnInactive)}
                            >
                                <BarChart3 className="h-3.5 w-3.5" /> Resultados
                            </button>
                        </>

                    <Button variant="ghost" size="sm" asChild className={s.exitBtn}>
                        <Link href="/cliente/dashboard">Salir</Link>
                    </Button>
                </div>
            </header>

            <main className={s.main}>
                {activeTab === "evaluacion" && (
                    <div className={s.evalSection}>
                        <div className={s.evalContainer}>
                            <div className={s.evalTitleRow}>
                                <div>
                                    <h2 className={s.evalTitle}>Evaluación Comparativa</h2>
                                    <p className={s.evalSubtitle}>Complete los criterios para cada lote para generar el ranking.</p>
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
                    <ResultsView proyecto={proyecto} lotes={lotes} evaluaciones={evaluaciones} />
                )}
            </main>
        </div>
    );
}

// Score Calculation Logic
function calculateLoteScore(loteId: string, template: any, evaluaciones: any[]) {
    let totalScore = 0;
    const evaluationsOfLote = evaluaciones.filter(e => e.lote_id === loteId);

    template.clasificaciones.forEach((clasificacion: any) => {
        clasificacion.criterios.forEach((criterio: any) => {
            const factorIds = criterio.factores.map((f: any) => f.id);
            const evaluation = evaluationsOfLote.find(e => factorIds.includes(e.factor_id));

            if (evaluation) {
                const selectedFactor = criterio.factores.find((f: any) => f.id === evaluation.factor_id);
                if (selectedFactor) {
                    totalScore += (parseFloat(selectedFactor.valor.toString()) * parseFloat(criterio.puntaje_maximo.toString()));
                }
            }
        });
    });

    return totalScore;
}
