import { Link } from "react-router-dom";
import { SelloMascota } from "@/components/common/Mascota";
import ThemeToggle from "@/components/common/ThemeToggle";
import { SECCIONES } from "./contenido";

interface LandingHeaderProps {
  destino: string;
  conSesion: boolean;
}

/** Encabezado limpio: logo original, tres secciones y acceso. */
const LandingHeader = ({ destino, conSesion }: LandingHeaderProps) => (
  <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
    <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-10">
      <Link to="/" className="flex items-center gap-2.5" aria-label="ClassKids, inicio">
        <SelloMascota className="h-9 w-9" />
        <span className="font-display text-lg font-bold tracking-tight">ClassKids</span>
      </Link>
      <nav aria-label="Secciones" className="ml-6 hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
        {SECCIONES.map((s) => (
          <a key={s.href} href={s.href} className="transition-colors hover:text-foreground">{s.label}</a>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link to={destino} className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
          {conSesion ? "Abrir plataforma" : "Iniciar sesión"}
        </Link>
      </div>
    </div>
    <nav aria-label="Secciones" className="flex justify-center gap-6 border-t border-border/70 py-2 text-sm font-medium text-muted-foreground md:hidden">
      {SECCIONES.map((s) => <a key={s.href} href={s.href} className="hover:text-foreground">{s.label}</a>)}
    </nav>
  </header>
);

export default LandingHeader;
