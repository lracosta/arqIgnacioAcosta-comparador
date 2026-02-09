// ============================================
// Utilidades de cálculo de puntajes
// según las fórmulas del SOP
// ============================================

import type {
    Criterio,
    Factor,
    Evaluacion,
    PuntajeFactor,
    PuntajeCriterio,
    PuntajeClasificacion,
    PuntajeLote,
    Lote,
    Clasificacion,
    ClasificacionConCriterios,
} from "@/types";

/**
 * Calcula el puntaje de un factor
 * Fórmula: Puntaje = Valor del factor × Puntaje máximo del criterio
 */
export function calcularPuntajeFactor(
    factor: Factor | null,
    puntajeMaximoCriterio: number
): number {
    if (!factor) return 0;
    return (factor.valor || 0) * puntajeMaximoCriterio;
}

/**
 * Calcula el puntaje de un criterio basado en el factor seleccionado
 */
export function calcularPuntajeCriterio(
    criterio: Criterio,
    factores: Factor[],
    evaluaciones: Map<string, Factor | null> // criterio_id -> factor seleccionado
): PuntajeCriterio {
    const factorSeleccionado = evaluaciones.get(criterio.id) || null;
    const puntaje = calcularPuntajeFactor(factorSeleccionado, criterio.puntaje_maximo);

    return {
        criterio_id: criterio.id,
        criterio,
        factor_seleccionado: factorSeleccionado,
        puntaje,
        puntaje_maximo: criterio.puntaje_maximo,
        porcentaje: criterio.puntaje_maximo > 0 ? (puntaje / criterio.puntaje_maximo) * 100 : 0,
    };
}

/**
 * Calcula el puntaje de una clasificación
 */
export function calcularPuntajeClasificacion(
    clasificacion: Clasificacion,
    puntajesCriterios: PuntajeCriterio[]
): PuntajeClasificacion {
    const puntaje = puntajesCriterios.reduce((acc, pc) => acc + pc.puntaje, 0);
    const puntajeMaximo = puntajesCriterios.reduce((acc, pc) => acc + pc.puntaje_maximo, 0);

    return {
        clasificacion_id: clasificacion.id,
        clasificacion,
        criterios: puntajesCriterios,
        puntaje,
        puntaje_maximo: puntajeMaximo,
        porcentaje: puntajeMaximo > 0 ? (puntaje / puntajeMaximo) * 100 : 0,
    };
}

/**
 * Calcula el puntaje total de un lote
 */
export function calcularPuntajeLote(
    lote: Lote,
    puntajesClasificaciones: PuntajeClasificacion[]
): PuntajeLote {
    const puntajeTotal = puntajesClasificaciones.reduce((acc, pc) => acc + pc.puntaje, 0);
    const puntajeMaximo = puntajesClasificaciones.reduce((acc, pc) => acc + pc.puntaje_maximo, 0);

    return {
        lote_id: lote.id,
        lote,
        clasificaciones: puntajesClasificaciones,
        puntaje_total: puntajeTotal,
        puntaje_maximo: puntajeMaximo,
        porcentaje: puntajeMaximo > 0 ? (puntajeTotal / puntajeMaximo) * 100 : 0,
    };
}

/**
 * Calcula el puntaje completo de un lote
 */
export function calcularPuntajeLoteCompleto(
    lote: Lote,
    plantilla: ClasificacionConCriterios[],
    evaluaciones: Evaluacion[],
    todosLosFactores: Factor[]
): PuntajeLote {
    // Mapa de factor_id -> Factor
    const factorMap = new Map<string, Factor>();
    todosLosFactores.forEach(f => factorMap.set(f.id, f));

    // Mapa de criterio_id -> Factor seleccionado
    const criterioSelecMap = new Map<string, Factor | null>();

    // Agrupar factores por criterio para búsqueda rápida si es necesario, 
    // pero aquí buscamos por evaluación.
    const evaluationsOfLote = evaluaciones.filter(e => e.lote_id === lote.id);

    evaluationsOfLote.forEach(e => {
        const factor = factorMap.get(e.factor_id);
        if (factor) {
            criterioSelecMap.set(factor.criterio_id, factor);
        }
    });

    const puntajesClasificaciones: PuntajeClasificacion[] = plantilla.map(clasif => {
        const puntajesCriterios: PuntajeCriterio[] = clasif.criterios.map(crit => {
            return calcularPuntajeCriterio(crit, crit.factores, criterioSelecMap);
        });

        return calcularPuntajeClasificacion(clasif, puntajesCriterios);
    });

    return calcularPuntajeLote(lote, puntajesClasificaciones);
}

/**
 * Ordena lotes por puntaje total (descendente) para crear el ranking
 */
export function crearRanking(puntajesLotes: PuntajeLote[]): PuntajeLote[] {
    return [...puntajesLotes].sort(
        (a, b) => b.puntaje_total - a.puntaje_total
    );
}

/**
 * Formatea un puntaje a 2 decimales
 */
export function formatearPuntaje(puntaje: number): string {
    return puntaje.toFixed(2);
}

/**
 * Formatea un porcentaje a 1 decimal
 */
export function formatearPorcentaje(porcentaje: number): string {
    return `${porcentaje.toFixed(1)}%`;
}
