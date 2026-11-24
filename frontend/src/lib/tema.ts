// Utilidades del selector de tema (modo claro / oscuro).

export type TemaResuelto = "light" | "dark";

/** Clave de localStorage donde next-themes guarda la preferencia. */
export const CLAVE_TEMA = "classkids-tema";

/** El botón alterna entre claro y oscuro a partir del tema que se ve en pantalla. */
export function siguienteTema(actual: TemaResuelto): TemaResuelto {
  return actual === "dark" ? "light" : "dark";
}

/** Texto accesible del botón: describe la acción, no el estado. */
export function etiquetaCambioTema(actual: TemaResuelto): string {
  return actual === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
}
