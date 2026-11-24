import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { SelloMascota } from "@/components/common/Mascota";

const LEGAL_LINKS = [
  { to: "/legal/terminos", label: "Términos y condiciones" },
  { to: "/legal/privacidad", label: "Política de privacidad" },
  { to: "/legal/cookies", label: "Política de cookies" },
  { to: "/legal/proteccion-datos", label: "Protección de datos" },
];

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, updatedAt, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex h-[76px] max-w-4xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <SelloMascota className="h-10 w-10" />
            <span className="font-display text-xl font-bold tracking-tight">ClassKids</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-6 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-muted-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Documento legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: {updatedAt}</p>

        <div className="prose-legal mt-10 space-y-6 text-[15px] leading-7 text-muted-foreground">
          {children}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ClassKids — Proyecto de formación ADSO, SENA.
      </footer>
    </div>
  );
};

export default LegalLayout;
