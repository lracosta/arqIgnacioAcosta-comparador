"use client";

import { useState } from "react";
import {
    Check,
    Info,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    Table as TableIcon,
    ChevronRight,
    Search,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// ── Styles ──────────────────────────────────────────────────────────────────────
const s = {
    // Empty state
    emptyState: "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/5",
    emptyIcon: "h-12 w-12 text-muted-foreground/30 mb-4",
    emptyTitle: "text-lg font-bold",
    emptyDescription: "text-sm text-muted-foreground max-w-xs mx-auto mt-1",

    // Table shell
    tableWrapper: "w-full overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-xl overflow-hidden",
    table: "w-full border-collapse",

    // Header
    headerRow: "bg-muted/30",
    stickyHeader: "p-6 text-left border-b border-border/60 min-w-[300px] z-10 sticky left-0 bg-card shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
    headerLabel: "text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1",
    headerSubtext: "text-xs text-muted-foreground font-medium",

    // Lote header card
    loteHeaderCell: "p-4 align-top border-b border-border/60 min-w-[220px] bg-muted/5 group/col transition-colors hover:bg-muted/10",
    loteCard: "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 duration-300",
    loteCardImage: "relative h-28 w-full overflow-hidden bg-muted group/img",
    loteCardImg: "h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110",
    loteCardPlaceholder: "flex h-full w-full items-center justify-center bg-secondary/30",
    loteCardBadge: "h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider bg-background/90 backdrop-blur-sm border-none text-foreground/80 shadow-sm",
    loteCardContent: "flex flex-col gap-1 p-3 text-left",
    loteCardName: "text-sm font-black tracking-tight leading-tight text-foreground truncate",
    loteCardLocation: "flex items-center gap-1.5 text-muted-foreground w-full",
    loteCardAddress: "text-[10px] font-medium truncate leading-none flex-1",

    // Classification row
    clasifRow: "bg-primary/[0.03] cursor-pointer hover:bg-primary/[0.05] transition-colors group",
    clasifStickyCell: "p-0 border-b border-border/40 z-10 sticky left-0 bg-card shadow-[4px_0_10px_rgba(0,0,0,0.01)]",
    clasifCellInner: "w-full h-full p-4 flex items-center gap-2 bg-primary/[0.03] group-hover:bg-primary/[0.05] transition-colors",
    clasifName: "text-xs font-black uppercase tracking-widest text-primary/80",
    clasifEmptyCell: "p-4 border-b border-border/40 bg-primary/[0.01]",

    // Criteria row
    criterioRow: "group hover:bg-muted/10 transition-colors",
    criterioStickyCell: "p-6 border-b border-border/40 z-10 sticky left-0 bg-card group-hover:bg-muted transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
    criterioName: "text-sm font-bold text-foreground leading-tight",
    criterioInfoIcon: "h-3.5 w-3.5 text-muted-foreground/50 cursor-help hover:text-primary transition-colors",
    criterioTooltip: "max-w-[250px] text-[11px] p-3 leading-relaxed",
    criterioWeightLabel: "text-[10px] font-bold text-muted-foreground/60 uppercase",
    criterioWeightBadge: "h-4 px-1.5 text-[9px] border-primary/20 text-primary font-bold",

    // Evaluation cell
    evalCell: "p-4 border-b border-border/40",
    evalButton: "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group/btn",
    evalButtonSelected: "bg-primary/5 border-primary/20 hover:border-primary/40",
    evalButtonPending: "bg-muted/30 border-dashed border-muted-foreground/20 hover:border-primary/30",
    evalButtonReadOnly: "cursor-default hover:border-border",
    evalStatusLabel: "text-[10px] font-black uppercase tracking-widest",
    evalFactorName: "text-xs font-bold line-clamp-1",
    evalChevron: "h-4 w-4 text-muted-foreground/30 group-hover/btn:text-primary group-hover/btn:translate-x-0.5 transition-all",
    evalScoreRow: "px-1 flex justify-between items-center text-[9px]",
    evalScoreLabel: "text-primary/70 font-medium",
    evalScoreValue: "font-black text-primary",

    // Footer
    footerRow: "bg-primary/[0.03] font-black",
    footerStickyCell: "p-6 border-t-2 border-primary z-10 sticky left-0 bg-card shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
    footerLabel: "text-sm uppercase tracking-widest text-primary",
    footerScoreCell: "p-6 text-center border-t-2 border-primary",
    footerScoreValue: "text-3xl font-black text-primary",
    footerScoreLabel: "text-[10px] text-primary/60 uppercase tracking-tighter",

    // Selection dialog
    dialogContent: "max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl",
    dialogHeader: "p-8 pb-4 bg-muted/10",
    dialogBreadcrumb: "flex items-center gap-2 mb-2",
    dialogLoteBadge: "text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary",
    dialogBreadcrumbText: "text-[10px] font-black uppercase tracking-widest text-muted-foreground/60",
    dialogTitle: "text-2xl font-black tracking-tight leading-tight",
    dialogBody: "p-6 pt-2 overflow-y-auto max-h-[60vh]",
    dialogOption: "flex items-start gap-4 p-5 rounded-2xl border text-left transition-all group relative overflow-hidden",
    dialogOptionSelected: "border-primary bg-primary/[0.02] ring-1 ring-primary",
    dialogOptionDefault: "border-border hover:border-primary/40 hover:bg-muted/30",
    dialogRadio: "mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
    dialogRadioSelected: "border-primary bg-primary",
    dialogRadioDefault: "border-muted-foreground/20 group-hover:border-primary/40",
    dialogOptionName: "font-bold text-sm leading-tight",
    dialogOptionBadge: "shrink-0 font-black text-[10px]",
    dialogOptionBadgeSelected: "bg-primary text-primary-foreground border-none",
    dialogOptionBadgeDefault: "bg-muted text-muted-foreground",
    dialogOptionDesc: "text-xs text-muted-foreground line-clamp-2 italic",
    dialogFooter: "p-6 bg-muted/10 border-t flex justify-between items-center",
    dialogFooterHint: "text-[10px] text-muted-foreground font-medium italic",
    dialogCancelBtn: "font-bold text-xs h-8",
    dialogConfirmBtn: "font-bold text-xs h-8 px-6",
} as const;

interface ComparisonTableProps {
    template: any;
    lotes: any[];
    evaluaciones: any[];
    onSelectFactor: (loteId: string, factorId: string) => void;
    readOnly?: boolean;
}

export default function ComparisonTable({
    template,
    lotes,
    evaluaciones,
    onSelectFactor,
    readOnly = false
}: ComparisonTableProps) {
    const [expandedClasif, setExpandedClasif] = useState<string[]>(
        template.clasificaciones.map((c: any) => c.id)
    );
    const [editingCell, setEditingCell] = useState<{ loteId: string, loteNombre: string, criterio: any, currentFactorId?: string } | null>(null);
    const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);

    const toggleClasif = (id: string) => {
        setExpandedClasif(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectOption = (factorId: string) => {
        setPendingFactorId(factorId);
    };

    const handleConfirmSelection = () => {
        if (!editingCell || !pendingFactorId) return;
        onSelectFactor(editingCell.loteId, pendingFactorId);
        setEditingCell(null);
        setPendingFactorId(null);
    };

    if (lotes.length === 0) {
        return (
            <div className={s.emptyState}>
                <LayoutGrid className={s.emptyIcon} />
                <h3 className={s.emptyTitle}>No hay lotes para comparar</h3>
                <p className={s.emptyDescription}>
                    Agregue lotes desde la pestaña de gestión para comenzar la evaluación comparativa.
                </p>
            </div>
        );
    }

    return (
        <div className={s.tableWrapper}>
            <table className={s.table}>
                <thead>
                    <tr className={s.headerRow}>
                        <th className={s.stickyHeader}>
                            <div className="flex flex-col">
                                <span className={s.headerLabel}>Criterios de Evaluación</span>
                                <span className={s.headerSubtext}>Seleccione la opción que mejor describa cada lote.</span>
                            </div>
                        </th>
                        {lotes.map(lote => (
                            <th key={lote.id} className={s.loteHeaderCell}>
                                <div className={s.loteCard}>
                                    <div className={s.loteCardImage}>
                                        {lote.imagen ? (
                                            <img src={lote.imagen} alt={lote.nombre} className={s.loteCardImg} />
                                        ) : (
                                            <div className={s.loteCardPlaceholder}>
                                                <LayoutGrid className="h-8 w-8 text-muted-foreground/10" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className={s.loteCardBadge}>Lote</Badge>
                                        </div>
                                    </div>
                                    <div className={s.loteCardContent}>
                                        <div className={s.loteCardName} title={lote.nombre}>{lote.nombre}</div>
                                        <div className={s.loteCardLocation}>
                                            <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                                            <span className={s.loteCardAddress} title={lote.ubicacion}>{lote.ubicacion}</span>
                                        </div>
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {template.clasificaciones.map((clasif: any) => {
                        const isExpanded = expandedClasif.includes(clasif.id);
                        return (
                            <TooltipProvider key={clasif.id}>
                                <tr className={s.clasifRow} onClick={() => toggleClasif(clasif.id)}>
                                    <td className={s.clasifStickyCell} colSpan={1}>
                                        <div className={s.clasifCellInner}>
                                            {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
                                            <span className={s.clasifName}>{clasif.nombre}</span>
                                        </div>
                                    </td>
                                    {lotes.map(lote => (
                                        <td key={lote.id} className={s.clasifEmptyCell}></td>
                                    ))}
                                </tr>

                                {isExpanded && clasif.criterios.map((criterio: any) => (
                                    <tr key={criterio.id} className={s.criterioRow}>
                                        <td className={s.criterioStickyCell}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={s.criterioName}>{criterio.nombre}</span>
                                                    {criterio.descripcion && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className={s.criterioInfoIcon} />
                                                            </TooltipTrigger>
                                                            <TooltipContent className={s.criterioTooltip}>
                                                                {criterio.descripcion}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={s.criterioWeightLabel}>Incidencia:</span>
                                                    <Badge variant="outline" className={s.criterioWeightBadge}>
                                                        {parseFloat(criterio.puntaje_maximo).toFixed(0)} pts
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        {lotes.map(lote => {
                                            const criterionFactorsIds = criterio.factores.map((f: any) => f.id);
                                            const currentEval = evaluaciones.find(e => e.lote_id === lote.id && criterionFactorsIds.includes(e.factor_id));
                                            const selectedFactor = currentEval ? criterio.factores.find((f: any) => f.id === currentEval.factor_id) : null;

                                            return (
                                                <td key={lote.id} className={s.evalCell}>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            disabled={readOnly}
                                                            onClick={() => {
                                                                if (readOnly) return;
                                                                setPendingFactorId(selectedFactor?.id || null);
                                                                setEditingCell({ loteId: lote.id, loteNombre: lote.nombre, criterio, currentFactorId: selectedFactor?.id });
                                                            }}
                                                            className={cn(
                                                                s.evalButton,
                                                                selectedFactor ? s.evalButtonSelected : s.evalButtonPending,
                                                                readOnly && s.evalButtonReadOnly
                                                            )}
                                                        >
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className={cn(s.evalStatusLabel, selectedFactor ? "text-primary" : "text-muted-foreground/60")}>
                                                                    {selectedFactor ? "Seleccionado" : "Pendiente"}
                                                                </span>
                                                                <span className={cn(s.evalFactorName, !selectedFactor && "italic text-muted-foreground/40")}>
                                                                    {selectedFactor ? selectedFactor.nombre : "Elegir opción..."}
                                                                </span>
                                                            </div>
                                                            {!readOnly && <ChevronRight className={s.evalChevron} />}
                                                        </button>

                                                        {selectedFactor && (
                                                            <div className={s.evalScoreRow}>
                                                                <span className={s.evalScoreLabel}>Puntaje:</span>
                                                                <span className={s.evalScoreValue}>
                                                                    {(parseFloat(selectedFactor.valor) * parseFloat(criterio.puntaje_maximo)).toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </TooltipProvider>
                        );
                    })}
                </tbody>
                {/*
                <tfoot>
                    <tr className={s.footerRow}>
                        <td className={s.footerStickyCell}>
                            <span className={s.footerLabel}>Puntaje Total del Lote</span>
                        </td>
                        {lotes.map(lote => {
                            const score = calculateLoteScore(lote.id, template, evaluaciones);
                            return (
                                <td key={lote.id} className={s.footerScoreCell}>
                                    <div className={s.footerScoreValue}>{score.toFixed(1)}</div>
                                    <div className={s.footerScoreLabel}>Puntos Totales</div>
                                </td>
                            );
                        })}
                    </tr>
                </tfoot>
                */}
            </table>

            {/* Selection Dialog */}
            <Dialog open={!!editingCell} onOpenChange={(open) => {
                if (!open) { setEditingCell(null); setPendingFactorId(null); }
            }}>
                <DialogContent className={s.dialogContent}>
                    <DialogHeader className={s.dialogHeader}>
                        <div className={s.dialogBreadcrumb}>
                            <Badge variant="outline" className={s.dialogLoteBadge}>{editingCell?.loteNombre}</Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                            <span className={s.dialogBreadcrumbText}>Evaluación</span>
                        </div>
                        <DialogTitle className={s.dialogTitle}>{editingCell?.criterio.nombre}</DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            {editingCell?.criterio.descripcion || "Seleccione la opción que mejor se adapte a este terreno para este criterio."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className={s.dialogBody}>
                        <div className="grid grid-cols-1 gap-3">
                            {editingCell?.criterio.factores.sort((a: any, b: any) => b.valor - a.valor).map((factor: any) => {
                                const isSelected = pendingFactorId === factor.id;
                                return (
                                    <button
                                        key={factor.id}
                                        onClick={() => handleSelectOption(factor.id)}
                                        className={cn(s.dialogOption, isSelected ? s.dialogOptionSelected : s.dialogOptionDefault)}
                                    >
                                        <div className={cn(s.dialogRadio, isSelected ? s.dialogRadioSelected : s.dialogRadioDefault)}>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={cn(s.dialogOptionName, isSelected ? "text-primary" : "text-foreground")}>{factor.nombre}</h4>
                                                <Badge variant="outline" className={cn(s.dialogOptionBadge, isSelected ? s.dialogOptionBadgeSelected : s.dialogOptionBadgeDefault)}>
                                                    {(parseFloat(factor.valor) * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                            {factor.descripcion && <p className={s.dialogOptionDesc}>{factor.descripcion}</p>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className={s.dialogFooter}>
                        <p className={s.dialogFooterHint}>
                            Incidencia del criterio: <span className="font-black text-foreground">{editingCell?.criterio.puntaje_maximo} pts</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingCell(null); setPendingFactorId(null); }} className={s.dialogCancelBtn}>Cancelar</Button>
                            <Button size="sm" disabled={!pendingFactorId} onClick={handleConfirmSelection} className={s.dialogConfirmBtn}>Aceptar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Reuse logic from parent (simplified version or shared)
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
