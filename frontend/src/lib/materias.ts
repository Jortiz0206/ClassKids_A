/**
 * Modelo y reglas de la pantalla Materias, sin React ni red: se pueden probar por separado.
 * La normalización convierte las respuestas de la API (ids numéricos, campos opcionales o
 * anidados) a objetos con ids de texto, igual que lo hacía la página.
 */
import { aLista } from "@/lib/listas";

export interface Materia { id: string; nombre: string }
export interface GrupoBasico { id: string; nombre: string }
export interface Docente { id: string; nombre: string; apellido: string; email: string }
export interface Asignacion {
  id: string;
  docente_id: string;
  docente: string;
  materia_id: string;
  grupo_id: string;
  materia_nombre: string;
  grupo_nombre: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- respuestas de la API sin tipar */
export const normalizarMaterias = (r: unknown): Materia[] =>
  aLista(r).map((m: any) => ({ id: String(m.id), nombre: String(m.nombre || "") }));

export const normalizarGrupos = (r: unknown): GrupoBasico[] =>
  aLista(r).map((g: any) => ({ id: String(g.id), nombre: String(g.nombre || "") }));

export const normalizarDocentes = (r: unknown): Docente[] =>
  aLista(r).map((d: any) => ({ id: String(d.id), nombre: String(d.nombre || ""), apellido: String(d.apellido || ""), email: String(d.email || "") }));

export const normalizarAsignaciones = (r: unknown): Asignacion[] =>
  aLista(r).map((a: any) => ({
    id: String(a.id),
    docente_id: String(a.docente_id),
    docente: String(a.docente || ""),
    materia_id: String(a.materia_id),
    grupo_id: String(a.grupo_id),
    materia_nombre: String(a.materia_nombre || a.materias?.nombre || ""),
    grupo_nombre: String(a.grupo_nombre || a.grupos?.nombre || ""),
  }));
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Materias cuyo nombre contiene el texto buscado (sin distinguir mayúsculas). */
export const filtrarMaterias = (materias: Materia[], busqueda: string): Materia[] =>
  materias.filter((m) => m.nombre.toLowerCase().includes(busqueda.toLowerCase()));

/** Cuántas asignaciones (grupos) tiene una materia. */
export const contarGruposDeMateria = (asignaciones: Asignacion[], materiaId: string): number =>
  asignaciones.filter((a) => a.materia_id === materiaId).length;

/** Grupos que no tienen ninguna materia asignada. */
export const contarGruposSinAsignar = (grupos: GrupoBasico[], asignaciones: Asignacion[]): number =>
  grupos.filter((g) => !asignaciones.some((a) => a.grupo_id === g.id)).length;

/** Grupos con sus asignaciones; se omiten los que no tienen ninguna. */
export const asignacionesPorGrupo = (grupos: GrupoBasico[], asignaciones: Asignacion[]) =>
  grupos
    .map((g) => ({ ...g, materias: asignaciones.filter((a) => a.grupo_id === g.id) }))
    .filter((g) => g.materias.length > 0);

/** La misma materia no puede asignarse dos veces al mismo grupo. */
export const asignacionExiste = (asignaciones: Asignacion[], materiaId: string, grupoId: string): boolean =>
  asignaciones.some((a) => a.materia_id === materiaId && a.grupo_id === grupoId);

export const nombreDocente = (d: Docente): string => [d.nombre, d.apellido].filter(Boolean).join(" ");
