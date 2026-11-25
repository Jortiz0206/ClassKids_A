/**
 * Contenido de la landing, separado de la presentación.
 *
 * Todo lo que se afirma aquí corresponde a funciones que existen en la aplicación.
 * - Las imágenes son capturas REALES de la app en el entorno de pruebas, con los datos de
 *   demostración (Docs/evidencias/scripts/capturas-producto-landing.cjs).
 * - La landing no muestra cifras propias: la experiencia se cuenta con capturas reales.
 * Si cambia una pantalla, vuelva a ejecutar ese script; no edite las imágenes a mano.
 */
import type { LucideIcon } from "lucide-react";
import { BarChart3, BellRing, BookOpen, ClipboardCheck, GraduationCap, Library, ShieldCheck, Users } from "lucide-react";
import { UMBRAL_ALERTA_NOTA, UMBRAL_APROBACION_NOTA } from "@/lib/notas";

import dashboardClaro from "@/assets/producto/dashboard-claro.webp";
import dashboardOscuro from "@/assets/producto/dashboard-oscuro.webp";
import estudiantesClaro from "@/assets/producto/estudiantes-claro.webp";
import estudiantesOscuro from "@/assets/producto/estudiantes-oscuro.webp";
import gruposClaro from "@/assets/producto/grupos-claro.webp";
import gruposOscuro from "@/assets/producto/grupos-oscuro.webp";
import actividadesClaro from "@/assets/producto/actividades-claro.webp";
import actividadesOscuro from "@/assets/producto/actividades-oscuro.webp";
import calificacionesClaro from "@/assets/producto/calificaciones-claro.webp";
import calificacionesOscuro from "@/assets/producto/calificaciones-oscuro.webp";
import analisisClaro from "@/assets/producto/analisis-claro.webp";
import analisisOscuro from "@/assets/producto/analisis-oscuro.webp";
import alertasClaro from "@/assets/producto/alertas-claro.webp";
import alertasOscuro from "@/assets/producto/alertas-oscuro.webp";
import materiasClaro from "@/assets/producto/materias-claro.webp";
import materiasOscuro from "@/assets/producto/materias-oscuro.webp";
import usuariosClaro from "@/assets/producto/usuarios-claro.webp";
import usuariosOscuro from "@/assets/producto/usuarios-oscuro.webp";
import movilCalificacionesClaro from "@/assets/producto/movil-calificaciones-claro.webp";
import movilCalificacionesOscuro from "@/assets/producto/movil-calificaciones-oscuro.webp";
import movilAlertaClaro from "@/assets/producto/movil-alerta-claro.webp";
import movilAlertaOscuro from "@/assets/producto/movil-alerta-oscuro.webp";
import movilEstudianteClaro from "@/assets/producto/movil-estudiante-claro.webp";
import movilEstudianteOscuro from "@/assets/producto/movil-estudiante-oscuro.webp";

/** Una captura real en sus dos temas. */
export interface Captura {
  claro: string;
  oscuro: string;
  alt: string;
  ancho: number;
  alto: number;
}

export const CAPTURA_PANEL: Captura = {
  claro: dashboardClaro,
  oscuro: dashboardOscuro,
  alt: "Panel del docente en ClassKids: grupos, estudiantes, actividades, alertas activas y rendimiento por materia",
  ancho: 1440,
  alto: 900,
};

const captura = (claro: string, oscuro: string, alt: string): Captura => ({ claro, oscuro, alt, ancho: 1164, alto: 900 });

export interface ModuloLanding {
  id: string;
  nombre: string;
  icono: LucideIcon;
  /** Clase de fondo del ícono (paleta de identidad). */
  tono: string;
  titular: string;
  descripcion: string;
  puntos: string[];
  captura: Captura;
}

const modulo = (m: ModuloLanding) => m;

export const MODULOS = {
  calificaciones: modulo({
    id: "calificaciones", nombre: "Calificaciones", icono: ClipboardCheck, tono: "bg-menta",
    titular: "Notas de 0.0 a 5.0, la escala oficial del colegio.",
    descripcion: "El docente elige grupo y actividad, escribe la nota y marca la entrega. La equivalencia aparece al instante.",
    puntos: ["Notas de 0.0 a 5.0 con su equivalencia en %", `Aprobado desde ${UMBRAL_APROBACION_NOTA.toFixed(1)}`, "Solo se guardan las filas modificadas"],
    captura: captura(calificacionesClaro, calificacionesOscuro, "Módulo Calificaciones: notas por estudiante con su equivalencia, entrega y estado"),
  }),
  analisis: modulo({
    id: "analisis", nombre: "Análisis", icono: BarChart3, tono: "bg-cielo",
    titular: "El rendimiento, leído de un vistazo.",
    descripcion: "Promedio por grupo, distribución por nivel, tendencia mensual y rendimiento por tipo de actividad.",
    puntos: [`Referencias en ${UMBRAL_ALERTA_NOTA.toFixed(1)} y ${UMBRAL_APROBACION_NOTA.toFixed(1)}`, "Estudiantes en riesgo académico", "Promedios en la escala 0.0 – 5.0"],
    captura: captura(analisisClaro, analisisOscuro, "Módulo Análisis: indicadores, rendimiento por grupo, distribución y tendencia"),
  }),
  estudiantes: modulo({
    id: "estudiantes", nombre: "Estudiantes", icono: GraduationCap, tono: "bg-cielo",
    titular: "Cada estudiante, con su contexto.",
    descripcion: "Búsqueda y filtros por grupo y estado, con promedio, tendencia, alertas y una ficha con observaciones de seguimiento.",
    puntos: [],
    captura: captura(estudiantesClaro, estudiantesOscuro, "Módulo Estudiantes: totales, filtros y tabla con promedio, tendencia, estado y alertas"),
  }),
  alertas: modulo({
    id: "alertas", nombre: "Alertas", icono: BellRing, tono: "bg-nivel-alerta text-nivel-alerta-fg",
    titular: "Las señales, en un solo lugar.",
    descripcion: "Cada alerta muestra estudiante, grupo y prioridad. El docente la revisa y la lleva de activa a resuelta.",
    puntos: [],
    captura: captura(alertasClaro, alertasOscuro, "Módulo Alertas tempranas: totales por estado y lista de alertas con grupo y prioridad"),
  }),
  grupos: modulo({
    id: "grupos", nombre: "Grupos", icono: Users, tono: "bg-lavanda",
    titular: "Grupos", descripcion: "Estudiantes, actividades, promedio y alertas abiertas de cada curso, con filtros por grado y jornada.", puntos: [],
    captura: captura(gruposClaro, gruposOscuro, "Módulo Grupos: tarjetas por grupo con estudiantes, actividades, promedio y alertas"),
  }),
  actividades: modulo({
    id: "actividades", nombre: "Actividades", icono: BookOpen, tono: "bg-durazno",
    titular: "Actividades", descripcion: "Tareas, exámenes, proyectos y participaciones por grupo, con fecha de entrega y avance de entregas.", puntos: [],
    captura: captura(actividadesClaro, actividadesOscuro, "Módulo Actividades: totales por estado y tarjetas con entregas y promedio"),
  }),
  materias: modulo({
    id: "materias", nombre: "Materias", icono: Library, tono: "bg-mantequilla",
    titular: "Materias", descripcion: "Catálogo de asignaturas y su vínculo con cada grupo y su docente.", puntos: [],
    captura: captura(materiasClaro, materiasOscuro, "Módulo Materias y asignaciones: totales, catálogo y grupos asignados"),
  }),
  usuarios: modulo({
    id: "usuarios", nombre: "Usuarios y administración", icono: ShieldCheck, tono: "bg-lavanda",
    titular: "Administración, solo para quien la necesita.",
    descripcion: "El administrador invita docentes por correo, cambia roles, desactiva accesos y consulta los datos globales de la plataforma.",
    puntos: ["Acceso solo por invitación", "Roles: docente y administrador", "Desactivar sin borrar el historial"],
    captura: captura(usuariosClaro, usuariosOscuro, "Administración de usuarios: nombre, correo, rol, última conexión y acciones"),
  }),
};

const movil = (claro: string, oscuro: string, alt: string): Captura => ({ claro, oscuro, alt, ancho: 720, alto: 1226 });

/** Pantallas reales de la app en el celular para la sección «Un flujo simple…». */
export const PANTALLAS_FLUJO = {
  calificacion: movil(movilCalificacionesClaro, movilCalificacionesOscuro, "Calificaciones en el celular: una nota de 75 sobre 100 sin guardar muestra su equivalencia 3.8"),
  alerta: movil(movilAlertaClaro, movilAlertaOscuro, "Detalle de una alerta en el celular, con los botones Marcar en revisión y Resolver"),
  seguimiento: movil(movilEstudianteClaro, movilEstudianteOscuro, "Ficha de un estudiante en el celular con sus observaciones de seguimiento"),
};

/** Regla real de alertas (backend, RN-09): al registrar una nota, promedio acumulado del estudiante < 3.0. */
export const REGLA_ALERTA = UMBRAL_ALERTA_NOTA;
export const REGLA_APROBACION = UMBRAL_APROBACION_NOTA;

/**
 * Video VIGENTE del recorrido (v3, grabado después de H-08): grabación real de la app en el entorno de pruebas
 * (Docs/evidencias/scripts/grabar-recorrido.cjs) con música instrumental original
 * (Docs/evidencias/scripts/montar-recorrido.py). Las versiones anteriores (v1 sin audio, v2 anterior a H-08 y v3 con la
 * nota en porcentaje) se eliminaron el 25/11/2026. Si se borra el archivo, ponga null aquí y la sección del video
 * desaparece (no se muestra un reproductor vacío).
 */
export const VIDEO_RECORRIDO: string | null = "/video/recorrido-classkids-v3.webm";

/** Portada del video: un cuadro real del propio video (su placa de inicio con la plantica). */
export const VIDEO_PORTADA = "/video/recorrido-classkids-v3-portada.webp";

export const SECCIONES = [
  { href: "#proposito", label: "Propósito" },
  { href: "#plataforma", label: "Módulos" },
  { href: "#recorrido", label: "Recorrido" },
];

export const LEGAL_LINKS = [
  { to: "/legal/terminos", label: "Términos y condiciones" },
  { to: "/legal/privacidad", label: "Política de privacidad" },
  { to: "/legal/cookies", label: "Política de cookies" },
  { to: "/legal/proteccion-datos", label: "Protección de datos" },
];
