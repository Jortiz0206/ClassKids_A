import {
  LayoutDashboard, Users, BookOpen, BarChart3, Bell, GraduationCap, ClipboardList, Library,
  ShieldCheck, UserCog, Database, type LucideIcon,
} from "lucide-react";

// Configuración única de la navegación. El menú lateral (escritorio) y la barra inferior
// (celular) leen de aquí, así que muestran exactamente las mismas rutas. Las protecciones
// de ruta siguen en App.tsx (ProtectedRoute / AdminRoute); esto solo decide qué se ve.

export type TonoModulo = "menta" | "cielo" | "lavanda" | "durazno" | "mantequilla" | "alerta";

export interface ItemNav {
  icon: LucideIcon;
  label: string;
  /** Rótulo corto para la barra inferior. */
  corto?: string;
  path: string;
  tono: TonoModulo;
  soloAdmin?: boolean;
}

/** Módulos de la app docente, en el orden del menú lateral. */
export const modulosApp: ItemNav[] = [
  { icon: LayoutDashboard, label: "Dashboard", corto: "Inicio", path: "/app", tono: "menta" },
  { icon: Users, label: "Grupos", path: "/app/grupos", tono: "lavanda" },
  { icon: GraduationCap, label: "Estudiantes", path: "/app/estudiantes", tono: "cielo" },
  { icon: Library, label: "Materias", path: "/app/materias", tono: "mantequilla" },
  { icon: BookOpen, label: "Actividades", path: "/app/actividades", tono: "durazno" },
  { icon: ClipboardList, label: "Calificaciones", path: "/app/calificaciones", tono: "menta" },
  { icon: BarChart3, label: "Análisis", path: "/app/analisis", tono: "cielo" },
  { icon: Bell, label: "Alertas", path: "/app/alertas", tono: "alerta" },
];

const porRuta = (path: string) => modulosApp.find((m) => m.path === path)!;

/** Barra inferior del celular: cuatro accesos directos + «Más». */
export const accesosMovil: ItemNav[] = [
  porRuta("/app"),
  porRuta("/app/estudiantes"),
  porRuta("/app/calificaciones"),
  porRuta("/app/alertas"),
];

/** Contenido del menú «Más». Los de administración solo se muestran a administradores. */
export const menuMas: ItemNav[] = [
  porRuta("/app/grupos"),
  porRuta("/app/actividades"),
  porRuta("/app/analisis"),
  porRuta("/app/materias"),
  { icon: UserCog, label: "Usuarios", path: "/admin/usuarios", tono: "lavanda", soloAdmin: true },
  { icon: ShieldCheck, label: "Panel de administración", path: "/admin", tono: "menta", soloAdmin: true },
];

/** Área de administración (AdminLayout). */
export const modulosAdmin: (ItemNav & { end?: boolean })[] = [
  { icon: LayoutDashboard, label: "Resumen", path: "/admin", tono: "menta", end: true },
  { icon: UserCog, label: "Usuarios", path: "/admin/usuarios", tono: "lavanda" },
  { icon: Database, label: "Datos globales", corto: "Datos", path: "/admin/datos", tono: "cielo" },
];

export const fondoTono: Record<TonoModulo, string> = {
  menta: "bg-menta",
  cielo: "bg-cielo",
  lavanda: "bg-lavanda",
  durazno: "bg-durazno",
  mantequilla: "bg-mantequilla",
  alerta: "bg-nivel-alerta text-nivel-alerta-fg",
};

/** Ruta activa: «/app» solo coincide exacto; el resto también con subrutas. */
export function esRutaActiva(actual: string, path: string, exacta = false): boolean {
  if (exacta || path === "/app" || path === "/admin") return actual === path || actual === `${path}/`;
  return actual === path || actual.startsWith(`${path}/`);
}

/** Filtra los ítems según el rol (los marcados soloAdmin requieren administrador). */
export function itemsVisibles<T extends { soloAdmin?: boolean }>(items: T[], esAdmin: boolean): T[] {
  return items.filter((i) => !i.soloAdmin || esAdmin);
}
