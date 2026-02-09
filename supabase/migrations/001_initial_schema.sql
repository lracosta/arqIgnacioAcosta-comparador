-- ============================================
-- SCHEMA: comparador-arqIgnacioAcosta
-- Sistema de comparación de lotes inmobiliarios
-- con versionado de plantillas
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users (extensión de auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cliente')) DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: plantilla_versiones
-- Sistema de versionado de plantillas
-- ============================================
CREATE TABLE public.plantilla_versiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para buscar versión activa rápidamente
CREATE INDEX idx_plantilla_versiones_activa ON public.plantilla_versiones(activa) WHERE activa = true;

-- ============================================
-- TABLA: clasificaciones
-- ============================================
CREATE TABLE public.clasificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plantilla_version_id UUID NOT NULL REFERENCES public.plantilla_versiones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clasificaciones_version ON public.clasificaciones(plantilla_version_id);

-- ============================================
-- TABLA: criterios
-- ============================================
CREATE TABLE public.criterios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clasificacion_id UUID NOT NULL REFERENCES public.clasificaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  puntaje_maximo DECIMAL(10,2) NOT NULL CHECK (puntaje_maximo > 0),
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_criterios_clasificacion ON public.criterios(clasificacion_id);

-- ============================================
-- TABLA: factores
-- ============================================
CREATE TABLE public.factores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criterio_id UUID NOT NULL REFERENCES public.criterios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_factores_criterio ON public.factores(criterio_id);

-- ============================================
-- TABLA: opciones_factor
-- ============================================
CREATE TABLE public.opciones_factor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_id UUID NOT NULL REFERENCES public.factores(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  valor DECIMAL(3,2) NOT NULL CHECK (valor >= 0 AND valor <= 1),
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_opciones_factor ON public.opciones_factor(factor_id);

-- ============================================
-- TABLA: proyectos
-- ============================================
CREATE TABLE public.proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  cliente_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  plantilla_version_id UUID NOT NULL REFERENCES public.plantilla_versiones(id) ON DELETE RESTRICT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_proyectos_cliente ON public.proyectos(cliente_id);
CREATE INDEX idx_proyectos_version ON public.proyectos(plantilla_version_id);

CREATE TRIGGER update_proyectos_updated_at
  BEFORE UPDATE ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: lotes
-- ============================================
CREATE TABLE public.lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lotes_proyecto ON public.lotes(proyecto_id);

-- ============================================
-- TABLA: evaluaciones
-- ============================================
CREATE TABLE public.evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  factor_id UUID NOT NULL REFERENCES public.factores(id) ON DELETE CASCADE,
  opcion_id UUID NOT NULL REFERENCES public.opciones_factor(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lote_id, factor_id)
);

CREATE INDEX idx_evaluaciones_lote ON public.evaluaciones(lote_id);

CREATE TRIGGER update_evaluaciones_updated_at
  BEFORE UPDATE ON public.evaluaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantilla_versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clasificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criterios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opciones_factor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: users
-- ============================================
-- Admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Solo admins pueden crear usuarios
CREATE POLICY "Only admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Only admins can delete users" ON public.users
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: plantilla_versiones
-- Todos pueden leer, solo admins pueden modificar
-- ============================================
CREATE POLICY "All authenticated users can view plantilla_versiones" ON public.plantilla_versiones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify plantilla_versiones" ON public.plantilla_versiones
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: clasificaciones
-- Todos pueden leer, solo admins pueden modificar
-- ============================================
CREATE POLICY "All authenticated users can view clasificaciones" ON public.clasificaciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify clasificaciones" ON public.clasificaciones
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: criterios
-- Todos pueden leer, solo admins pueden modificar
-- ============================================
CREATE POLICY "All authenticated users can view criterios" ON public.criterios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify criterios" ON public.criterios
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: factores
-- Todos pueden leer, solo admins pueden modificar
-- ============================================
CREATE POLICY "All authenticated users can view factores" ON public.factores
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify factores" ON public.factores
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: opciones_factor
-- Todos pueden leer, solo admins pueden modificar
-- ============================================
CREATE POLICY "All authenticated users can view opciones_factor" ON public.opciones_factor
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify opciones_factor" ON public.opciones_factor
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: proyectos
-- Admins ven todos, clientes solo los suyos
-- ============================================
CREATE POLICY "Admins can view all proyectos" ON public.proyectos
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Clientes can view own proyectos" ON public.proyectos
  FOR SELECT USING (cliente_id = auth.uid());

CREATE POLICY "Only admins can insert proyectos" ON public.proyectos
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can update proyectos" ON public.proyectos
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can delete proyectos" ON public.proyectos
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: lotes
-- Clientes solo pueden ver lotes de sus proyectos
-- ============================================
CREATE POLICY "Admins can view all lotes" ON public.lotes
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Clientes can view lotes of own proyectos" ON public.lotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = proyecto_id AND p.cliente_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can modify lotes" ON public.lotes
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- POLÍTICAS: evaluaciones
-- Clientes pueden modificar evaluaciones de sus proyectos
-- ============================================
CREATE POLICY "Admins can view all evaluaciones" ON public.evaluaciones
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Clientes can view evaluaciones of own proyectos" ON public.evaluaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lotes l
      JOIN public.proyectos p ON p.id = l.proyecto_id
      WHERE l.id = lote_id AND p.cliente_id = auth.uid()
    )
  );

CREATE POLICY "Clientes can insert evaluaciones for own proyectos" ON public.evaluaciones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lotes l
      JOIN public.proyectos p ON p.id = l.proyecto_id
      WHERE l.id = lote_id AND p.cliente_id = auth.uid()
    )
  );

CREATE POLICY "Clientes can update evaluaciones for own proyectos" ON public.evaluaciones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lotes l
      JOIN public.proyectos p ON p.id = l.proyecto_id
      WHERE l.id = lote_id AND p.cliente_id = auth.uid()
    )
  );

CREATE POLICY "Clientes can delete evaluaciones for own proyectos" ON public.evaluaciones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lotes l
      JOIN public.proyectos p ON p.id = l.proyecto_id
      WHERE l.id = lote_id AND p.cliente_id = auth.uid()
    )
  );

-- ============================================
-- FUNCIÓN: Crear usuario después del signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario en public.users cuando se registra
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCIÓN: Obtener la versión activa de la plantilla
-- ============================================
CREATE OR REPLACE FUNCTION public.get_active_plantilla_version()
RETURNS UUID AS $$
DECLARE
  version_id UUID;
BEGIN
  SELECT id INTO version_id
  FROM public.plantilla_versiones
  WHERE activa = true
  LIMIT 1;
  
  RETURN version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN: Crear nueva versión de plantilla
-- Copia toda la estructura de la versión actual
-- ============================================
CREATE OR REPLACE FUNCTION public.create_new_plantilla_version(
  p_nombre TEXT,
  p_descripcion TEXT DEFAULT NULL,
  p_from_version_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_version_id UUID;
  new_version_number INTEGER;
  source_version_id UUID;
  old_clasificacion_id UUID;
  new_clasificacion_id UUID;
  old_criterio_id UUID;
  new_criterio_id UUID;
  old_factor_id UUID;
  new_factor_id UUID;
BEGIN
  -- Determinar versión fuente (la especificada o la activa)
  IF p_from_version_id IS NOT NULL THEN
    source_version_id := p_from_version_id;
  ELSE
    source_version_id := public.get_active_plantilla_version();
  END IF;
  
  -- Calcular nuevo número de versión
  SELECT COALESCE(MAX(version), 0) + 1 INTO new_version_number
  FROM public.plantilla_versiones;
  
  -- Crear nueva versión
  INSERT INTO public.plantilla_versiones (version, nombre, descripcion, activa)
  VALUES (new_version_number, p_nombre, p_descripcion, false)
  RETURNING id INTO new_version_id;
  
  -- Si hay versión fuente, copiar toda la estructura
  IF source_version_id IS NOT NULL THEN
    -- Copiar clasificaciones
    FOR old_clasificacion_id IN 
      SELECT id FROM public.clasificaciones WHERE plantilla_version_id = source_version_id
    LOOP
      INSERT INTO public.clasificaciones (plantilla_version_id, nombre, descripcion, orden)
      SELECT new_version_id, nombre, descripcion, orden
      FROM public.clasificaciones WHERE id = old_clasificacion_id
      RETURNING id INTO new_clasificacion_id;
      
      -- Copiar criterios de esta clasificación
      FOR old_criterio_id IN
        SELECT id FROM public.criterios WHERE clasificacion_id = old_clasificacion_id
      LOOP
        INSERT INTO public.criterios (clasificacion_id, nombre, descripcion, puntaje_maximo, orden)
        SELECT new_clasificacion_id, nombre, descripcion, puntaje_maximo, orden
        FROM public.criterios WHERE id = old_criterio_id
        RETURNING id INTO new_criterio_id;
        
        -- Copiar factores de este criterio
        FOR old_factor_id IN
          SELECT id FROM public.factores WHERE criterio_id = old_criterio_id
        LOOP
          INSERT INTO public.factores (criterio_id, nombre, descripcion, orden)
          SELECT new_criterio_id, nombre, descripcion, orden
          FROM public.factores WHERE id = old_factor_id
          RETURNING id INTO new_factor_id;
          
          -- Copiar opciones de este factor
          INSERT INTO public.opciones_factor (factor_id, nombre, valor, orden)
          SELECT new_factor_id, nombre, valor, orden
          FROM public.opciones_factor WHERE factor_id = old_factor_id;
        END LOOP;
      END LOOP;
    END LOOP;
  END IF;
  
  RETURN new_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN: Activar una versión de plantilla
-- ============================================
CREATE OR REPLACE FUNCTION public.activate_plantilla_version(p_version_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Desactivar todas las versiones
  UPDATE public.plantilla_versiones SET activa = false;
  
  -- Activar la versión especificada
  UPDATE public.plantilla_versiones SET activa = true WHERE id = p_version_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATOS INICIALES: Crear primera versión vacía
-- ============================================
INSERT INTO public.plantilla_versiones (version, nombre, descripcion, activa)
VALUES (1, 'Versión Inicial', 'Primera versión de la plantilla de comparación', true);
