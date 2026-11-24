// Utilidades para las listas que devuelve la API.
//
// La API de ClassKids responde con arreglos. Por compatibilidad, las pantallas también
// aceptaban respuestas envueltas como `{ items: [...] }` o `{ data: [...] }`. Esa
// normalización estaba copiada 33 veces; ahora vive aquí y tiene pruebas.

/** Devuelve la lista contenida en una respuesta de la API, o una lista vacía. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aLista<T = any>(respuesta: unknown): T[] {
  if (Array.isArray(respuesta)) return respuesta as T[];
  if (respuesta && typeof respuesta === "object") {
    const r = respuesta as { items?: unknown; data?: unknown };
    if (Array.isArray(r.items)) return r.items as T[];
    if (Array.isArray(r.data)) return r.data as T[];
  }
  return [];
}

/**
 * Mapa id de estudiante → nombre de su grupo («» si no tiene grupo o el grupo no existe).
 * Se usa para mostrar el grupo junto a cada alerta.
 */
export function mapaGrupoPorEstudiante(
  estudiantes: { id: number | string; grupo_id?: number | string | null }[],
  grupos: { id: number | string; nombre: string }[],
): Map<string, string> {
  const nombreGrupo = new Map(grupos.map((g) => [String(g.id), g.nombre]));
  return new Map(
    estudiantes.map((e) => [String(e.id), e.grupo_id ? nombreGrupo.get(String(e.grupo_id)) || "" : ""]),
  );
}
