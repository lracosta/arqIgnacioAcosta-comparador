# SOP - Procedimiento de Desarrollo

# comparador-arqIgnacioAcosta

**Sistema web de comparación objetiva de lotes inmobiliarios**

---

**Versión:** 1.0  
**Fecha:** 09/02/2026  
**Para:** Claude / Antigravity - Desarrollo de Aplicación

---

## 📋 RESUMEN EJECUTIVO

### Objetivo del Proyecto

Desarrollar una aplicación web que permita a clientes de arquitectura comparar objetivamente diferentes lotes inmobiliarios mediante un sistema de ponderación personalizable.

### Información General

- **Nombre de la aplicación:** comparador-arqIgnacioAcosta
- **Idioma:** Español (toda la interfaz)
- **Usuarios:** Dos roles - Administradores (crean plantillas y proyectos) y Clientes (realizan comparaciones)

### Stack Tecnológico Obligatorio

- **Frontend:** React (última versión) + Next.js (última versión con App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Deployment:** Vercel (recomendado) o alternativa compatible con Next.js

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Estructura de Datos Jerárquica

La aplicación maneja una estructura de 3 niveles para las comparaciones:

```
NIVEL 1: CLASIFICACIÓN
    └─ Agrupa criterios relacionados
    └─ Ejemplo: "Criterios Ambientales", "Documentación Legal"
    └─ Su puntaje máximo = suma de puntajes de sus criterios
    
    NIVEL 2: CRITERIO
        └─ Pertenece a una clasificación
        └─ Agrupa factores relacionados
        └─ Tiene un PUNTAJE MÁXIMO asignado
        └─ Ejemplo: "Arbolado" (max: 10 pts), "Riesgo Hídrico" (max: 15 pts)
        
        NIVEL 3: FACTOR
            └─ Pertenece a un criterio
            └─ Es el elemento individual de comparación
            └─ Tiene múltiples OPCIONES con valores ponderados (0.0 a 1.0)
            └─ Ejemplo: "¿Ubicación del arbolado?"
                └─ Opción 1: "Dentro del lote" (valor: 1.0)
                └─ Opción 2: "En vereda" (valor: 0.5)
                └─ Opción 3: "Sin arbolado" (valor: 0.0)
```

### Fórmula de Cálculo de Puntuaciones

Para cada lote, cuando el cliente selecciona opciones:

1. **Puntaje del Factor** = Valor de opción seleccionada × Puntaje máximo del criterio
2. **Puntaje del Criterio** = Promedio de puntajes de todos sus factores
3. **Puntaje de Clasificación** = Suma de puntajes de todos sus criterios
4. **Puntaje Total del Lote** = Suma de puntajes de todas las clasificaciones

#### Ejemplo de cálculo:

```
Criterio: "Arbolado" (puntaje máximo: 10)
  Factor 1: "Ubicación" → selección: "Dentro del lote" (valor: 1.0)
    → Puntaje = 1.0 × 10 = 10.0 pts
  
  Factor 2: "Proyecta sombra" → selección: "Parcialmente" (valor: 0.5)
    → Puntaje = 0.5 × 10 = 5.0 pts

  Puntaje del Criterio "Arbolado" = (10.0 + 5.0) / 2 = 7.5 pts
```

---

## 💾 ESQUEMA DE BASE DE DATOS (SUPABASE)

Crear las siguientes tablas en Supabase PostgreSQL:

### Tabla: `users` (extender auth.users de Supabase)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK | ID del usuario (de auth.users) |
| email | TEXT | UNIQUE, NOT NULL | Email del usuario |
| role | TEXT | NOT NULL, CHECK | Rol: 'admin' o 'cliente' |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Última actualización |

### Tabla: `clasificaciones`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| nombre | TEXT | NOT NULL | Nombre de la clasificación |
| descripcion | TEXT | NULL | Descripción opcional |
| orden | INTEGER | NOT NULL, DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |

### Tabla: `criterios`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| clasificacion_id | UUID | FK → clasificaciones(id) | Clasificación a la que pertenece |
| nombre | TEXT | NOT NULL | Nombre del criterio |
| descripcion | TEXT | NOT NULL | Descripción del criterio |
| puntaje_maximo | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Puntaje máximo del criterio |
| orden | INTEGER | NOT NULL, DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |

### Tabla: `factores`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| criterio_id | UUID | FK → criterios(id) | Criterio al que pertenece |
| nombre | TEXT | NOT NULL | Nombre del factor |
| descripcion | TEXT | NULL | Pregunta o descripción |
| orden | INTEGER | NOT NULL, DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |

### Tabla: `opciones_factor`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| factor_id | UUID | FK → factores(id) | Factor al que pertenece |
| nombre | TEXT | NOT NULL | Nombre de la opción |
| valor | DECIMAL(3,2) | NOT NULL, CHECK 0-1 | Valor ponderado (0.00 a 1.00) |
| orden | INTEGER | NOT NULL, DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |

### Tabla: `proyectos`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| nombre | TEXT | NOT NULL | Nombre del proyecto |
| descripcion | TEXT | NULL | Descripción opcional |
| cliente_id | UUID | FK → users(id) | Cliente asignado |
| estado | TEXT | DEFAULT 'activo' | "activo" o "archivado" |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Última actualización |

### Tabla: `lotes`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| proyecto_id | UUID | FK → proyectos(id) | Proyecto al que pertenece |
| nombre | TEXT | NOT NULL | Nombre del lote |
| ubicacion | TEXT | NOT NULL | Ubicación del lote |
| descripcion | TEXT | NULL | Descripción opcional |
| orden | INTEGER | NOT NULL, DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |

### Tabla: `evaluaciones`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ID único |
| lote_id | UUID | FK → lotes(id) | Lote evaluado |
| factor_id | UUID | FK → factores(id) | Factor evaluado |
| opcion_id | UUID | FK → opciones_factor(id) | Opción seleccionada |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Última actualización |

**Constraint único:** `UNIQUE(lote_id, factor_id)` — Solo una opción por factor por lote

---

## 🔒 ROW LEVEL SECURITY (RLS) - CRÍTICO

**IMPORTANTE:** Implementar las siguientes políticas de seguridad en Supabase:

### Políticas para tabla "proyectos":

- **Lectura (SELECT):** Los admins ven todos. Los clientes solo ven WHERE cliente_id = auth.uid()
- **Inserción (INSERT):** Solo admins (role = 'admin')
- **Actualización (UPDATE):** Solo admins
- **Eliminación (DELETE):** Solo admins

### Políticas para tabla "lotes":

Los clientes solo pueden ver lotes de sus proyectos asignados (JOIN con proyectos)

### Políticas para tabla "evaluaciones":

Los clientes solo pueden modificar evaluaciones de lotes de sus proyectos

### Políticas para tablas de plantilla (clasificaciones, criterios, factores, opciones):

Todos pueden leer, solo admins pueden modificar

---

## 👥 FUNCIONALIDADES POR ROL DE USUARIO

### ROL: ADMINISTRADOR

#### 1. Gestión de Plantillas de Comparación

- Crear, editar y eliminar Clasificaciones
- Crear, editar y eliminar Criterios (con puntaje máximo)
- Crear, editar y eliminar Factores
- Para cada Factor, crear múltiples Opciones con valores 0.0 a 1.0
- Reordenar elementos (drag and drop recomendado)
- Vista previa de la estructura completa

#### 2. Gestión de Proyectos

- Crear proyecto: nombre, descripción, asignar cliente
- Agregar múltiples lotes al proyecto (nombre, ubicación, descripción)
- Editar/eliminar proyectos y lotes
- Ver lista de todos los proyectos
- Cambiar estado (activo/archivado)

#### 3. Gestión de Usuarios (opcional para v1)

Crear cuentas de cliente, asignar roles, etc.

### ROL: CLIENTE

#### 1. Vista de Proyectos

- Ver solo los proyectos asignados a él
- Ver información: nombre, descripción, cantidad de lotes, progreso

#### 2. Interfaz de Comparación

- Seleccionar un proyecto
- Ver todos los lotes del proyecto en vista comparativa
- Para cada lote, seleccionar opciones en cada factor
- Ver cálculo automático de puntuaciones en tiempo real
- Ver desglose por Clasificación, Criterio y Factor
- Ver ranking de lotes (ordenados por puntaje total)
- Ver porcentaje alcanzado vs puntaje máximo
- Poder cambiar selecciones y ver actualización instantánea

---

## 🎨 GUÍA DE DISEÑO VISUAL

*Basado en imagen de referencia proporcionada*

El diseño de comparador-arqIgnacioAcosta debe seguir un estilo moderno, limpio y minimalista similar al dashboard de referencia.

### Paleta de Colores Oficial

| Uso | Color | Hex | Aplicación |
|-----|-------|-----|------------|
| Primario (Verde) | Verde brillante | `#8BC34A` | CTAs principales, tarjetas destacadas, éxito |
| Fondo principal | Blanco | `#FFFFFF` | Fondo de la aplicación |
| Fondo secundario | Gris muy claro | `#F5F7FA` | Fondos de secciones, cards |
| Texto principal | Gris oscuro | `#1A1A1A` | Títulos, texto principal |
| Texto secundario | Gris medio | `#6B7280` | Subtítulos, texto descriptivo |
| Bordes/Divisores | Gris claro | `#E5E7EB` | Bordes de cards, líneas divisorias |
| Acento amarillo | Amarillo suave | `#FFF59D` | Gráficos, highlights |
| Acento naranja | Naranja suave | `#FFB74D` | Gráficos, estados de alerta |
| Acento azul | Azul claro | `#E3F2FD` | Información, enlaces |
| Error/Negativo | Rojo suave | `#EF5350` | Errores, eliminaciones, negativos |

### Tipografía

**Fuente principal:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

**Características:**
- Fuente moderna y altamente legible
- Excelente para interfaces digitales
- Disponible en Google Fonts
- Fallback a fuentes del sistema

#### Escala de Tamaños:

| Elemento | Tamaño | Peso (Weight) |
|----------|--------|---------------|
| Título principal (H1) | 32px (2rem) | Bold (700) |
| Título sección (H2) | 24px (1.5rem) | Semibold (600) |
| Subtítulo (H3) | 20px (1.25rem) | Semibold (600) |
| Título card | 18px (1.125rem) | Medium (500) |
| Texto principal | 16px (1rem) | Regular (400) |
| Texto secundario | 14px (0.875rem) | Regular (400) |
| Texto pequeño | 12px (0.75rem) | Regular (400) |
| Labels/Etiquetas | 12px (0.75rem) | Medium (500) |

### Componentes de Interfaz

#### 1. Cards (Tarjetas)

**Características:**
- Fondo: Blanco (#FFFFFF)
- Borde: 1px sólido #E5E7EB
- Border radius: 12px (redondeado suave)
- Padding: 20px - 24px
- Box shadow: `0 1px 3px rgba(0, 0, 0, 0.05)`
- Hover: shadow más pronunciada: `0 4px 12px rgba(0, 0, 0, 0.08)`

#### 2. Botones

| Tipo | Estilo | Uso |
|------|--------|-----|
| Primario | Fondo: #8BC34A, Texto: blanco, Hover: #7CB342 | Acciones principales (Guardar, Crear, Enviar) |
| Secundario | Fondo: transparent, Borde: 1px #E5E7EB, Texto: #1A1A1A | Acciones secundarias (Cancelar, Volver) |
| Peligro | Fondo: #EF5350, Texto: blanco | Eliminar, acciones destructivas |

**Características comunes de botones:**
- Border radius: 8px
- Padding: 10px 20px (tamaño normal), 8px 16px (pequeño)
- Font size: 14px - 16px
- Font weight: Medium (500)
- Transición suave: all 0.2s ease
- Cursor: pointer
- Estados: normal, hover, active, disabled

#### 3. Inputs y Formularios

- Fondo: Blanco (#FFFFFF)
- Borde: 1px sólido #E5E7EB
- Border radius: 8px
- Padding: 10px 14px
- Font size: 14px
- Placeholder color: #9CA3AF
- Focus: Borde #8BC34A, outline none, box-shadow: `0 0 0 3px rgba(139, 195, 74, 0.1)`
- Error: Borde #EF5350
- Disabled: Fondo #F5F7FA, texto #9CA3AF

#### 4. Tablas

- Header: Fondo #F5F7FA, texto #6B7280, font-weight: 600
- Filas: Fondo blanco, hover: #F9FAFB
- Borde entre filas: 1px #E5E7EB
- Padding celdas: 12px 16px
- Font size: 14px
- Columna de acciones: alineada a la derecha
- Sorting indicators: flechas sutiles en header

#### 5. Sidebar/Navegación

- Ancho: 240px - 280px
- Fondo: Blanco (#FFFFFF) o #F5F7FA
- Borde derecho: 1px #E5E7EB
- Items de menú:
  - Padding: 10px 16px
  - Border radius: 8px
  - Hover: Fondo #F5F7FA
  - Activo: Fondo #E8F5E9, texto #8BC34A, borde izquierdo verde
- Iconos: 20px × 20px, alineados a la izquierda
- Texto: 14px, Medium (500)

#### 6. Badges y Labels

- Padding: 4px 10px
- Border radius: 12px (píldora)
- Font size: 12px
- Font weight: Medium (500)
- Variantes:
  - **Éxito:** Fondo #E8F5E9, texto #4CAF50
  - **Advertencia:** Fondo #FFF3E0, texto #FF9800
  - **Error:** Fondo #FFEBEE, texto #F44336
  - **Info:** Fondo #E3F2FD, texto #2196F3
  - **Neutro:** Fondo #F5F7FA, texto #6B7280

### Espaciado y Layout

#### Sistema de Espaciado (Múltiplos de 4px):

| Token | Valor | Uso |
|-------|-------|-----|
| xs | 4px | Espaciado mínimo |
| sm | 8px | Espacios pequeños entre elementos relacionados |
| md | 12px | Espaciado estándar entre elementos |
| lg | 16px | Padding de componentes |
| xl | 20px | Espaciado entre secciones pequeñas |
| 2xl | 24px | Padding de cards, espaciado entre secciones |
| 3xl | 32px | Separación entre secciones principales |
| 4xl | 48px | Márgenes grandes |

#### Grid y Contenedores:

- Max-width contenedor principal: 1400px
- Padding lateral contenedor: 20px (mobile), 40px (desktop)
- Gap entre cards en grid: 20px - 24px
- Columnas responsivas:
  - Mobile: 1 columna
  - Tablet: 2 columnas
  - Desktop: 3-4 columnas según contenido

### Iconografía

- Biblioteca recomendada: Lucide React
- Tamaños estándar: 16px, 20px, 24px
- Stroke width: 2px
- Color por defecto: mismo que texto (#6B7280)
- Color en estado activo/hover: #8BC34A
- Uso: siempre acompañar labels importantes con iconos
- Posición: generalmente a la izquierda del texto

### Gráficos y Visualizaciones

**Para la visualización de resultados de comparación:**

- Biblioteca: Recharts (React)
- Colores de gráficos (en orden): #8BC34A, #FFF59D, #FFB74D, #E3F2FD, #FFCDD2
- Background de gráficos: transparente
- Grid lines: #E5E7EB, muy sutiles
- Tooltips: fondo blanco, sombra suave, borde gris claro
- Labels: 12px, color #6B7280
- Valores numéricos: destacados en #1A1A1A

#### Tipos de visualización recomendados:

- **Barras horizontales:** para comparar puntajes de lotes
- **Gráfico de radar:** para comparar múltiples criterios entre lotes
- **Progress bars:** para mostrar % alcanzado vs puntaje máximo
- **Tabla comparativa:** para vista detallada de todos los factores

### Estados y Feedback Visual

#### Loading States:

- Skeleton loaders con animación pulse
- Color: #E5E7EB
- Spinners: color #8BC34A
- Mostrar durante carga de datos

#### Empty States:

- Icono grande (48px - 64px), color #9CA3AF
- Título: "No hay [contenido]"
- Descripción breve de qué hacer
- CTA para crear contenido (si aplica)
- Centrado vertical y horizontalmente

#### Error States:

- Color de acento: #EF5350
- Icono de alerta/error
- Mensaje claro y accionable
- Opción de reintentar cuando sea posible

#### Success Feedback:

- Toast notifications: esquina superior derecha
- Fondo: #E8F5E9, borde izquierdo #8BC34A
- Duración: 3-5 segundos
- Icono de check
- Animación suave de entrada/salida

### Animaciones y Transiciones

**Principios:**
- Sutiles y funcionales, no decorativas
- Duración: 150ms - 300ms
- Easing: ease-in-out o cubic-bezier para naturalidad
- Hover states: siempre con transición
- Page transitions: fade in suave

**Ejemplo de transiciones (Tailwind CSS):**

```css
// Transiciones estándar
transition-colors duration-200 ease-in-out
transition-all duration-300 ease-in-out

// Hover en botón
hover:bg-green-600 hover:shadow-lg transition-all duration-200

// Hover en card
hover:shadow-md hover:-translate-y-1 transition-all duration-200
```

### Diseño Responsive

#### Breakpoints (Tailwind CSS):

- **sm:** 640px - Móvil horizontal
- **md:** 768px - Tablet vertical
- **lg:** 1024px - Tablet horizontal / Desktop pequeño
- **xl:** 1280px - Desktop
- **2xl:** 1536px - Desktop grande

#### Consideraciones por dispositivo:

| Dispositivo | Consideraciones |
|-------------|-----------------|
| Mobile (<768px) | Sidebar colapsado en hamburger menu, tablas con scroll horizontal, formularios en 1 columna, espaciado reducido |
| Tablet (768-1023px) | Sidebar visible u opcional, grids de 2 columnas, formularios pueden ser 2 columnas |
| Desktop (>1024px) | Sidebar siempre visible, grids de 3-4 columnas, máximo uso de espacio horizontal |

### Accesibilidad (A11y)

- Contraste mínimo WCAG AA: 4.5:1 para texto normal
- Contraste mínimo WCAG AA: 3:1 para texto grande (>18px)
- Focus visible: outline 2px #8BC34A con offset de 2px
- Todos los elementos interactivos accesibles por teclado
- Labels descriptivos en todos los inputs
- Alt text en todas las imágenes
- Aria-labels donde sea necesario
- Mensajes de error asociados a inputs (aria-describedby)

### Configuración de Tailwind CSS

Agregar al `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8BC34A',
          dark: '#7CB342',
          light: '#AED581',
        },
        secondary: {
          yellow: '#FFF59D',
          orange: '#FFB74D',
          blue: '#E3F2FD',
        },
        neutral: {
          50: '#F5F7FA',
          100: '#E5E7EB',
          200: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          900: '#1A1A1A',
        },
        success: '#8BC34A',
        warning: '#FFB74D',
        error: '#EF5350',
        info: '#2196F3',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
}
```

### Ejemplos de Código de Componentes

#### Botón Primario:

```tsx
<button className="
  bg-primary hover:bg-primary-dark
  text-white font-medium
  px-5 py-2.5 rounded-button
  transition-all duration-200
  hover:shadow-lg
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Guardar cambios
</button>
```

#### Card:

```tsx
<div className="
  bg-white rounded-card
  border border-neutral-100
  p-6
  shadow-card hover:shadow-card-hover
  transition-all duration-200
">
  {/* Contenido del card */}
</div>
```

#### Input:

```tsx
<input
  type="text"
  className="
    w-full px-3.5 py-2.5
    border border-neutral-100 rounded-lg
    text-sm text-neutral-900
    placeholder:text-neutral-400
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:bg-neutral-50 disabled:text-neutral-400
    transition-all duration-200
  "
  placeholder="Ingrese el nombre"
/>
```

---

## 🔄 FLUJOS DE USUARIO PRINCIPALES

### FLUJO 1: Administrador Crea Plantilla Completa

1. Login como admin
2. Navegar a "Plantillas" o "Configuración"
3. Crear nueva Clasificación: "Criterios Ambientales"
4. Dentro de esa clasificación, crear Criterio: "Arbolado" (puntaje máx: 10)
5. Dentro de ese criterio, crear Factor: "¿Ubicación del arbolado?"
6. Para ese factor, agregar 3 opciones:
   - "Dentro del lote" (valor: 1.0)
   - "En vereda" (valor: 0.5)
   - "Sin arbolado" (valor: 0.0)
7. Crear otro factor en el mismo criterio: "¿Proyecta sombra útil?"
8. Agregar opciones para ese factor
9. Repetir para otros criterios y clasificaciones
10. Vista previa de estructura completa

### FLUJO 2: Administrador Crea Proyecto para Cliente

1. Login como admin
2. Navegar a "Proyectos" → "Nuevo Proyecto"
3. Ingresar nombre: "Comparación Lotes Zona Norte"
4. Ingresar descripción (opcional)
5. Seleccionar cliente de lista desplegable
6. Agregar Lote 1:
   - Nombre: "Terreno Av. Principal 123"
   - Ubicación: "Av. Principal 123, Ciudad"
   - Descripción: "500m2, esquina"
7. Agregar Lote 2, Lote 3, etc.
8. Guardar proyecto
9. Sistema notifica al cliente (opcional)

### FLUJO 3: Cliente Realiza Comparación

1. Login como cliente
2. Ver dashboard con proyectos asignados
3. Click en proyecto "Comparación Lotes Zona Norte"
4. Ver pantalla de comparación con:
   - Lista de lotes a la izquierda (o arriba en mobile)
   - Estructura de Clasificaciones/Criterios/Factores
5. Seleccionar "Lote 1"
6. Para cada factor, elegir una opción:
   - Clasificación: "Criterios Ambientales"
     - Criterio: "Arbolado"
       - Factor: "Ubicación" → selecciona "Dentro del lote"
       - Factor: "Proyecta sombra" → selecciona "Sí, parcialmente"
7. Ver cálculo automático: Criterio "Arbolado" = 7.5 pts
8. Continuar con otros criterios
9. Repetir proceso para Lote 2 y Lote 3
10. Ver tabla comparativa final con:
    - Puntaje total de cada lote
    - Ranking automático
    - Desglose por clasificación
11. Poder ajustar selecciones y ver cambios en tiempo real

---

## 📁 ESTRUCTURA DE PROYECTO NEXT.JS

```
/comparador-arqignacioAcosta/
├── /src/
│   ├── /app/
│   │   ├── /api/                      # API routes (si necesario)
│   │   ├── /(auth)/
│   │   │   ├── /login/
│   │   │   │   └── page.tsx
│   │   │   ├── /register/
│   │   │   │   └── page.tsx
│   │   │   └── /recuperar/
│   │   │       └── page.tsx
│   │   ├── /(admin)/
│   │   │   ├── layout.tsx             # Layout con sidebar admin
│   │   │   ├── /dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── /plantillas/
│   │   │   │   ├── page.tsx           # Lista de clasificaciones
│   │   │   │   └── /[id]/
│   │   │   │       └── page.tsx       # Detalle: criterios y factores
│   │   │   ├── /proyectos/
│   │   │   │   ├── page.tsx           # Lista de proyectos
│   │   │   │   ├── /nuevo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── /[id]/
│   │   │   │       ├── page.tsx       # Editar proyecto
│   │   │   │       └── /lotes/
│   │   │   │           └── page.tsx   # Gestión de lotes
│   │   │   └── /usuarios/
│   │   │       └── page.tsx
│   │   ├── /(cliente)/
│   │   │   ├── layout.tsx             # Layout cliente
│   │   │   ├── /dashboard/
│   │   │   │   └── page.tsx           # Proyectos asignados
│   │   │   └── /comparacion/
│   │   │       └── /[proyectoId]/
│   │   │           └── page.tsx       # Interfaz de comparación
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing/redirect
│   │   └── globals.css                # Estilos globales
│   ├── /components/
│   │   ├── /ui/                       # Componentes UI base
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ...
│   │   ├── /admin/
│   │   │   ├── clasificacion-form.tsx
│   │   │   ├── criterio-form.tsx
│   │   │   ├── factor-form.tsx
│   │   │   ├── proyecto-form.tsx
│   │   │   └── ...
│   │   ├── /cliente/
│   │   │   ├── comparacion-table.tsx
│   │   │   ├── factor-selector.tsx
│   │   │   ├── resultados-chart.tsx
│   │   │   └── ...
│   │   └── /common/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       ├── loading.tsx
│   │       └── ...
│   ├── /lib/
│   │   ├── /supabase/
│   │   │   ├── client.ts              # Cliente de Supabase
│   │   │   ├── server.ts              # Cliente server-side
│   │   │   └── queries.ts             # Queries reutilizables
│   │   ├── /utils/
│   │   │   ├── calculos.ts            # Lógica de cálculo de puntajes
│   │   │   ├── validaciones.ts
│   │   │   └── formatters.ts
│   │   └── /hooks/
│   │       ├── use-auth.ts
│   │       ├── use-proyectos.ts
│   │       ├── use-comparacion.ts
│   │       └── ...
│   ├── /types/
│   │   ├── database.types.ts          # Tipos generados de Supabase
│   │   ├── index.ts
│   │   └── ...
│   └── /constants/
│       ├── routes.ts
│       └── ...
├── /public/
│   ├── /images/
│   └── ...
├── .env.local                          # Variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## ⚙️ PASOS DE CONFIGURACIÓN INICIAL

### 1. Crear Proyecto Next.js

```bash
npx create-next-app@latest comparador-arqignacioAcosta
# Seleccionar:
# ✓ TypeScript
# ✓ ESLint
# ✓ Tailwind CSS
# ✓ src/ directory
# ✓ App Router
# ✓ Import alias (@/*)
```

### 2. Instalar Dependencias

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react
npm install recharts  # Para gráficos
npm install clsx tailwind-merge  # Para utility classes
```

### 3. Configurar Supabase

1. Crear proyecto en https://supabase.com
2. Copiar URL y anon key
3. Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Crear Esquema de Base de Datos

- Ejecutar el SQL proporcionado en la sección "ESQUEMA DE BASE DE DATOS"
- Configurar RLS policies
- Habilitar autenticación por email

### 5. Generar Tipos de TypeScript

```bash
npx supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts
```

---

## ✅ VALIDACIONES Y REGLAS DE NEGOCIO

### Validaciones de Formularios

- **Clasificación:** Nombre requerido (min 3 caracteres)
- **Criterio:** Nombre y descripción requeridos, puntaje máximo > 0
- **Factor:** Nombre requerido, debe tener al menos 2 opciones
- **Opción:** Nombre requerido, valor entre 0.00 y 1.00
- **Proyecto:** Nombre requerido, cliente asignado requerido
- **Lote:** Nombre y ubicación requeridos

### Reglas de Negocio

- No se puede eliminar una clasificación si tiene criterios
- No se puede eliminar un criterio si tiene factores
- No se puede eliminar un factor si tiene evaluaciones
- Al eliminar un proyecto, se eliminan todos sus lotes (CASCADE)
- Al eliminar un lote, se eliminan todas sus evaluaciones (CASCADE)
- Un proyecto debe tener al menos 2 lotes para poder comparar
- Un factor debe tener al menos 2 opciones
- La suma de valores de las opciones no necesita ser 1.0 (son independientes)
- El puntaje total de un lote nunca puede exceder la suma de puntajes máximos

### Cálculos en Tiempo Real

Cuando el cliente selecciona/cambia una opción, el sistema debe:

- Recalcular el puntaje de ese factor
- Recalcular el puntaje del criterio (promedio de factores)
- Recalcular el puntaje de la clasificación (suma de criterios)
- Recalcular el puntaje total del lote
- Actualizar el ranking de lotes
- Actualizar la visualización gráfica
- Todo sin recargar la página (estado de React)

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Performance

- Usar Server Components de Next.js donde sea posible
- Client Components solo cuando necesario (interactividad)
- Implementar loading states para todas las operaciones async
- Usar optimistic updates para mejor UX
- Implementar pagination si hay muchos proyectos/lotes
- Cachear queries de Supabase cuando apropiado

### Accesibilidad

- Usar etiquetas semánticas HTML
- Implementar navegación por teclado
- Textos alternativos para elementos visuales
- Contraste de colores adecuado (WCAG AA)
- Focus states visibles
- Mensajes de error claros y accesibles

### Manejo de Errores

- Mostrar mensajes de error claros y en español
- Implementar error boundaries en React
- Logging de errores (console o servicio externo)
- Estados de error específicos (red, auth, validación)
- Opción de retry para operaciones fallidas

### Seguridad

- NUNCA exponer API keys en código cliente
- Validar datos en cliente Y servidor
- Usar RLS de Supabase (ya configurado)
- Sanitizar inputs del usuario
- HTTPS en producción
- Implementar rate limiting si es posible

---

## 📅 FASES DE DESARROLLO SUGERIDAS

### FASE 1: Setup y Autenticación (Semana 1)

- Configurar proyecto Next.js + TypeScript + Tailwind
- Configurar Supabase (proyecto, DB, auth)
- Crear esquema de base de datos
- Implementar RLS policies
- Pantallas de login/registro/recuperación
- Middleware de autenticación
- Protección de rutas
- Layout base (header, footer)

### FASE 2: Panel Administrador - Plantillas (Semana 2)

- Layout de admin con sidebar
- CRUD de Clasificaciones
- CRUD de Criterios (con puntaje máximo)
- CRUD de Factores
- CRUD de Opciones (con valores ponderados)
- Vista jerárquica de plantilla completa
- Reordenamiento (drag & drop opcional)

### FASE 3: Panel Administrador - Proyectos (Semana 3)

- CRUD de Proyectos
- Asignación de cliente
- CRUD de Lotes dentro de proyecto
- Vista de lista de proyectos
- Vista detalle de proyecto

### FASE 4: Panel Cliente - Comparación (Semana 4)

- Layout de cliente
- Dashboard con proyectos asignados
- Interfaz de comparación:
  - Vista de lotes
  - Selectores de opciones por factor
  - Cálculo en tiempo real
  - Tabla de resultados
  - Gráficos comparativos
- Guardado automático de evaluaciones

### FASE 5: Refinamiento y Testing (Semana 5)

- Optimización de performance
- Testing de componentes
- Testing de integración
- Responsive testing (mobile, tablet)
- Corrección de bugs
- Mejoras de UX
- Documentación

---

## 💡 EJEMPLO DE DATOS DE PRUEBA

Para testing, crear los siguientes datos:

### Usuarios:

- admin@ejemplo.com (role: admin, contraseña: Admin123)
- cliente1@ejemplo.com (role: cliente, contraseña: Cliente123)

### Plantilla de Ejemplo:

```
CLASIFICACIÓN: "Criterios Ambientales"
  
  CRITERIO: "Arbolado" (puntaje máx: 10)
    FACTOR: "Ubicación del arbolado"
      - "Dentro del lote" (1.0)
      - "En vereda" (0.5)
      - "Sin arbolado" (0.0)
    
    FACTOR: "¿Proyecta sombra útil?"
      - "Sí, en zona de estar" (1.0)
      - "Sí, parcialmente" (0.5)
      - "No" (0.0)
  
  CRITERIO: "Riesgo hídrico" (puntaje máx: 15)
    FACTOR: "Nivel de riesgo de inundación"
      - "Sin riesgo" (1.0)
      - "Riesgo bajo" (0.7)
      - "Riesgo medio" (0.4)
      - "Riesgo alto" (0.0)

CLASIFICACIÓN: "Documentación Legal"
  
  CRITERIO: "Estado de escrituras" (puntaje máx: 20)
    FACTOR: "¿Tiene escritura?"
      - "Sí, al día" (1.0)
      - "Sí, con observaciones" (0.5)
      - "No tiene" (0.0)
    
    FACTOR: "¿Libre de gravámenes?"
      - "Sí" (1.0)
      - "Gravámenes menores" (0.5)
      - "Gravámenes mayores" (0.0)
```

### Proyecto de Ejemplo:

**Nombre:** "Comparación Lotes Zona Norte"  
**Cliente:** cliente1@ejemplo.com

**Lotes:**
1. "Terreno Av. Principal 123" - Av. Principal 123, Ciudad - 500m²
2. "Lote Calle Secundaria 45" - Calle Secundaria 45, Ciudad - 450m²
3. "Esquina Central" - Av. Central esq. Libertad, Ciudad - 600m²

---

## ✓ CHECKLIST DE DESARROLLO

Antes de considerar completa la aplicación, verificar:

### Autenticación

- [ ] Login funcional
- [ ] Registro funcional
- [ ] Recuperación de contraseña
- [ ] Logout
- [ ] Redirección según rol
- [ ] Persistencia de sesión

### Admin - Plantillas

- [ ] Crear/editar/eliminar clasificaciones
- [ ] Crear/editar/eliminar criterios (con puntaje máximo)
- [ ] Crear/editar/eliminar factores
- [ ] Crear/editar/eliminar opciones (con valores)
- [ ] Vista previa de estructura completa
- [ ] Reordenamiento funcional

### Admin - Proyectos

- [ ] Crear/editar/eliminar proyectos
- [ ] Asignar cliente a proyecto
- [ ] Agregar/editar/eliminar lotes
- [ ] Ver lista de todos los proyectos

### Cliente - Comparación

- [ ] Ver solo proyectos asignados
- [ ] Interfaz de comparación intuitiva
- [ ] Selección de opciones funcional
- [ ] Cálculo automático correcto
- [ ] Tabla de resultados clara
- [ ] Gráficos/visualizaciones
- [ ] Guardado automático

### UI/UX

- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Loading states en todas las operaciones
- [ ] Error states apropiados
- [ ] Mensajes de confirmación
- [ ] Navegación intuitiva
- [ ] Paleta de colores consistente

### Seguridad

- [ ] RLS policies implementadas
- [ ] Rutas protegidas
- [ ] Validaciones en cliente y servidor
- [ ] No hay API keys expuestas

### Testing

- [ ] Crear plantilla completa funciona
- [ ] Crear proyecto con lotes funciona
- [ ] Comparación de 3 lotes funciona
- [ ] Cálculos son correctos
- [ ] Cliente no ve proyectos de otros
- [ ] Responsive funciona en mobile

---

## 📚 RECURSOS Y REFERENCIAS

### Documentación Oficial:

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

### Tutoriales Relevantes:

- Next.js + Supabase Auth: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- React Hook Form + Zod: https://react-hook-form.com/get-started#SchemaValidation

### Componentes UI:

- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- Lucide Icons: https://lucide.dev

---

## 📝 NOTAS FINALES

Este documento es una guía completa para el desarrollo de **comparador-arqIgnacioAcosta**. Incluye toda la información necesaria para que Claude/Antigravity pueda asistir en la construcción de la aplicación de manera estructurada y profesional.

### Resumen de Diseño

La aplicación comparador-arqIgnacioAcosta debe transmitir:

✓ Profesionalismo y confianza  
✓ Limpieza y claridad en la información  
✓ Facilidad de uso intuitiva  
✓ Modernidad sin ser llamativo  
✓ Enfoque en los datos y resultados

Los elementos verdes (#8BC34A) deben usarse estratégicamente para guiar la atención a acciones importantes y resultados positivos. El diseño general debe ser espacioso, con abundante espacio en blanco, priorizando la legibilidad y la jerarquía visual clara.

---

*Documento preparado para desarrollo con Claude/Antigravity*  
*Versión 1.0 - Febrero 2026*
