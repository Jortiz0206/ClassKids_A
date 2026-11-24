// Criterios de conteo compartidos (hallazgo H-25, decisión D5).
//
// Son los mismos que usa el backend en los endpoints del panel de administración:
//   /estudiantes/count      → estudiantes con activo = TRUE
//   /alertas/activas/count  → alertas con estado = 'active'
// Antes, el Dashboard contaba todos los registros y las cifras solo coincidían
// mientras no hubiera estudiantes inactivos ni alertas resueltas.

export const esEstudianteActivo = (e: { activo?: boolean | null }) => e.activo === true;

export const esAlertaActiva = (a: { estado?: string | null }) => a.estado === "active";

export const contarEstudiantesActivos = (lista: { activo?: boolean | null }[]) => lista.filter(esEstudianteActivo).length;

export const contarAlertasActivas = (lista: { estado?: string | null }[]) => lista.filter(esAlertaActiva).length;
