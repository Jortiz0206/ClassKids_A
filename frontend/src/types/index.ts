// src/types/index.ts

export interface Grupo {
  id: number;
  nombre: string;
  grado?: string;
  turno?: string;
  ano_lectivo?: number; // mismo nombre que la columna y la respuesta de GET /grupos (H-27)
}

export interface Estudiante {
  id: number;
  documento: string;
  nombre: string;
  apellido: string;
  grupo_id?: number;
  nombre_grupo?: string;
  activo: boolean;
}

export interface Materia {
  id: number;
  nombre: string;
  codigo?: string;
}

export interface Actividad {
  id: number;
  materia_id: number;
  grupo_id: number;
  materia_nombre?: string;
  grupo_nombre?: string;
  titulo: string;
  tipo?: string;
  descripcion?: string;
  fecha_entrega?: string;
  estado?: string;
}

export interface Calificacion {
  id: number;
  estudiante_id: number;
  materia_id: number;
  actividad_id?: number | null;
  estudiante_nombre?: string;
  estudiante_apellido?: string;
  materia_nombre?: string;
  nota: number;
  periodo?: number;
  observacion?: string | null;
  fecha_registro?: string;
  /** Estado «Entregado» (H-31); solo existe si la migración 001 está aplicada. */
  entregado?: boolean;
}

export interface Observacion {
  id: number;
  estudiante_id: number;
  estudiante_nombre?: string;
  estudiante_apellido?: string;
  tipo?: string;
  descripcion: string;
  fecha?: string;
}

export interface Alerta {
  id: number;
  estudiante_id: number;
  estudiante_nombre?: string;
  estudiante_apellido?: string;
  tipo: string;
  mensaje: string;
  estado: string;
  fecha_creacion?: string;
}