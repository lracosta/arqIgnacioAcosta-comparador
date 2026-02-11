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
    Search
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

    const toggleClasif = (id: string) => {
        setExpandedClasif(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectOption = (factorId: string) => {
        if (!editingCell) return;
        onSelectFactor(editingCell.loteId, factorId);
        setEditingCell(null);
    };

    if (lotes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/5">
                <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold">No hay lotes para comparar</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                    Agregue lotes desde la pestaña de gestión para comenzar la evaluación comparativa.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-xl overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-muted/30">
                        <th className="p-6 text-left border-b border-border/60 min-w-[300px] z-10 sticky left-0 bg-muted/30 backdrop-blur-md">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Criterios de Evaluación</span>
                                <span className="text-xs text-muted-foreground font-medium">Seleccione la opción que mejor describa cada lote.</span>
                            </div>
                        </th>
                        {lotes.map(lote => (
                            <th key={lote.id} className="p-6 text-center border-b border-border/60 min-w-[200px] bg-muted/20">
                                <div className="flex flex-col items-center gap-1">
                                    <Badge variant="outline" className="text-[9px] font-bold bg-background/50 mb-1">LOTE</Badge>
                                    <div className="text-lg font-black tracking-tight">{lote.nombre}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">{lote.ubicacion}</div>
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
                                {/* Classification Header Row */}
                                <tr
                                    className="bg-primary/[0.03] cursor-pointer hover:bg-primary/[0.05] transition-colors"
                                    onClick={() => toggleClasif(clasif.id)}
                                >
                                    <td className="p-4 border-b border-border/40 z-10 sticky left-0 bg-primary/[0.03] backdrop-blur-sm" colSpan={1}>
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
                                            <span className="text-xs font-black uppercase tracking-widest text-primary/80">
                                                {clasif.nombre}
                                            </span>
                                        </div>
                                    </td>
                                    {lotes.map(lote => (
                                        <td key={lote.id} className="p-4 border-b border-border/40 bg-primary/[0.01]"></td>
                                    ))}
                                </tr>

                                {/* Criteria Rows within Classification */}
                                {isExpanded && clasif.criterios.map((criterio: any) => (
                                    <tr key={criterio.id} className="group hover:bg-muted/10 transition-colors">
                                        <td className="p-6 border-b border-border/40 z-10 sticky left-0 bg-card group-hover:bg-muted/20 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-foreground leading-tight">{criterio.nombre}</span>
                                                    {criterio.descripcion && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help hover:text-primary transition-colors" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[250px] text-[11px] p-3 leading-relaxed">
                                                                {criterio.descripcion}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Importancia:</span>
                                                    <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-primary/20 text-primary font-bold">
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
                                                <td key={lote.id} className="p-4 border-b border-border/40">
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            disabled={readOnly}
                                                            onClick={() => !readOnly && setEditingCell({
                                                                loteId: lote.id,
                                                                loteNombre: lote.nombre,
                                                                criterio: criterio,
                                                                currentFactorId: selectedFactor?.id
                                                            })}
                                                            className={cn(
                                                                "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group/btn",
                                                                selectedFactor
                                                                    ? "bg-primary/5 border-primary/20 hover:border-primary/40"
                                                                    : "bg-muted/30 border-dashed border-muted-foreground/20 hover:border-primary/30",
                                                                readOnly && "cursor-default hover:border-border"
                                                            )}
                                                        >
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className={cn(
                                                                    "text-[10px] font-black uppercase tracking-widest",
                                                                    selectedFactor ? "text-primary" : "text-muted-foreground/60"
                                                                )}>
                                                                    {selectedFactor ? "Seleccionado" : "Pendiente"}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-xs font-bold line-clamp-1",
                                                                    !selectedFactor && "italic text-muted-foreground/40"
                                                                )}>
                                                                    {selectedFactor ? selectedFactor.nombre : "Elegir opción..."}
                                                                </span>
                                                            </div>
                                                            {!readOnly && (
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover/btn:text-primary group-hover/btn:translate-x-0.5 transition-all" />
                                                            )}
                                                        </button>

                                                        {selectedFactor && (
                                                            <div className="px-1 flex justify-between items-center text-[9px]">
                                                                <span className="text-primary/70 font-medium">Puntaje:</span>
                                                                <span className="font-black text-primary">
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
                <tfoot>
                    <tr className="bg-primary/[0.03] font-black">
                        <td className="p-6 border-t-2 border-primary z-10 sticky left-0 bg-primary/[0.03] backdrop-blur-md">
                            <span className="text-sm uppercase tracking-widest text-primary">Puntaje Total del Lote</span>
                        </td>
                        {lotes.map(lote => {
                            const score = calculateLoteScore(lote.id, template, evaluaciones);
                            return (
                                <td key={lote.id} className="p-6 text-center border-t-2 border-primary">
                                    <div className="text-3xl font-black text-primary">
                                        {score.toFixed(1)}
                                    </div>
                                    <div className="text-[10px] text-primary/60 uppercase tracking-tighter">Puntos Totales</div>
                                </td>
                            );
                        })}
                    </tr>
                </tfoot>
            </table>

            {/* Selection Dialog */}
            <Dialog open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4 bg-muted/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary">
                                {editingCell?.loteNombre}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Evaluación</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                            {editingCell?.criterio.nombre}
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            {editingCell?.criterio.descripcion || "Seleccione la opción que mejor se adapte a este terreno para este criterio."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 overflow-y-auto max-h-[60vh]">
                        <div className="grid grid-cols-1 gap-3">
                            {editingCell?.criterio.factores.sort((a: any, b: any) => b.valor - a.valor).map((factor: any) => {
                                // Check if this factor is currently selected
                                const isSelected = evaluaciones.some(e =>
                                    e.lote_id === editingCell.loteId && e.factor_id === factor.id
                                );

                                return (
                                    <button
                                        key={factor.id}
                                        onClick={() => handleSelectOption(factor.id)}
                                        className={cn(
                                            "flex items-start gap-4 p-5 rounded-2xl border text-left transition-all group relative overflow-hidden",
                                            isSelected
                                                ? "border-primary bg-primary/[0.02] ring-1 ring-primary"
                                                : "border-border hover:border-primary/40 hover:bg-muted/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/20 group-hover:border-primary/40"
                                        )}>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={cn(
                                                    "font-bold text-sm leading-tight",
                                                    isSelected ? "text-primary" : "text-foreground"
                                                )}>
                                                    {factor.nombre}
                                                </h4>
                                                <Badge variant="outline" className={cn(
                                                    "shrink-0 font-black text-[10px]",
                                                    isSelected ? "bg-primary text-primary-foreground border-none" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {(parseFloat(factor.valor) * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                            {factor.descripcion && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                                    {factor.descripcion}
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 p-1">
                                                <div className="bg-primary h-2 w-2 rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-6 bg-muted/10 border-t flex justify-between items-center">
                        <p className="text-[10px] text-muted-foreground font-medium italic">
                            Importancia del criterio: <span className="font-black text-foreground">{editingCell?.criterio.puntaje_maximo} pts</span>
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCell(null)} className="font-bold text-xs h-8">
                            Cancelar
                        </Button>
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
