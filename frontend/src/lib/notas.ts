// Reglas de presentación de notas de ClassKids.
//
// Escala oficial: 0.0 – 5.0 (backend y PostgreSQL, NUMERIC(3,1)). La interfaz muestra y
// recibe porcentajes de 0 a 100 (nota × 20) y convierte con ÷ 20 a un decimal.
// Los umbrales son los que ya usaba el código; este módulo solo los centraliza para que
// todas las pantallas los apliquen igual. No cambia ninguna regla académica.

/** Umbral de «Excelente» en la interfaz (90 % = 4.5). */
export const UMBRAL_EXCELENTE = 90;
/** Umbral de aprobación en la interfaz (70 % = 3.5). */
export const UMBRAL_APROBADO = 70;
/** Banda «Observar» del Dashboard: de 70 % a menos de 80 %. */
export const UMBRAL_OBSERVAR_HASTA = 80;
/** El backend genera la alerta cuando el promedio es menor que 3.0 (60 %). */
export const UMBRAL_ALERTA_NOTA = 3.0;
/** Aprobación en la escala oficial. */
export const UMBRAL_APROBACION_NOTA = 3.5;
/** Umbral de alerta expresado en porcentaje (3.0 × 20 = 60 %). */
export const UMBRAL_ALERTA_PORCENTAJE = UMBRAL_ALERTA_NOTA * 20;

/**
 * H-01: promedio en porcentaje SIN redondear (nota × 20). Las clasificaciones («En riesgo»,
 * «Crítico», niveles) se hacen con este valor, igual que el backend compara el promedio sin
 * redondear para crear la alerta; el redondeo a entero es solo para mostrarlo. Así, un
 * promedio de 2.99 (59.8 %) se muestra como 60 % pero se clasifica bajo el umbral de alerta.
 * `null` si no hay notas.
 */
export function promedioExacto(notas: number[]): number | null {
  if (notas.length === 0) return null;
  return (notas.reduce((s, n) => s + n, 0) / notas.length) * 20;
}

export type EstadoNota = "excelente" | "aprobado" | "reprobado" | "sin";

export const ETIQUETA_ESTADO: Record<EstadoNota, string> = {
  excelente: "Excelente",
  aprobado: "Aprobado",
  reprobado: "Reprobado",
  sin: "Sin calificar",
};

/**
 * Estado de una calificación en porcentaje, con los mismos cortes que tenía Calificaciones:
 * ≥ 90 Excelente, ≥ 70 Aprobado, > 0 Reprobado y, si no hay nota (o es 0), Sin calificar.
 */
export function estadoNota(porcentaje: number | null | undefined): EstadoNota {
  const v = porcentaje ?? 0;
  if (v >= UMBRAL_EXCELENTE) return "excelente";
  if (v >= UMBRAL_APROBADO) return "aprobado";
  if (v > 0) return "reprobado";
  return "sin";
}

/** Convierte el porcentaje digitado a la escala oficial con un decimal (÷ 20). */
export function aEscala5(porcentaje: number): number {
  return Number((porcentaje / 20).toFixed(1));
}

/** Convierte una nota de la escala oficial al porcentaje que muestra la interfaz (× 20). */
export function aPorcentaje(nota: number): number {
  return nota * 20;
}

/** Texto de la equivalencia en la escala oficial, por ejemplo «4.3». Vacío si no hay nota. */
export function formatoEscala5(porcentaje: number | null | undefined): string {
  if (porcentaje === null || porcentaje === undefined || Number.isNaN(porcentaje)) return "";
  return aEscala5(porcentaje).toFixed(1);
}

/**
 * Normaliza lo que el docente escribe en el campo de nota: vacío → sin nota; el resto se
 * limita al rango 0 – 100 (mismo comportamiento que tenía la pantalla).
 */
export function normalizarEntradaNota(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return Math.min(100, Math.max(0, n));
}

export type NivelPromedio = "excelente" | "alto" | "observar" | "bajo";

/** Banda de color de las gráficas de promedio (cortes existentes: 90 / 80 / 70). */
export function nivelPromedio(porcentaje: number): NivelPromedio {
  if (porcentaje >= UMBRAL_EXCELENTE) return "excelente";
  if (porcentaje >= UMBRAL_OBSERVAR_HASTA) return "alto";
  if (porcentaje >= UMBRAL_APROBADO) return "observar";
  return "bajo";
}

export type NivelSeguimiento = "risk" | "watch" | "good";

/** Regla existente de «Estudiantes» del Dashboard: < 70 % en riesgo, 70 – 79 % observar. */
export function nivelSeguimiento(promedio: number): NivelSeguimiento {
  if (promedio > 0 && promedio < UMBRAL_APROBADO) return "risk";
  if (promedio >= UMBRAL_APROBADO && promedio < UMBRAL_OBSERVAR_HASTA) return "watch";
  return "good";
}

/** Fila de calificación con los valores con los que se cargó (decisión D2). */
export interface FilaEditable {
  calificacion: number | null;
  entregado: boolean;
  original: { calificacion: number | null; entregado: boolean };
}

/** Una fila se guarda solo si el docente cambió la nota o la entrega. */
export function filaModificada(fila: FilaEditable): boolean {
  return fila.calificacion !== fila.original.calificacion || fila.entregado !== fila.original.entregado;
}

/**
 * Promedio de la actividad con el cálculo actual: quien no tiene nota cuenta como 0
 * (hallazgo H-19, pendiente; no se corrige en la renovación visual).
 */
export function promedioActividad(filas: { calificacion: number | null }[]): number {
  if (filas.length === 0) return 0;
  return Math.round(filas.reduce((s, f) => s + (f.calificacion ?? 0), 0) / filas.length);
}

/** Iniciales para avatares: «Isabella Díaz» → «ID». */
export function iniciales(nombre: string, apellido = ""): string {
  const a = (nombre || "").trim().charAt(0);
  const b = (apellido || "").trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "?";
}

/**
 * Clase de color del texto de un promedio en listas y tarjetas (cortes existentes 80 / 70):
 * ≥ 80 verde oscuro, 70 – 79 ámbar oscuro, < 70 naranja oscuro. Todos cumplen 4.5:1.
 */
export function clasePromedio(porcentaje: number): string {
  if (porcentaje >= 80) return "text-nivel-excelente-fg";
  if (porcentaje >= UMBRAL_APROBADO) return "text-nivel-observar-fg";
  return "text-nivel-reprobado-fg";
}
