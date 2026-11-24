import { ReactNode } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ShieldCheck, LogOut, ArrowLeft, LayoutDashboard } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile, useIsNarrow } from "@/hooks/use-mobile";
import { SelloMascota } from "@/components/common/Mascota";
import { iniciales } from "@/lib/notas";
import MobileNav from "./MobileNav";
import { modulosAdmin, fondoTono, esRutaActiva, type ItemNav } from "./navegacion";

const volverApp: ItemNav = { icon: ArrowLeft, label: "Volver a la vista docente", path: "/app", tono: "menta" };
const irApp: ItemNav = { icon: LayoutDashboard, label: "Gestión académica", corto: "App", path: "/app", tono: "menta" };

/** Estructura del área de administración (solo administradores; protegida por AdminRoute). */
export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const estrecho = useIsNarrow();
  const location = useLocation();

  const plegado = estrecho;

  return (
    <div className={isMobile ? "min-h-screen bg-background" : "flex min-h-screen bg-background"}>
      {isMobile && (
        <header className="sticky top-0 z-40 flex items-center justify-between gap-2.5 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur" style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top, 0px))" }}>
          <Link to="/admin" className="flex items-center gap-2.5">
            <SelloMascota className="h-9 w-9 rounded-lg" />
            <span className="font-display text-lg font-bold text-foreground">ClassKids</span>
          </Link>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-menta px-2.5 py-1 text-xs font-semibold text-nivel-excelente-fg">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Administración
          </span>
          <ThemeToggle />
        </header>
      )}
      {!isMobile && <aside
        aria-label="Menú de administración"
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground ${plegado ? "w-[76px]" : "w-[256px]"}`}
      >
        <div className={`py-5 ${plegado ? "flex justify-center px-3" : "px-5"}`}>
          <Link to="/" className="flex items-center gap-3">
            <SelloMascota className="h-11 w-11" />
            {!plegado && (
              <div>
                <p className="font-display text-lg font-bold leading-tight text-sidebar-primary">ClassKids</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-nivel-excelente-fg">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Administración
                </p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {modulosAdmin.map((it) => {
            const activo = esRutaActiva(location.pathname, it.path, it.end);
            return (
              <NavLink
                key={it.path}
                to={it.path}
                end={it.end}
                title={plegado ? it.label : undefined}
                className={`flex h-11 items-center gap-3 rounded-xl px-2 text-[15px] transition-colors ${
                  activo ? "bg-sidebar-accent font-bold text-sidebar-primary" : "font-medium text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-primary"
                } ${plegado ? "justify-center" : ""}`}
              >
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg ${activo ? fondoTono[it.tono] : ""}`}>
                  <it.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {!plegado && it.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-sidebar-border p-3">
          {user && !plegado && (
            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-menta text-xs font-bold text-nivel-excelente-fg">
                {iniciales(user.nombre || user.email || "", user.apellido || "")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-sidebar-primary" title={user.email}>{user.email}</p>
                <span className="mt-0.5 inline-block rounded-full bg-menta px-2 py-0.5 text-xs font-semibold text-nivel-excelente-fg">Administrador</span>
              </div>
            </div>
          )}
          <ThemeToggle conTexto={!plegado} className={`w-full ${plegado ? "" : "justify-start px-3"}`} />
          <Link
            to="/app"
            title={plegado ? "Gestión académica" : undefined}
            className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary ${plegado ? "justify-center" : ""}`}
          >
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" /> {!plegado && "Gestión académica"}
          </Link>
          <button
            type="button"
            onClick={signOut}
            title={plegado ? "Cerrar sesión" : undefined}
            className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-nivel-alerta hover:text-nivel-alerta-fg ${plegado ? "justify-center" : ""}`}
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> {!plegado && "Cerrar sesión"}
          </button>
        </div>
      </aside>}

      {/* <main> en posición fija del árbol: cambiar de ancho no vuelve a montar la pantalla. */}
      <main className={isMobile ? "pb-nav-movil min-w-0 px-4 pt-5" : `min-w-0 flex-1 p-6 lg:p-8 ${plegado ? "ml-[76px]" : "ml-[256px]"}`}>
        <div className="relative mx-auto max-w-[1400px]">
          <div aria-hidden="true" className="aurora-app pointer-events-none absolute -inset-x-4 -top-5 h-72 sm:-inset-x-6 sm:-top-6 lg:-top-8" />
          <div className="relative">{children}</div>
        </div>
      </main>
      {isMobile && <MobileNav accesos={[...modulosAdmin, irApp]} mas={[]} extraMas={volverApp} />}
    </div>
  );
};

export default AdminLayout;
