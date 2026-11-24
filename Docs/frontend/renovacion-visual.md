# Frontend: renovación visual (versión 3)

Implementada y validada el 20/11/2026 en el **entorno de pruebas** (frontend `:8081`, backend `:8001`, base `classkids_test`). La renovación cambia la presentación; no cambia la autenticación, los permisos, los endpoints, la escala académica ni los umbrales.

Referencias de diseño aprobadas: diagnóstico visual y maquetas (Login, Dashboard, Calificaciones, celular y menú «Más»). Las capturas de la versión implementada están en [`../evidencias/capturas-v3/`](../evidencias/capturas-v3/). La landing actual está en [`../evidencias/capturas-v3/vigente/`](../evidencias/capturas-v3/vigente/).

## 1. Identidad visual

| Elemento | Decisión | Dónde está |
|---|---|---|
| Paleta base («Recreo») | Blanco nube, menta, azul cielo, lavanda | `frontend/src/index.css` (`--background`, `--menta`, `--cielo`, `--lavanda`) |
| Acentos («Cuaderno vivo») | Durazno, mantequilla, frambuesa, sol | `--durazno`, `--mantequilla`, `--frambuesa`, `--sol` |
| Identidad conservada | Verde ClassKids para la acción principal; azul tinta para texto y navegación | `--primary` (#17775A), `--foreground` (#1D2B45) |
| Tipografía | Bricolage Grotesque (títulos y cifras) + DM Sans (texto) | `index.css` (Google Fonts), `tailwind.config.ts` (`font-display`, `font-sans`) |
| Mascota | Plantita existente, sin fondo; solo en bienvenidas, estados vacíos, mensajes positivos y carga inicial | `src/assets/mascota-classkids.png`, `components/common/Mascota.tsx` |
| Color por módulo | Grupos lavanda, Estudiantes cielo, Materias mantequilla, Actividades durazno, Calificaciones menta, Alertas frambuesa suave | `components/layout/navegacion.ts` |

**Regla de uso del rojo.** El frambuesa se reserva para alertas académicas y errores. Una actividad vencida, un promedio «Regular» (70–79 %, aprobado) o un tipo de actividad ya no se muestran en rojo.

## 1A. Modo claro y oscuro (23/11/2026)

- **Selector:** botón de sol y luna presente en toda la plataforma:
  - landing, inicio de sesión, recuperación, invitación y página 404;
  - páginas legales;
  - menú lateral del docente y del administrador;
  - cabecera del celular.
- **Persistencia:** la preferencia se guarda en `localStorage` (clave `classkids-tema`) con `next-themes`, así que se mantiene al navegar y al recargar. El tema inicial es el claro.
- **Paleta oscura propia, no una inversión:** superficies azul tinta, verde y frambuesa aclarados, y estados con texto claro sobre fondos oscuros. Está en `frontend/src/index.css` (bloque `.dark`).
- **Componentes cubiertos:** formularios, diálogos, menús, notificaciones (sonner), gráficas (tooltips y leyendas con los colores del tema) e insignias.
- **Contraste:** los 32 pares cumplen en ambos temas, 64 de 64 ([`contraste-wcag.md`](../evidencias/contraste-wcag.md)).
- **Pruebas:**
  - Vitest: `src/test/tema.test.ts`.
  - Playwright: «modo claro y oscuro» comprueba el cambio, que el fondo cambia de verdad, la persistencia al recargar y la navegación entre la landing, el inicio de sesión y los módulos.
- **Evidencias:** [`../evidencias/capturas-v3/`](../evidencias/capturas-v3/README.md): 142 capturas reales de la versión vigente: landing, inicio de sesión, Dashboard, los ocho módulos (en `modulos/`), modo claro y oscuro y video; escritorio y celular. Nombres `AAAA-MM-DD_vista_dispositivo_tema.png`.

## 2. Estados académicos (sin cambios en las reglas)

| Estado | Regla (código existente) | Presentación |
|---|---|---|
| Excelente | ≥ 90 % (≥ 4.5) | Menta, texto verde oscuro, ícono estrella |
| Aprobado | 70–89 % (3.5–4.4) | Cielo, texto azul oscuro, ícono de verificación |
| Reprobado / En riesgo | < 70 % (< 3.5) | Durazno, texto naranja oscuro, ícono de advertencia |
| Observar | 70–79 % (Dashboard y gráficas) | Mantequilla, texto ámbar oscuro |
| Alerta / Crítico | Promedio < 3.0 (regla del backend) | Frambuesa suave, texto frambuesa oscuro |
| Sin calificar | Sin nota | Gris claro, texto gris oscuro |

Los umbrales se centralizaron en `frontend/src/lib/notas.ts` con los mismos valores que ya tenía cada pantalla. Las pruebas `src/test/notas.test.ts` protegen que no cambien. Cada estado lleva ícono y texto, de modo que no depende solo del color (WCAG 1.4.1).

**Escala.** La interfaz muestra y recibe 0–100; el backend y PostgreSQL guardan 0.0–5.0 (÷ 20, un decimal). Ahora se muestra la equivalencia, por ejemplo `86 / 100 = 4.3`, sin alterar el valor guardado. Las referencias 3.0 (alerta) y 3.5 (aprobación) aparecen como líneas punteadas en las gráficas del Dashboard y de Análisis.

## 3. Pantallas y rutas

| Ruta | Pantalla | Protección | Cambios principales |
|---|---|---|---|
| `/` | Landing | Pública | Versión vigente (24/11): portada con «Aprender · Crecer · Avanzar», texto a la izquierda y el panel real en un equipo inclinado a la derecha; franja de funciones; propósito; flujo de acompañamiento con pantallas reales de la app en el celular (sin cifras ni gráficas propias); los ocho módulos reales; «Conoce cómo funciona ClassKids» con el video real (v3, con el docente y el administrador) y su música instrumental, con controles de audio; cierre. Logo original sin modificar y selector de tema |
| `/auth` | Inicio de sesión | Pública | Diseño en dos paneles, «Correo electrónico», mostrar/ocultar contraseña, error en pantalla, estado de carga, enlaces legales. Fondo de degradados suaves, sin puntos ni retícula (23/11) |
| `/reset-password`, `/invitacion` | Recuperar contraseña, activar cuenta | Públicas | Heredan tokens y tipografía |
| `/legal/*` | Políticas | Públicas | Paleta unificada |
| `/app` | Dashboard | `ProtectedRoute` | Saludo sin punto, «Grupos», bienvenida con mascota, gráfica horizontal con referencias 3.0/3.5, alertas con grupo, seguimiento con estado y equivalencia |
| `/app/grupos` | Grupos | `ProtectedRoute` | «Regular» deja de ser rojo; enlace a los estudiantes del grupo |
| `/app/estudiantes` | Estudiantes | `ProtectedRoute` | Paginación de 25, filtro por `?grupo=`, tarjetas en celular, estados con ícono |
| `/app/materias` | Materias | `ProtectedRoute` | Encabezado y colores del sistema |
| `/app/actividades` | Actividades | `ProtectedRoute` | «Vencida» informativa (RN-16 intacta), tipos con color propio, promedio con equivalencia |
| `/app/calificaciones` | Calificaciones | `ProtectedRoute` | Equivalencia 0–5, fila editada resaltada, tarjetas y barra de guardado en celular, estado vacío con mascota |
| `/app/analisis` | Análisis | `ProtectedRoute` | Barras por nivel, referencias 3.0/3.5, escala en tooltips |
| `/app/alertas` | Alertas | `ProtectedRoute` | Un solo rojo por alerta, grupo visible, detalle con mensaje y grupo (H-15), fecha sin «Hace -1 días» |
| `/admin`, `/admin/usuarios`, `/admin/datos` | Administración | `AdminRoute` | Menú claro propio, encabezados unificados, barra inferior en celular |
| `*` | Página no encontrada | Pública | Hereda tokens |

## 4. Navegación

**Escritorio y tableta.**
- Menú lateral claro con el azul tinta como color de identidad.
- El módulo activo se resalta con su color y un indicador de alertas activas.
- Por debajo de 1024 px el menú se contrae solo, para dejar espacio al contenido.

**Celular** (menos de 768 px):
- Barra inferior con **Inicio, Estudiantes, Calificaciones, Alertas y Más**, que respeta el área segura del dispositivo.
- «Más» abre una hoja con Grupos, Actividades, Análisis y Materias, y además **Usuarios** y **Panel de administración** solo si el rol es administrador.
- La misma hoja contiene la cuenta y «Salir».

La configuración es única (`navegacion.ts`), de modo que el menú lateral y la barra inferior muestran las mismas rutas. Las protecciones siguen en `App.tsx`, y ocultar un enlace no reemplaza la protección de la ruta. Lo comprueban `src/test/navegacion.test.ts` y `e2e/tests/renovacion.spec.ts`.

## 5. Componentes transversales nuevos

| Componente | Archivo | Uso |
|---|---|---|
| `EstadoBadge` | `components/common/EstadoBadge.tsx` | Estados académicos, de alertas, de actividades y de grupo |
| `EstadoVacio`, `EstadoCargando`, `FilasCargando`, `EstadoError` | `components/common/Estados.tsx` | Sin información, sin resultados, carga y error de conexión con «Reintentar» |
| `Mascota`, `SelloMascota` | `components/common/Mascota.tsx` | Identidad en menús, bienvenidas y estados vacíos |
| `PageHeader` (renovado) | `components/layout/PageHeader.tsx` | Encabezado común con el ícono y el color del módulo |
| `StatCard` (renovado) | `components/dashboard/StatCard.tsx` | Indicadores numéricos |
| `MobileNav` | `components/layout/MobileNav.tsx` | Barra inferior y hoja «Más» |
| `ConfirmarAccion` | `components/common/ConfirmarAccion.tsx` | Confirmación antes de eliminar o desactivar (Materias, Usuarios) |
| `ThemeToggle` | `components/common/ThemeToggle.tsx` | Selector de modo claro y oscuro |
| `useAlertasActivas` | `hooks/useAlertasActivas.ts` | Número de alertas activas en la navegación (caché de 1 minuto) |

Los componentes de shadcn/ui (botones, campos, selectores, tablas, diálogos y pestañas) heredan la paleta a través de los tokens, sin duplicar estilos.

## 6. Accesibilidad

- **Contraste:** 32 de 32 pares de color cumplen WCAG 2.1 AA en cada tema (64 de 64 contando claro y oscuro) (texto ≥ 4.5:1; bordes de campos y barras ≥ 3:1). Reporte: [`../evidencias/contraste-wcag.md`](../evidencias/contraste-wcag.md), generado desde `index.css` con [`contraste-wcag.py`](../evidencias/scripts/contraste-wcag.py). En el diagnóstico inicial fallaban 9 de 16.
- **Tamaño de texto:** se eliminaron los textos de 9, 10 y 11 px (35 casos); el mínimo es 12 px.
- **Otros ajustes:**
  - Foco visible en azul de 3 px.
  - `lang="es"` en el documento.
  - Etiquetas accesibles en los campos de búsqueda, filtros e interruptores.
  - `role="status"` y `role="alert"` en los mensajes.
  - Movimiento reducido según la preferencia del sistema.

## 7. Diseño responsive

- Probado en 1366 px (escritorio), menos de 1024 px (menú contraído) y 390 × 844 (iPhone 13).
- Desbordamiento horizontal: 0 px en las capturas de los dos temas. Además, una prueba E2E lo verifica en la navegación móvil.
- Tablas que pasan a tarjetas en celular: Calificaciones y Estudiantes.
- Gráficas: Análisis oculta las etiquetas de las barras en pantallas estrechas; el valor sigue disponible al tocar cada barra.
- **Defecto corregido en esta etapa:** al cruzar el ancho de celular (girar una tableta o redimensionar la ventana), el layout cambiaba de rama y React volvía a montar la pantalla. Esto perdía las notas digitadas sin guardar y repetía todas las peticiones (se midieron 24 adicionales). Ahora `<main>` conserva su posición en el árbol. Prueba: «Cambiar el ancho de la ventana no borra las notas digitadas sin guardar».

## 8. Funcionalidad conservada

- Autenticación JWT y protección por rol.
- Mismos endpoints y payloads; Calificaciones sigue enviando solo las filas modificadas (D2), sin `periodo` ni `observacion`.
- Compatibilidad del campo `entregado` con la base real, que aún no tiene la columna.
- Conteos con los criterios corregidos (H-25): estudiantes activos y alertas activas.
- Deduplicación de alertas (D3), alertas resueltas consultables con `?estado=resolved` y RN-16 (actividades vencidas).
- El promedio de la actividad conserva el cálculo actual (H-19 pendiente); la pantalla lo explica.

## 9. Pendientes de la interfaz (no implementados)

| Pendiente | Motivo |
|---|---|
| Elegir el periodo al calificar (HU-12) | Requiere decisión funcional; el guardado usa el periodo 1 por defecto (RN-08) |
| Crear o editar observaciones desde Calificaciones | Las observaciones se gestionan en el detalle del estudiante; moverlas cambiaría el flujo |
| Diferencia de umbrales 3.5 / 3.0 | H-01 corregido el 24/11/2026 sin cambiar los umbrales: la interfaz clasifica con el promedio exacto |
| Dividir el paquete JavaScript (aviso de bloque > 500 kB en `vite build`) | Optimización; no afecta el funcionamiento |
| Tipado estricto (28 avisos `no-explicit-any` de ESLint en código existente) | Deuda técnica H-20 |
