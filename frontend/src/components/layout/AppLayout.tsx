import { ReactNode } from "react";
import { Link } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";
import { SelloMascota } from "@/components/common/Mascota";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsMobile, useIsNarrow } from "@/hooks/use-mobile";
import { accesosMovil, menuMas } from "./navegacion";

/**
 * Estructura de la app docente.
 * Escritorio y tableta: menú lateral claro. Celular: barra superior con la marca y barra
 * de navegación inferior con «Más».
 *
 * Importante: <main> ocupa siempre la misma posición en el árbol. Si cambiara de rama al
 * cruzar el ancho de celular (girar una tableta, redimensionar la ventana), React volvería
 * a montar la pantalla y se perderían los datos sin guardar (por ejemplo, notas digitadas).
 */
export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { collapsed } = useSidebar();
  const isMobile = useIsMobile();
  const estrecho = useIsNarrow();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <AppSidebar />}
      {isMobile && (
        <header
          className="sticky top-0 z-40 flex items-center gap-2.5 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur"
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top, 0px))" }}
        >
          <Link to="/app" className="flex items-center gap-2.5" aria-label="ClassKids, ir al inicio">
            <SelloMascota className="h-9 w-9 rounded-lg" />
            <span className="font-display text-lg font-bold text-foreground">ClassKids</span>
          </Link>
          <ThemeToggle className="ml-auto" />
        </header>
      )}
      <main
        className={
          isMobile
            ? "pb-nav-movil min-w-0 px-4 pt-5"
            : `min-w-0 p-6 transition-[margin] duration-300 lg:p-8 ${collapsed || estrecho ? "ml-[76px]" : "ml-[256px]"}`
        }
      >
        <div className="relative mx-auto max-w-[1400px]">
          <div aria-hidden="true" className="aurora-app pointer-events-none absolute -inset-x-4 -top-5 h-72 sm:-inset-x-6 sm:-top-6 lg:-top-8" />
          <div className="relative">{children}</div>
        </div>
      </main>
      {isMobile && <MobileNav accesos={accesosMovil} mas={menuMas} />}
    </div>
  );
};

export default AppLayout;
