"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, AlertCircle, Info, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import ExportButton from "./export-button";

// ── Styles ──────────────────────────────────────────────────────────────────────
const s = {
    // Layout
    root:          "flex-1 overflow-y-auto w-full",
    container:     "p-8 max-w-6xl mx-auto space-y-8",
    titleRow:      "flex justify-between items-start",
    title:         "text-3xl font-black tracking-tight text-foreground",
    subtitle:      "text-muted-foreground",

    // Top 3 Podium
    podiumGrid:    "grid grid-cols-1 md:grid-cols-3 gap-6",
    podiumCard:    "relative flex flex-col rounded-2xl overflow-hidden border bg-card transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl",
    podiumWinner:  "border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/20 scale-[1.02]",
    podiumDefault: "border-border shadow-md",
    podiumImage:   "relative h-40 w-full overflow-hidden bg-muted",
    podiumImg:     "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110",
    podiumPlaceholder: "flex h-full w-full items-center justify-center bg-secondary/30",
    podiumGradient:"absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90",
    podiumTrophy:  "bg-primary text-primary-foreground p-2 rounded-full shadow-lg animate-in zoom-in spin-in-12 duration-500",
    podiumBadge:   "relative -mt-5 mx-auto h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg border-4 border-card z-10",
    podiumBadgeWin:"bg-primary text-primary-foreground",
    podiumBadgeDef:"bg-muted text-muted-foreground",
    podiumContent: "pt-2 pb-6 px-6 flex flex-col items-center flex-1",
    podiumName:    "text-xl font-black tracking-tight text-center mb-1 line-clamp-1",
    podiumScore:   "text-4xl font-black text-primary tracking-tighter",
    podiumPts:     "text-xs font-bold text-muted-foreground uppercase tracking-wider",
    podiumBreakdown:    "w-full grid grid-cols-2 gap-x-4 gap-y-2 mt-auto",
    podiumBreakdownRow: "flex justify-between items-center text-[10px] py-1 border-b border-border/40 last:border-0",
    podiumBreakdownLabel: "text-muted-foreground font-medium truncate pr-2",
    podiumBreakdownValue: "font-bold text-foreground",

    // Charts
    chartsGrid:    "grid grid-cols-1 lg:grid-cols-2 gap-8",
    chartCard:     "shadow-sm",
    chartTitle:    "text-lg",
    chartContainer:"h-[300px] w-full",

    // Ranking table
    rankingCard:   "shadow-sm overflow-hidden",
    rankingHeader: "bg-muted/10 border-b",
    rankingColHead:"text-right text-[10px] uppercase font-bold tracking-tight",
    rankingTotal:  "text-right font-black text-primary",
    rankingWinRow: "bg-primary/5",
    rankingPos:    "text-center font-bold",
    rankingName:   "font-semibold",
    rankingScore:  "text-right text-xs",
    rankingTotalCell: "text-right font-black text-lg text-primary",
} as const;

interface ResultsViewProps {
    proyecto: any;
    lotes: any[];
    evaluaciones: any[];
}

export default function ResultsView({ proyecto, lotes, evaluaciones }: ResultsViewProps) {
    const template = (proyecto.version as any);

    const rankingData = useMemo(() => {
        return lotes.map(lote => {
            let total = 0;
            const scoresByClasificacion: Record<string, number> = {};
            const evaluationsOfLote = evaluaciones.filter(e => e.lote_id === lote.id);

            template.clasificaciones.forEach((clasificacion: any) => {
                let clasifTotal = 0;

                clasificacion.criterios.forEach((criterio: any) => {
                    const factorIds = criterio.factores.map((f: any) => f.id);
                    const evaluation = evaluationsOfLote.find(e => factorIds.includes(e.factor_id));

                    if (evaluation) {
                        const selectedFactor = criterio.factores.find((f: any) => f.id === evaluation.factor_id);
                        if (selectedFactor) {
                            clasifTotal += (parseFloat(selectedFactor.valor.toString()) * parseFloat(criterio.puntaje_maximo.toString()));
                        }
                    }
                });

                scoresByClasificacion[clasificacion.nombre] = clasifTotal;
                total += clasifTotal;
            });

            return {
                id: lote.id,
                nombre: lote.nombre,
                imagen: lote.imagen,
                total,
                ...scoresByClasificacion
            } as any;
        }).sort((a, b) => b.total - a.total);
    }, [lotes, template, evaluaciones]);

    const chartData = rankingData.map(item => ({
        name: item.nombre,
        score: parseFloat(item.total.toFixed(1))
    }));

    const radarData = template.clasificaciones.map((c: any) => {
        const item: any = { subject: c.nombre };
        rankingData.forEach(l => {
            item[l.nombre] = parseFloat((l[c.nombre] || 0).toFixed(1));
        });
        return item;
    });

    const colors = ['#FF581A', '#3B4ED4', '#6366f1', '#10b981', '#f59e0b', '#06b6d4'];

    return (
        <div className={s.root}>
            <div className={s.container}>
                <div className={s.titleRow}>
                    <div className="flex flex-col gap-2">
                        <h2 className={s.title}>Resultados de Comparación</h2>
                        <p className={s.subtitle}>Análisis detallado y ranking de lotes final.</p>
                    </div>
                    <ExportButton proyectoId={proyecto.id} projectName={proyecto.nombre} />
                </div>

                {/* Top 3 Podium */}
                <div className={s.podiumGrid}>
                    {rankingData.slice(0, 3).map((lote: any, index: number) => (
                        <div key={lote.id} className={cn(s.podiumCard, index === 0 ? s.podiumWinner : s.podiumDefault)}>
                            <div className={s.podiumImage}>
                                {lote.imagen ? (
                                    <img src={lote.imagen} alt={lote.nombre} className={s.podiumImg} />
                                ) : (
                                    <div className={s.podiumPlaceholder}>
                                        <LayoutGrid className="h-10 w-10 text-muted-foreground/10" />
                                    </div>
                                )}
                                <div className={s.podiumGradient} />

                                {index === 0 && (
                                    <div className="absolute top-3 right-3">
                                        <div className={s.podiumTrophy}>
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={cn(s.podiumBadge, index === 0 ? s.podiumBadgeWin : s.podiumBadgeDef)}>
                                {index + 1}
                            </div>

                            <div className={s.podiumContent}>
                                <h3 className={s.podiumName} title={lote.nombre}>{lote.nombre}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className={s.podiumScore}>{lote.total.toFixed(1)}</span>
                                    <span className={s.podiumPts}>pts</span>
                                </div>

                                <div className={s.podiumBreakdown}>
                                    {template.clasificaciones.map((c: any) => (
                                        <div key={c.id} className={s.podiumBreakdownRow}>
                                            <span className={s.podiumBreakdownLabel}>{c.nombre}</span>
                                            <span className={s.podiumBreakdownValue}>{(lote[c.nombre] || 0).toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={s.chartsGrid}>
                    {/* Bar Chart */}
                    <Card className={s.chartCard}>
                        <CardHeader>
                            <CardTitle className={s.chartTitle}>Puntaje Total por Lote</CardTitle>
                            <CardDescription>Comparativa visual del rendimiento general.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={s.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'primary', opacity: 0.05 }}
                                        />
                                        <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#FF581A' : '#E2E8F0'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Radar Chart */}
                    <Card className={s.chartCard}>
                        <CardHeader>
                            <CardTitle className={s.chartTitle}>Perfil por Clasificación</CardTitle>
                            <CardDescription>Fortalezas y debilidades comparadas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={s.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid opacity={0.3} />
                                        <PolarAngleAxis dataKey="subject" fontSize={10} />
                                        <PolarRadiusAxis fontSize={10} axisLine={false} tick={false} />
                                        {rankingData.slice(0, 4).map((lote: any, index: number) => (
                                            <Radar key={lote.id} name={lote.nombre} dataKey={lote.nombre} stroke={colors[index]} fill={colors[index]} fillOpacity={0.1} />
                                        ))}
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Full Ranking Table */}
                <Card className={s.rankingCard}>
                    <CardHeader className={s.rankingHeader}>
                        <CardTitle className={s.chartTitle}>Ranking Detallado</CardTitle>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">Pos</TableHead>
                                <TableHead>Lote</TableHead>
                                {template.clasificaciones.map((c: any) => (
                                    <TableHead key={c.id} className={s.rankingColHead}>{c.nombre}</TableHead>
                                ))}
                                <TableHead className={s.rankingTotal}>TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankingData.map((lote: any, index: number) => (
                                <TableRow key={lote.id} className={cn(index === 0 && s.rankingWinRow)}>
                                    <TableCell className={s.rankingPos}>
                                        {index === 0 ? <Medal className="h-4 w-4 text-primary inline" /> : index + 1}
                                    </TableCell>
                                    <TableCell className={s.rankingName}>{lote.nombre}</TableCell>
                                    {template.clasificaciones.map((c: any) => (
                                        <TableCell key={c.id} className={s.rankingScore}>
                                            {(lote[c.nombre] || 0).toFixed(1)}
                                        </TableCell>
                                    ))}
                                    <TableCell className={s.rankingTotalCell}>{lote.total.toFixed(1)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
