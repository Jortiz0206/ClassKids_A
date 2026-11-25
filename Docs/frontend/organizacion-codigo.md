# Organización del código: diagnóstico y plan por etapas

Auditoría del 23/11/2026 sobre el código en la rama `stg`. Línea base antes de cualquier cambio: **107 de 107** pruebas aprobadas (pytest 42, Vitest 39, Playwright 26).

**Regla de esta etapa:** solo mejoras estructurales de bajo riesgo, con pruebas antes y después. No cambian las funcionalidades, las reglas académicas, las rutas, los permisos, los contratos de la API ni el diseño aprobado.

## 1. Diagnóstico

| # | Problema | Ejemplos concretos | Impacto |
|---|---|---|---|
| D1 | **Normalización de respuestas repetida.** La misma expresión `Array.isArray(res) ? res : (res as any)?.items \|\| []` está copiada 33 veces | `pages/Actividades.tsx`, `Analisis.tsx`, `Calificaciones.tsx`, `Dashboard.tsx`, `Estudiantes.tsx`, `Grupos.tsx`, `Materias.tsx`, `Alertas.tsx`, `admin/AdminDatos.tsx`, `admin/AdminUsuarios.tsx` | Ruido, tipado `any` y riesgo de que una copia se corrija y otra no |
| D2 | **Peticiones duplicadas en el Dashboard.** Pide 6 recursos con 13 peticiones: `/alertas` ×3 (Dashboard, panel de alertas, insignia del menú), `/estudiantes` ×3, `/grupos` ×3, `/calificaciones` ×2 | `pages/Dashboard.tsx`, `components/dashboard/AlertsPanel.tsx`, `PerformanceChart.tsx`, `RecentStudents.tsx`, `hooks/useAlertasActivas.ts` | Carga más lenta y más trabajo para la API (relacionado con H-16) |
| D3 | **Lógica de presentación duplicada** | `colorPromedio` copiado en `Actividades.tsx` y `Estudiantes.tsx`; `getInitials` en `Estudiantes.tsx` repite `iniciales` de `lib/notas.ts`; el mapa grupo-por-estudiante está copiado en `AlertsPanel.tsx` y `Alertas.tsx` | Riesgo de que los colores o las reglas se desalineen |
| D4 | **27 componentes de `components/ui` sin uso** | `accordion`, `alert-dialog`, `calendar`, `carousel`, `chart`, `command`, `drawer`, `form`, `sidebar` y otros | Código muerto que confunde al revisar el proyecto |
| D5 | **Páginas grandes con varias responsabilidades** (datos, cálculos y presentación juntos) | `Estudiantes.tsx` (434 líneas), `Materias.tsx` (425), `Calificaciones.tsx` (407), `Analisis.tsx` (399, calcula todos los agregados dentro del componente) | Difícil de probar y de mantener |
| D6 | **Tipos locales que repiten `types/index.ts`, con ids como texto o como número** | `interface Grupo { id: string }` en `Calificaciones.tsx` frente a `types/index.ts`; comparaciones con `String(...)` en varias páginas | Origen de defectos como H-18 (comparación texto/número) |
| D7 | **Tipado débil:** 28 avisos `no-explicit-any` en código existente (H-20) | `Analisis.tsx`, `Dashboard.tsx`, `Calificaciones.tsx` | Errores que el compilador no detecta |
| D8 | **Escala tipográfica con valores sueltos** | `text-[15px]` (33 usos) y `text-[13px]` (29) en lugar de clases con nombre | Inconsistencia menor; el diseño se ve bien, pero cuesta mantenerlo |
| D9 | **Backend monolítico** | `backend/main.py` (810 líneas: esquemas, seguridad, correo y 49 endpoints) | Mantenimiento; dividirlo **requiere autorización** (cambio de backend) |
| D10 | **Documentación técnica desactualizada** | La sección «Estructura del repositorio» de `Docs/referencia-tecnica/architecture.md` no incluye `components/common`, `lib/notas.ts`, `lib/tema.ts`, `lib/fechas.ts`, `lib/conteos.ts`, `src/test/`, `backend/tests/`, `backend/migrations/`, `docker-compose.test.yml` ni `e2e/` | La documentación no describe el proyecto entregado |

**Lo que está bien y se conserva:**
- Rutas y protección por rol centralizadas en `App.tsx` (`ProtectedRoute` y `AdminRoute`).
- Un único cliente HTTP (`api/client.ts`) con manejo de errores.
- Reglas de notas centralizadas en `lib/notas.ts`, con pruebas.
- Navegación configurada en un solo archivo (`components/layout/navegacion.ts`).
- Tokens de diseño en `index.css`.

## 2. Plan por etapas

| Etapa | Problema | Archivos | Cambio | Riesgo funcional | Pruebas | Beneficio |
|---|---|---|---|---|---|---|
| **E1** | D1, D3 (mapa de grupos) | `lib/listas.ts` (nuevo) y las 10 páginas de D1, `AlertsPanel.tsx` | Funciones `aLista()` y `mapaGrupoPorEstudiante()` | Bajo: misma lógica, ahora en un solo lugar | Vitest nuevas + suite completa | Una sola implementación, probada |
| **E2** | D3 (colores, iniciales) | `lib/notas.ts`, `Actividades.tsx`, `Estudiantes.tsx` | `clasePromedio()` compartida; `getInitials` reemplazada por `iniciales` | Bajo: mismos cortes 80 / 70 | Vitest nuevas + E2E de Estudiantes y Actividades | Colores coherentes en todas las pantallas |
| **E3** | D2 | `hooks/useRecurso.ts` (nuevo), Dashboard y sus componentes, `useAlertasActivas.ts` | Caché compartida con TanStack Query (ya instalado): una petición por recurso, sin datos viejos (`staleTime: 0`) | Medio-bajo: los mismos datos, con menos peticiones | E2E del Dashboard (H-25, panel de alertas) + medición de peticiones antes y después | De 13 a 6 peticiones en el Dashboard |
| **E4** | D4 | 27 archivos de `components/ui` | Retirar los componentes no importados | Bajo: `tsc` y `vite build` confirman que nada los usa | `tsc`, `vite build`, suite completa | Menos código muerto |
| **E5** | D10 | `architecture.md` | Actualizar la estructura del repositorio | Ninguno | — | Documentación fiel |
| Propuesta | D5, D6, D7, D8 | Páginas grandes, tipos | Separar cálculos en `lib/` (por ejemplo, los agregados de Análisis), usar `types/index.ts` y reemplazar `any` | Medio: toca lógica de cálculo | Unitarias de cada cálculo antes de moverlo | Mantenibilidad |
| Propuesta | D9 | `backend/main.py` | Dividir en `routers/`, `schemas.py`, `security.py` | Medio | pytest completo | Mantenibilidad. **Requiere autorización** |

Las etapas E1 a E5 se ejecutan en esta entrega. Las propuestas quedan documentadas para una etapa posterior.

## 3. Resultado de las etapas ejecutadas (23/11/2026)

| Etapa | Cambio realizado | Archivos | Verificación |
|---|---|---|---|
| E1 | `aLista()` reemplaza las 33 copias de la normalización; `mapaGrupoPorEstudiante()` reemplaza el mapa duplicado | `lib/listas.ts` (nuevo); `Actividades`, `Alertas`, `Analisis`, `Calificaciones`, `Dashboard`, `Estudiantes`, `Grupos`, `Materias`, `admin/AdminDatos`, `admin/AdminUsuarios`, `dashboard/AlertsPanel` | 4 pruebas nuevas (`listas.test.ts`); `tsc` sin errores; suite completa en verde |
| E2 | `clasePromedio()` compartida (cortes 80 / 70); `getInitials` reemplazada por `iniciales` | `lib/notas.ts`, `Actividades.tsx`, `Estudiantes.tsx` | 1 prueba nueva en `notas.test.ts`; E2E de Estudiantes y Actividades en verde |
| E3 | `useRecurso()` con TanStack Query: el Dashboard, sus componentes y la insignia del menú comparten las listas | `hooks/useRecurso.ts` (nuevo), `Dashboard.tsx`, `AlertsPanel.tsx`, `PerformanceChart.tsx`, `RecentStudents.tsx`, `hooks/useAlertasActivas.ts` | Peticiones del Dashboard medidas: **13 → 6**. E2E «H-25…» y «Panel de alertas…» en verde |
| E4 | Retirados 27 componentes de `components/ui` que no se importaban | `components/ui/*` (quedan 19, todos en uso) | `tsc` y `vite build` exitosos; suite completa en verde. Las dependencias de npm asociadas siguen en `package.json`: quitarlas cambiaría el archivo de bloqueo, así que queda como limpieza opcional |
| E5 | Estructura del repositorio actualizada | `Docs/referencia-tecnica/architecture.md` | Revisión contra el árbol real |

| E6 (defectos encontrados al revisar las evidencias) | Diálogo de confirmación común `ConfirmarAccion` (H-39) y tarjetas de Usuarios en celular (H-40) | `components/common/ConfirmarAccion.tsx` (nuevo), `Materias.tsx`, `admin/AdminUsuarios.tsx` | 2 pruebas E2E nuevas |

**Pruebas antes y después:**
- Antes: 107 de 107.
- Después: pytest 42, Vitest 44 y Playwright 28, es decir, 114 de 114.

No cambiaron las rutas, los permisos, los contratos de la API, las reglas académicas ni el diseño.

### Segunda fase (23/11/2026)

| Etapa | Cambio | Archivos | Verificación |
|---|---|---|---|
| E7 | Landing rediseñada y dividida por responsabilidad: cada sección en su componente y todo el contenido (textos, módulos, reglas, capturas) en `contenido.ts`. Los umbrales se toman de `lib/notas.ts`, no se repiten | `pages/Landing.tsx` (de 242 a 37 líneas), `components/landing/*` (nuevos), `assets/producto/*.webp` (16 capturas reales) | 5 pruebas E2E nuevas (`landing.spec.ts`); la prueba anterior de «Ver cómo funciona» sigue igual y pasa |
| E8 | Materias: la red pasa a un servicio, las reglas a funciones puras y cada formulario guarda su propio estado | `api/materias.ts`, `lib/materias.ts`, `components/materias/NuevaMateriaDialog.tsx`, `VincularAsignacionDialog.tsx` (nuevos); `pages/Materias.tsx` (de 455 a 297 líneas) | 5 pruebas unitarias (`materias.test.ts`) y 2 E2E (`materias.spec.ts`: crear y eliminar una materia temporal en la base de pruebas; validación de asignación repetida) |

Pruebas: pytest 42, Vitest 49 y Playwright 34, es decir, **125 de 125**. `tsc` sin errores y `vite build` exitoso.

**Depuración del 24/11/2026.** Se retiraron 28 dependencias npm sin uso comprobado (componentes de Radix que ya no existían, `react-hook-form`, `zod`, `cmdk`, `vaul`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `@hookform/resolvers`, `@tailwindcss/typography`, entre otras) y los componentes `ui/separator`, `ui/skeleton` y `ui/toggle`, que nadie importaba; `pnpm-lock.yaml` quedó actualizado. Se conservó `@testing-library/react` como herramienta de pruebas. Las páginas usan los tipos de `src/types` (ESLint pasó de 83 errores a 0), `tailwind.config.ts` importa `tailwindcss-animate` como módulo y la carpeta de recursos estáticos se llama `frontend/public` (estaba como `Public` y Vite no la encontraba en un sistema que distingue mayúsculas). Resultado: pytest 61, Vitest 49 y Playwright 42, **152 de 152**.

### Tercera fase: nueva dirección visual (23/11/2026)

| Etapa | Cambio | Archivos | Verificación |
|---|---|---|---|
| E9 | Estilos compartidos en lugar de repetirlos por pantalla: `sombra-tarjeta`, `aurora-app` y `fondo-aurora`. La tarjeta base, los diálogos, `StatCard`, `PageHeader` y los dos layouts los usan, así que toda la plataforma cambia de forma coherente sin tocar cada módulo | `index.css`, `ui/card.tsx`, `ui/dialog.tsx`, `dashboard/StatCard.tsx`, `layout/PageHeader.tsx`, `layout/AppLayout.tsx`, `layout/AdminLayout.tsx` | E2E sin escritura (`landing`, `renovacion`, `entorno`): 19 de 19 |
| E10 | Materias usa `StatCard` en lugar de tres tarjetas propias copiadas | `pages/Materias.tsx` (de 297 a 264 líneas) | `tsc` y build |
| E11 | Sección audiovisual como componente propio. El video se configura en un solo lugar (`VIDEO_RECORRIDO` en `contenido.ts`); mientras falte, la página lo dice | `landing/RecorridoVideo.tsx` (nuevo), `landing/contenido.ts` | 1 prueba E2E nueva |
| E12 | Logo: se restauró el archivo original de la plantita, que antes se había editado para quitarle el borde claro. Ahora no se edita: en modo oscuro se presenta sobre una placa clara | `assets/mascota-classkids.png`, `common/Mascota.tsx` | Revisión visual en los dos temas |

### Rediseño de la landing «Aprender, Crecer y Avanzar» (23/11/2026)

| Cambio | Archivos | Verificación |
|---|---|---|
| Composición propia de ClassKids (la maqueta fue solo una referencia de estilo): portada en dos columnas, franja de funciones, propósito, seguimiento, módulos, sección de video propia y cierre. Se reescribieron los componentes existentes, sin crear una landing paralela | `landing/LandingHeader`, `Hero`, `Proposito` (nuevo), `Plataforma` (nuevo), `Seguimiento` (nuevo), `CierreLanding`, `RecorridoVideo`, `ImagenTema` (nuevo), `contenido.ts` | `landing.spec.ts`: 8 de 8 |
| Se eliminaron los componentes que dejaron de usarse, tras comprobar que ningún otro archivo los importaba | `ModulosProducto`, `ComoFunciona`, `Beneficios`, `CapturaProducto` | `tsc` y build |
| La landing no muestra cifras propias: la experiencia se cuenta con capturas reales de escritorio y celular | `landing/contenido.ts` (`MODULOS`, `PANTALLAS_FLUJO`), `Docs/evidencias/scripts/capturas-producto-landing.cjs` | Rotuladas como datos de demostración en la página |
| Recorrido en video vigente (v3, después de H-08): grabación de la app real (140 s, 1280 × 720; regrabada el 24/11/2026 con la nota escrita de 0.0 a 5.0) con el docente y el administrador, música instrumental original a volumen bajo, que no se reproduce sola y tiene controles accesibles para silenciarla y ajustar el volumen. La v1 (sin audio), la v2 (antes de H-08) y la v3 anterior (nota en porcentaje) se eliminaron el 25/11/2026 | `frontend/public/video/recorrido-classkids-v3.webm`, `Docs/evidencias/scripts/grabar-recorrido.cjs`, `Docs/evidencias/scripts/montar-recorrido.py` | `landing.spec.ts`: el video no arranca solo, tiene audio y la música se silencia y se ajusta |

### Inicio de sesión sin patrón de puntos (23/11/2026)

Se retiró el estilo `fondo-cuaderno`, que pintaba una cuadrícula de puntos, del inicio de sesión y de la pantalla de carga, y se eliminó del CSS. Ahora usan el mismo fondo de degradados de la landing (`fondo-aurora`). No cambió nada de la autenticación. Una prueba E2E comprueba que no queda ningún patrón en los dos temas.

### Propuesta para `backend/main.py` (requiere autorización; no ejecutada)

Organización sugerida, sin cambiar rutas ni respuestas:
- `config.py`: CORS y variables.
- `schemas.py`: los 16 modelos Pydantic.
- `seguridad.py`: JWT, `get_current_user`, prefijos privados y de administración.
- `correo.py`: envío de recuperación e invitaciones.
- `routers/`, un `APIRouter` por etiqueta: autenticación, usuarios e invitaciones, grupos, estudiantes, materias y asignaciones, actividades, calificaciones, observaciones y alertas.
- `main.py`: crea la app, el middleware y registra los routers.

**Por qué se pide autorización:**
- Cambia las importaciones y el orden de inicialización.
- El middleware de permisos depende de prefijos de ruta.
- Las pruebas usan `main.app`, `main.create_access_token` y `main.normalize_alert_status`, y modifican `main._COLUMNAS_OPCIONALES`. Si esa caché se mueve a otro módulo, el `monkeypatch` de `test_calificaciones.py` dejaría de tener efecto sin que la prueba falle de forma evidente.

**Cómo hacerlo con seguridad:**
1. Mover un router por vez, conservando los nombres en `main` mediante reexportación.
2. Comparar `openapi.json` antes y después (49 rutas).
3. Ejecutar pytest y la suite E2E en cada paso.
