"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface EvaluationCardProps {
    criterio: any;
    loteId: string;
    evaluaciones: any[];
    onSelectFactor: (loteId: string, factorId: string) => void;
}

export default function EvaluationCard({ criterio, loteId, evaluaciones, onSelectFactor }: EvaluationCardProps) {
    // Determine which factor is currently selected for this criterion
    // Since we now pick ONE factor per criterion, we find if any factor of this criterion is in evaluations
    const criterionFactorsIds = criterio.factores.map((f: any) => f.id);
    const currentEval = evaluaciones.find(e => e.lote_id === loteId && criterionFactorsIds.includes(e.factor_id));

    return (
        <Card className="border-border/60 shadow-sm overflow-hidden group/card hover:border-primary/20 transition-all">
            <div className="bg-muted/30 p-4 border-b flex justify-between items-center group-hover/card:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <div>
                        <h4 className="font-bold text-base tracking-tight">{criterio.nombre}</h4>
                        {criterio.descripcion && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{criterio.descripcion}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Máx.</span>
                    <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                        {parseFloat(criterio.puntaje_maximo).toFixed(0)} pts
                    </Badge>
                </div>
            </div>

            <CardContent className="p-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">Seleccione una opción:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {criterio.factores.map((factor: any) => {
                        const isSelected = currentEval?.factor_id === factor.id;

                        return (
                            <button
                                key={factor.id}
                                onClick={() => onSelectFactor(loteId, factor.id)}
                                className={cn(
                                    "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300",
                                    isSelected
                                        ? "bg-primary/10 border-primary shadow-inner scale-[1.02] ring-1 ring-primary/20"
                                        : "bg-card border-border hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm"
                                )}
                            >
                                <div className="flex justify-between w-full mb-1.5">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-tighter",
                                        isSelected ? "text-primary" : "text-muted-foreground/60"
                                    )}>
                                        Valor: {(parseFloat(factor.valor) * 100).toFixed(0)}%
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-300 shadow-md">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                                <h5 className={cn(
                                    "text-xs font-bold leading-tight pr-6",
                                    isSelected ? "text-primary" : "text-foreground"
                                )}>
                                    {factor.nombre}
                                </h5>
                                {factor.descripcion && (
                                    <p className={cn(
                                        "text-[10px] mt-2 line-clamp-2 leading-relaxed italic",
                                        isSelected ? "text-primary/70" : "text-muted-foreground"
                                    )}>
                                        {factor.descripcion}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
