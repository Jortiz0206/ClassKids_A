// Utilidades de fecha (hallazgo H-30a).
//
// PostgreSQL devuelve las columnas DATE como texto "AAAA-MM-DD". `new Date("2026-09-05")`
// interpreta ese texto como medianoche en UTC; en Colombia (UTC-5) eso es el 4 de
// septiembre a las 7 p. m., y la interfaz mostraba un día menos. Estas funciones
// interpretan la fecha en la zona horaria local, sin desplazarla.

/** Convierte "AAAA-MM-DD" (o "AAAA-MM-DDTHH:MM...") en una fecha local a medianoche. */
export function fechaLocal(valor: string): Date {
  const [anio, mes, dia] = valor.slice(0, 10).split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Medianoche local de hoy, para comparar fechas sin hora. */
export function inicioDeHoy(ahora: Date = new Date()): Date {
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

/**
 * Texto relativo de una fecha de creación: «Hoy», «Ayer», «Hace 3 días», «Hace 2 semanas»…
 * Compara días de calendario locales. Si la fecha queda en el futuro por diferencia de zona
 * horaria entre el servidor y el navegador, se muestra «Hoy» (antes aparecía «Hace -1 días»).
 */
export function tiempoRelativo(valor?: string | null, ahora: Date = new Date()): string {
  if (!valor) return "Sin fecha";
  const fecha = fechaLocal(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";
  const dias = Math.round((inicioDeHoy(ahora).getTime() - fecha.getTime()) / 86_400_000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  const semanas = Math.floor(dias / 7);
  if (dias < 30) return semanas === 1 ? "Hace 1 semana" : `Hace ${semanas} semanas`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "Hace 1 mes" : `Hace ${meses} meses`;
}

/** Fecha corta en español: «5 sep 2026». */
export function fechaCorta(valor?: string | null): string {
  if (!valor) return "Sin fecha";
  const f = fechaLocal(valor);
  if (Number.isNaN(f.getTime())) return "Sin fecha";
  return f.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
}
