// Reglas de presentación de notas de ClassKids.
//
// Escala oficial y principal: 0.0 – 5.0 con un decimal (backend y PostgreSQL, NUMERIC(3,1)).
// El docente escribe la nota directamente (por ejemplo 3.8) y la interfaz la muestra en esa
// escala. Las equivalencias son información secundaria: nota × 20 = porcentaje y
// nota × 4 = sobre 20. Internamente, los cortes de clasificación se expresan en porcentaje
// (90 / 80 / 70 / 60 = 4.5 / 4.0 / 3.5 / 3.0): son los mismos umbrales de siempre.

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

/**
 * Convierte el porcentaje digitado a la escala oficial con un decimal (÷ 20), redondeando
 * la mitad hacia arriba, igual que PostgreSQL con NUMERIC(3,1): 87 % → 4.35 → 4.4.
 * Se calcula como round(porcentaje ÷ 2) ÷ 10 porque `toFixed` trabaja sobre el binario y
 * redondeaba distinto según el valor (87 % daba 4.3 y 85 % también 4.3).
 */
export function aEscala5(porcentaje: number): number {
  return Math.round(porcentaje / 2) / 10;
}

/** Convierte una nota de la escala oficial al porcentaje que muestra la interfaz (× 20). */
export function aPorcentaje(nota: number): number {
  return nota * 20;
}

/**
 * Diferencia entre dos promedios expresada en la escala oficial, con signo y un decimal:
 * 4 puntos porcentuales → «+0.2».
 */
export function diferenciaEnNota(puntosPorcentuales: number): string {
  const valor = Math.round(Math.abs(puntosPorcentuales) / 2) / 10;
  return `${puntosPorcentuales < 0 && valor > 0 ? "−" : "+"}${valor.toFixed(1)}`;
}

/** Texto de la equivalencia en la escala oficial, por ejemplo «4.3». Vacío si no hay nota. */
export function formatoEscala5(porcentaje: number | null | undefined): string {
  if (porcentaje === null || porcentaje === undefined || Number.isNaN(porcentaje)) return "";
  return aEscala5(porcentaje).toFixed(1);
}

/** Nota en la escala oficial con un decimal, por ejemplo «4.0». */
export function formatoNota(nota: number): string {
  return nota.toFixed(1);
}

/** Equivalencias secundarias de una nota oficial: sobre 100 (× 20) y sobre 20 (× 4). */
export function equivalencias(nota: number): { porcentaje: number; sobre20: number } {
  return { porcentaje: Math.round(nota * 20), sobre20: Math.round(nota * 40) / 10 };
}

/** Texto de las equivalencias, por ejemplo «76 % · 15.2 / 20». */
export function textoEquivalencias(nota: number): string {
  const { porcentaje, sobre20 } = equivalencias(nota);
  return `${porcentaje} % · ${sobre20} / 20`;
}

export interface EntradaNota {
  nota: number | null;
  error: string | null;
}

/**
 * Interpreta lo que el docente escribe en el campo de nota (escala 0.0 – 5.0):
 * vacío → sin nota; acepta coma o punto decimal («3,8» = 3.8). No corrige en silencio: si el
 * valor no es un número, está fuera de 0 – 5 o tiene más de un decimal, devuelve el error y
 * la fila no se puede guardar (el backend también lo rechazaría con 422).
 */
export function interpretarNota(raw: string): EntradaNota {
  const texto = raw.trim().replace(",", ".");
  if (texto === "") return { nota: null, error: null };
  if (!/^-?\d+(\.\d*)?$|^-?\.\d+$/.test(texto)) return { nota: null, error: "Escribe un número, por ejemplo 3.8" };
  const n = Number(texto);
  if (n < 0 || n > 5) return { nota: null, error: "La nota va de 0.0 a 5.0" };
  if (Math.abs(n * 10 - Math.round(n * 10)) > 1e-9) return { nota: null, error: "Usa un solo decimal, por ejemplo 3.8" };
  return { nota: Math.round(n * 10) / 10, error: null };
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

/** Fila de calificación con los valores con los que se cargó (decisión D2). `nota` en 0.0 – 5.0. */
export interface FilaEditable {
  nota: number | null;
  entregado: boolean;
  original: { nota: number | null; entregado: boolean };
}

/** Una fila se guarda solo si el docente cambió la nota o la entrega. */
export function filaModificada(fila: FilaEditable): boolean {
  return fila.nota !== fila.original.nota || fila.entregado !== fila.original.entregado;
}

/**
 * Promedio de la actividad en la escala oficial, con un decimal. Mismo cálculo que antes:
 * quien no tiene nota cuenta como 0 (hallazgo H-19, pendiente).
 */
export function promedioActividad(filas: { nota: number | null }[]): number {
  if (filas.length === 0) return 0;
  return Math.round((filas.reduce((s, f) => s + (f.nota ?? 0), 0) / filas.length) * 10) / 10;
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
