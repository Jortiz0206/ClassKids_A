import { useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { LayoutGrid, LogOut, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAlertasActivas } from "@/hooks/useAlertasActivas";
import { iniciales } from "@/lib/notas";
import { type ItemNav, fondoTono, esRutaActiva, itemsVisibles } from "./navegacion";

interface MobileNavProps {
  accesos: (ItemNav & { end?: boolean })[];
  mas: ItemNav[];
  /** Enlace extra al final de «Más» (por ejemplo, volver a la app desde administración). */
  extraMas?: ItemNav;
}

/**
 * Barra de navegación inferior para celulares: cuatro accesos y «Más».
 * Respeta el área segura inferior del dispositivo. «Más» abre una hoja con el resto de
 * módulos; los de administración solo aparecen para administradores.
 */
const MobileNav = ({ accesos, mas, extraMas }: MobileNavProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role, isAdmin } = useUserRole();
  const alertas = useAlertasActivas();
  const [abierto, setAbierto] = useState(false);

  const itemsMas = [...itemsVisibles(mas, isAdmin), ...(extraMas ? [extraMas] : [])];
  const masActivo = itemsMas.some((i) => esRutaActiva(location.pathname, i.path));

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-1.5">
          {accesos.map((item) => {
            const activo = esRutaActiva(location.pathname, item.path, item.end);
            return (
              <li key={item.path} className="flex-1">
                <NavLink
                  to={item.path}
                  end={item.end ?? item.path === "/app"}
                  aria-current={activo ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1 text-xs ${
                    activo ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                  }`}
                >
                  <span className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${activo ? fondoTono[item.tono] : ""}`}>
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="max-w-full truncate">{item.corto ?? item.label}</span>
                  {item.path === "/app/alertas" && alertas > 0 && (
                    <span className="absolute left-1/2 top-0 ml-2 min-w-[20px] rounded-full border-2 border-card bg-destructive px-1 text-center text-xs font-bold leading-4 text-destructive-foreground">
                      {alertas > 99 ? "99+" : alertas}
                      <span className="sr-only"> por revisar</span>
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setAbierto(true)}
              aria-haspopup="dialog"
              aria-expanded={abierto}
              className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1 text-xs ${
                masActivo ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
              }`}
            >
              <span className={`grid h-8 w-12 place-items-center rounded-full ${masActivo ? "bg-secondary" : ""}`}>
                <LayoutGrid className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>Más</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent side="bottom" className="pb-safe max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pt-3 [&>button]:hidden">
          <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-border" aria-hidden="true" />
          <div className="mb-4 flex items-center justify-between">
            <div>
              <SheetTitle className="font-display text-xl">Más módulos</SheetTitle>
              <SheetDescription className="text-sm">Elige a dónde quieres ir.</SheetDescription>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="grid grid-cols-2 gap-2.5">
            {itemsMas.map((item) => {
              const activo = esRutaActiva(location.pathname, item.path);
              return (
                <li key={item.path} className={item.soloAdmin && item.path === "/admin" ? "col-span-2" : ""}>
                  <Link
                    to={item.path}
                    onClick={() => setAbierto(false)}
                    aria-current={activo ? "page" : undefined}
                    className={`flex min-h-[56px] items-center gap-3 rounded-2xl border px-3 py-2.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary ${
                      activo ? "border-primary bg-secondary" : "border-border"
                    } ${item.soloAdmin ? "border-dashed" : ""}`}
                  >
                    <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${fondoTono[item.tono]}`}>
                      <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {user && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-secondary p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-lavanda text-xs font-bold text-nivel-grupo-fg">
                  {iniciales(user.nombre || user.email || "", user.apellido || "")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{role === "admin" ? "Administrador" : "Docente"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setAbierto(false); signOut(); }}
                className="inline-flex h-10 flex-none items-center gap-2 rounded-xl bg-card px-3 text-sm font-semibold text-nivel-alerta-fg"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> Salir
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;
