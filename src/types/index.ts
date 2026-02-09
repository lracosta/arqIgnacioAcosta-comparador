// ============================================
// Tipos TypeScript para comparador-arqIgnacioAcosta
// Estos tipos se generarán automáticamente con:
// npx supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts
// ============================================

// Por ahora, definimos tipos manuales que coinciden con el schema

export type UserRole = "admin" | "cliente";

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface PlantillaVersion {
    id: string;
    version: number;
    nombre: string;
    descripcion: string | null;
    activa: boolean;
    created_at: string;
}

export interface Clasificacion {
    id: string;
    plantilla_version_id: string;
    nombre: string;
    descripcion: string | null;
    orden: number;
    created_at: string;
}

export interface Criterio {
    id: string;
    clasificacion_id: string;
    nombre: string;
    descripcion: string;
    puntaje_maximo: number;
    orden: number;
    created_at: string;
}

export interface Factor {
    id: string;
    criterio_id: string;
    nombre: string;
    descripcion: string | null;
    valor: number; // 0.00 a 1.00 - Agregado directamente
    orden: number;
    created_at: string;
}

export type EstadoProyecto = "activo" | "archivado";

export interface Proyecto {
    id: string;
    nombre: string;
    descripcion: string | null;
    cliente_id: string;
    plantilla_version_id: string;
    estado: EstadoProyecto;
    created_at: string;
    updated_at: string;
}

export interface Lote {
    id: string;
    proyecto_id: string;
    nombre: string;
    ubicacion: string;
    descripcion: string | null;
    orden: number;
    created_at: string;
}

export interface Evaluacion {
    id: string;
    lote_id: string;
    factor_id: string;
    criterio_id?: string; // Columna opcional/nueva
    created_at: string;
    updated_at: string;
}

// ============================================
// Tipos extendidos para vistas con relaciones
// ============================================

export interface ClasificacionConCriterios extends Clasificacion {
    criterios: CriterioConFactores[];
}

export interface CriterioConFactores extends Criterio {
    factores: Factor[];
}

export interface PlantillaVersionCompleta extends PlantillaVersion {
    clasificaciones: ClasificacionConCriterios[];
}

export interface ProyectoConLotes extends Proyecto {
    lotes: Lote[];
    cliente?: User;
    plantilla_version?: PlantillaVersion;
}

export interface LoteConEvaluaciones extends Lote {
    evaluaciones: Evaluacion[];
}

// ============================================
// Tipos para cálculos de puntajes
// ============================================

export interface PuntajeFactor {
    factor_id: string;
    factor: Factor | null;
    puntaje: number; // valor * puntaje_maximo del criterio
}

export interface PuntajeCriterio {
    criterio_id: string;
    criterio: Criterio;
    factor_seleccionado: Factor | null;
    puntaje: number; // valor del factor seleccionado * puntaje_maximo
    puntaje_maximo: number;
    porcentaje: number;
}

export interface PuntajeClasificacion {
    clasificacion_id: string;
    clasificacion: Clasificacion;
    criterios: PuntajeCriterio[];
    puntaje: number; // suma de puntajes de criterios
    puntaje_maximo: number;
    porcentaje: number;
}

export interface PuntajeLote {
    lote_id: string;
    lote: Lote;
    clasificaciones: PuntajeClasificacion[];
    puntaje_total: number;
    puntaje_maximo: number;
    porcentaje: number;
}

export interface ResultadoComparacion {
    proyecto: Proyecto;
    lotes: PuntajeLote[];
    ranking: PuntajeLote[]; // ordenados por puntaje total desc
}

// ============================================
// Tipos para formularios
// ============================================

export interface CreateClasificacionInput {
    nombre: string;
    descripcion?: string;
    orden?: number;
}

export interface CreateCriterioInput {
    clasificacion_id: string;
    nombre: string;
    descripcion: string;
    puntaje_maximo: number;
    orden?: number;
}

export interface CreateFactorInput {
    criterio_id: string;
    nombre: string;
    valor: number;
    descripcion?: string;
    orden?: number;
}

export interface CreateProyectoInput {
    nombre: string;
    descripcion?: string;
    cliente_id: string;
}

export interface CreateLoteInput {
    proyecto_id: string;
    nombre: string;
    ubicacion: string;
    descripcion?: string;
    orden?: number;
}

export interface CreateEvaluacionInput {
    lote_id: string;
    factor_id: string;
}
