/**
 * Llamadas a la API que usa la pantalla Materias. Mismas rutas y cuerpos que antes:
 * solo se trasladaron desde la página para separar la red de la presentación.
 */
import { api } from "@/api/client";
import {
  normalizarAsignaciones,
  normalizarDocentes,
  normalizarGrupos,
  normalizarMaterias,
  type Asignacion,
  type Docente,
  type GrupoBasico,
  type Materia,
} from "@/lib/materias";

export interface DatosMaterias {
  materias: Materia[];
  grupos: GrupoBasico[];
  asignaciones: Asignacion[];
  docentes: Docente[];
}

/**
 * El docente recibe solo sus materias, grupos y asignaciones (H-08). El catálogo de docentes
 * solo hace falta para vincular, que es tarea del administrador: no se pide en otro caso.
 */
export async function cargarDatosMaterias(esAdmin: boolean): Promise<DatosMaterias> {
  const [materias, grupos, asignaciones, docentes] = await Promise.all([
    api.get("/materias"),
    api.get("/grupos"),
    api.get("/asignaciones"),
    esAdmin ? api.get("/catalogo/docentes") : Promise.resolve([]),
  ]);
  return {
    materias: normalizarMaterias(materias),
    grupos: normalizarGrupos(grupos),
    asignaciones: normalizarAsignaciones(asignaciones),
    docentes: normalizarDocentes(docentes),
  };
}

export const crearMateria = (nombre: string) => api.post("/materias", { nombre });
export const eliminarMateria = (id: string) => api.delete(`/materias/${id}`);

/** El backend espera docente_id numérico; materia y grupo se envían como texto, igual que antes. */
export const crearAsignacion = (docenteId: string, materiaId: string, grupoId: string) =>
  api.post("/asignaciones", { docente_id: Number(docenteId), materia_id: materiaId, grupo_id: grupoId });
export const eliminarAsignacion = (id: string) => api.delete(`/asignaciones/${id}`);
