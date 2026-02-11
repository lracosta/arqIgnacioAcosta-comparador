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
import { Trophy, Medal, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import ExportButton from "./export-button";

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
                    // Find if any factor of this criterion is evaluated for this lote
                    const factorIds = criterio.factores.map((f: any) => f.id);
                    const evaluation = evaluationsOfLote.find(e => factorIds.includes(e.factor_id));

                    if (evaluation) {
                        const selectedFactor = criterio.factores.find((f: any) => f.id === evaluation.factor_id);
                        if (selectedFactor) {
                            // Score = Factor Value (0 to 1) * Criterion Max Score
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
                total,
                ...scoresByClasificacion
            } as any;
        }).sort((a, b) => b.total - a.total);
    }, [lotes, template, evaluaciones]);

    const chartData = rankingData.map(item => ({
        name: item.nombre,
        score: parseFloat(item.total.toFixed(1))
    }));

    // Radar Data - Comparing all lots across classifications
    const radarData = template.clasificaciones.map((c: any) => {
        const item: any = { subject: c.nombre };
        rankingData.forEach(l => {
            item[l.nombre] = parseFloat((l[c.nombre] || 0).toFixed(1));
        });
        return item;
    });

    const colors = ['#FF581A', '#3B4ED4', '#6366f1', '#10b981', '#f59e0b', '#06b6d4'];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-black tracking-tight text-foreground">Resultados de Comparación</h2>
                        <p className="text-muted-foreground">Análisis detallado y ranking de lotes final.</p>
                    </div>
                    <ExportButton proyectoId={proyecto.id} projectName={proyecto.nombre} />
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rankingData.slice(0, 3).map((lote: any, index: number) => (
                        <Card key={lote.id} className={cn(
                            "relative overflow-hidden border-2 transition-all hover:scale-[1.03]",
                            index === 0 ? "border-primary/40 bg-primary/5 shadow-xl shadow-primary/10" : "border-border shadow-md"
                        )}>
                            {index === 0 && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Trophy className="h-10 w-10 text-primary opacity-20 -rotate-12" />
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black",
                                        index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Posición</p>
                                </div>
                                <CardTitle className="text-xl truncate">{lote.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-primary">{lote.total.toFixed(1)}</span>
                                    <span className="text-sm font-medium text-muted-foreground">puntos</span>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {template.clasificaciones.map((c: any) => (
                                        <div key={c.id} className="flex justify-between text-[11px]">
                                            <span className="text-muted-foreground">{c.nombre}</span>
                                            <span className="font-bold">{(lote[c.nombre] || 0).toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Puntaje Total por Lote</CardTitle>
                            <CardDescription>Comparativa visual del rendimiento general.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
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
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Perfil por Clasificación</CardTitle>
                            <CardDescription>Fortalezas y debilidades comparadas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid opacity={0.3} />
                                        <PolarAngleAxis dataKey="subject" fontSize={10} />
                                        <PolarRadiusAxis fontSize={10} axisLine={false} tick={false} />
                                        {rankingData.slice(0, 4).map((lote: any, index: number) => (
                                            <Radar
                                                key={lote.id}
                                                name={lote.nombre}
                                                dataKey={lote.nombre}
                                                stroke={colors[index]}
                                                fill={colors[index]}
                                                fillOpacity={0.1}
                                            />
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
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b">
                        <CardTitle className="text-lg">Ranking Detallado</CardTitle>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">Pos</TableHead>
                                <TableHead>Lote</TableHead>
                                {template.clasificaciones.map((c: any) => (
                                    <TableHead key={c.id} className="text-right text-[10px] uppercase font-bold tracking-tight">
                                        {c.nombre}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right font-black text-primary">TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankingData.map((lote: any, index: number) => (
                                <TableRow key={lote.id} className={cn(index === 0 && "bg-primary/5")}>
                                    <TableCell className="text-center font-bold">
                                        {index === 0 ? <Medal className="h-4 w-4 text-primary inline" /> : index + 1}
                                    </TableCell>
                                    <TableCell className="font-semibold">{lote.nombre}</TableCell>
                                    {template.clasificaciones.map((c: any) => (
                                        <TableCell key={c.id} className="text-right text-xs">
                                            {(lote[c.nombre] || 0).toFixed(1)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right font-black text-lg text-primary">
                                        {lote.total.toFixed(1)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
