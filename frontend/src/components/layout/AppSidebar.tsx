import { LogOut, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { NavLink, useLocation, Link } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsNarrow } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAlertasActivas } from "@/hooks/useAlertasActivas";
import { SelloMascota } from "@/components/common/Mascota";
import { iniciales } from "@/lib/notas";
import { modulosApp, fondoTono, esRutaActiva } from "./navegacion";

/** Menú lateral de escritorio: claro, con el azul tinta como color de identidad. */
export const AppSidebar = () => {
  const { collapsed: plegado, toggle } = useSidebar();
  const estrecho = useIsNarrow();
  const collapsed = plegado || estrecho;
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role, isAdmin } = useUserRole();
  const alertas = useAlertasActivas();

  return (
    <aside
      aria-label="Menú principal"
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ${
        collapsed ? "w-[76px]" : "w-[256px]"
      }`}
    >
      <div className={`flex items-center gap-3 py-5 ${collapsed ? "justify-center px-3" : "px-5"}`}>
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="ClassKids, ir al inicio">
          <SelloMascota className="h-11 w-11" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold leading-tight text-sidebar-primary">ClassKids</p>
              <p className="text-xs text-sidebar-muted">Seguimiento académico</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {modulosApp.map((item) => {
          const activo = esRutaActiva(location.pathname, item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              title={collapsed ? item.label : undefined}
              aria-current={activo ? "page" : undefined}
              className={`group flex h-11 items-center gap-3 rounded-xl px-2 text-[15px] transition-colors ${
                activo
                  ? "bg-sidebar-accent font-bold text-sidebar-primary"
                  : "font-medium text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-primary"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span
                className={`relative grid h-8 w-8 flex-none place-items-center rounded-lg ${
                  activo ? `${fondoTono[item.tono]} text-sidebar-primary` : ""
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {collapsed && item.path === "/app/alertas" && alertas > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-frambuesa ring-2 ring-sidebar" />
                )}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.path === "/app/alertas" && alertas > 0 && (
                <span className="ml-auto rounded-full bg-nivel-alerta px-2 py-0.5 text-xs font-bold text-nivel-alerta-fg">
                  {alertas}
                  <span className="sr-only"> por revisar</span>
                </span>
              )}
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink
            to="/admin"
            title={collapsed ? "Panel de administración" : undefined}
            className={`mt-4 flex h-11 items-center gap-3 rounded-xl border border-dashed border-input px-2 text-[15px] font-semibold text-sidebar-primary transition-colors hover:bg-sidebar-accent ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-menta">
              <ShieldCheck className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            {!collapsed && <span>Panel admin</span>}
          </NavLink>
        )}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-lavanda text-xs font-bold text-nivel-grupo-fg">
              {iniciales(user.nombre || user.email || "", user.apellido || "")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-sidebar-primary" title={user.email}>{user.email}</p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  role === "admin" ? "bg-menta text-nivel-excelente-fg" : "bg-lavanda text-nivel-grupo-fg"
                }`}
              >
                {role === "admin" ? "Administrador" : "Docente"}
              </span>
            </div>
          </div>
        )}
        <ThemeToggle conTexto={!collapsed} className={`w-full ${collapsed ? "" : "justify-start px-3"}`} />
        <button
          type="button"
          onClick={signOut}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-nivel-alerta hover:text-nivel-alerta-fg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-[18px] w-[18px] flex-none" aria-hidden="true" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {!estrecho && <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
        className="absolute -right-3 top-20 grid h-6 w-6 place-items-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-secondary"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-foreground" /> : <ChevronLeft className="h-3.5 w-3.5 text-foreground" />}
      </button>}
    </aside>
  );
};

export default AppSidebar;
