import { Link } from "react-router-dom";
import { SelloMascota } from "@/components/common/Mascota";
import { CONTACT_EMAIL } from "@/lib/contact";
import { LEGAL_LINKS, SECCIONES } from "./contenido";

interface LandingFooterProps {
  destino: string;
  conSesion: boolean;
}

const enlace = "text-sm text-muted-foreground transition-colors hover:text-foreground";

const LandingFooter = ({ destino, conSesion }: LandingFooterProps) => (
  <footer className="border-t border-border bg-card px-4 sm:px-6 lg:px-10">
    <div className="mx-auto grid max-w-[75rem] gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
      <div>
        <div className="flex items-center gap-2.5"><SelloMascota className="h-9 w-9" /><span className="font-display text-lg font-bold">ClassKids</span></div>
        <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Seguimiento académico para equipos que acompañan mejor.</p>
      </div>
      <nav aria-label="Producto">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Producto</p>
        <ul className="mt-4 space-y-2.5">
          {SECCIONES.map((s) => <li key={s.href}><a href={s.href} className={enlace}>{s.label}</a></li>)}
        </ul>
      </nav>
      <nav aria-label="Acceso">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Acceso</p>
        <ul className="mt-4 space-y-2.5">
          <li><Link to={destino} className={enlace}>{conSesion ? "Abrir plataforma" : "Iniciar sesión"}</Link></li>
          <li><a href={`mailto:${CONTACT_EMAIL}`} className={enlace}>{CONTACT_EMAIL}</a></li>
        </ul>
      </nav>
      <nav aria-label="Información legal">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Legal</p>
        <ul className="mt-4 space-y-2.5">
          {LEGAL_LINKS.map((l) => <li key={l.to}><Link to={l.to} className={enlace}>{l.label}</Link></li>)}
        </ul>
      </nav>
    </div>
    <div className="mx-auto flex max-w-[75rem] flex-col gap-2 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} ClassKids</p>
      <p>Proyecto de formación del programa Análisis y Desarrollo de Software (ADSO) · SENA</p>
    </div>
  </footer>
);

export default LandingFooter;
