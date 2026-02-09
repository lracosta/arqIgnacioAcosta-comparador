# Tareas - comparador-arqIgnacioAcosta

## Fase 1: Setup y Configuración Base
- [x] Crear proyecto Next.js 16.1 con TypeScript, Tailwind CSS 4.1, App Router
- [x] Configurar shadcn/ui con tema personalizado
- [x] Configurar Supabase (cliente + servidor)
- [x] Crear esquema de base de datos con versionado de plantillas
- [x] Implementar RLS policies

## Fase 2: Autenticación
- [x] Pantalla de Login
- [x] Pantalla de Registro (autónomo)
- [x] Recuperación de contraseña
- [x] Middleware de protección de rutas
- [x] Redirección según rol (admin/cliente)

## Fase 3: Panel Admin - Plantillas (con versionado)
- [x] Layout admin con sidebar colapsable
- [x] CRUD de Clasificaciones
- [x] CRUD de Criterios (con puntaje máximo)
- [x] CRUD de Factores
- [x] CRUD de Opciones (con valores ponderados)
- [x] Vista jerárquica de plantilla
- [x] Drag and drop para reordenar
- [x] Sistema de versionado de plantillas
- [x] Activar/Eliminar versiones

## Fase 4: Panel Admin - Proyectos
- [x] CRUD de Proyectos
- [x] Asignación de cliente a proyecto
- [x] CRUD de Lotes
- [x] Vista lista de proyectos
- [x] Cambio de estado (activo/archivado)

## Fase 5: Panel Admin - Usuarios
- [x] Lista de usuarios (clientes)
- [ ] Crear/invitar cliente (envío de email)
- [ ] Editar/eliminar clientes
- [ ] Reenviar invitación

## Fase 6: Panel Cliente - Comparación
- [x] Layout cliente con sidebar
- [x] Dashboard con proyectos asignados
- [x] Interfaz de comparación por lote
- [x] Selectores de opciones por factor
- [x] Cálculo en tiempo real
- [x] Tabla de resultados y ranking
- [x] Gráficos con Recharts
- [x] Guardado automático de evaluaciones

## Fase 7: Funcionalidades Adicionales
- [ ] Notificaciones por email (asignación de proyecto) - *Requiere configuración de SMTP/Resend*
- [x] Exportación de resultados (PDF vía Print)
- [ ] Exportación a Excel - *Opcional*

## Fase 8: Pruebas y Pulido
- [x] Generación de datos de prueba (API route `/api/generate-test-data`)
- [x] Ajustes visuales premium (Badges, Loaders, Hover effects)
- [x] Optimización de impresión (Print Styles)
- [x] Navegación corregida (Sidebar links)
