import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { siguienteTema, etiquetaCambioTema, type TemaResuelto } from "@/lib/tema";

interface ThemeToggleProps {
  className?: string;
  /** Muestra el texto «Modo oscuro / Modo claro» junto al ícono. */
  conTexto?: boolean;
}

/**
 * Selector de modo claro / oscuro. La preferencia la guarda next-themes en localStorage
 * (clave «classkids-tema»), así que se mantiene al navegar y al recargar.
 */
const ThemeToggle = ({ className, conTexto = false }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const actual: TemaResuelto = montado && resolvedTheme === "dark" ? "dark" : "light";
  const etiqueta = etiquetaCambioTema(actual);
  const Icono = actual === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(siguienteTema(actual))}
      aria-label={etiqueta}
      title={etiqueta}
      data-tema={actual}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary",
        className,
      )}
    >
      <Icono className="h-[18px] w-[18px]" aria-hidden="true" />
      {conTexto && <span>{actual === "dark" ? "Modo claro" : "Modo oscuro"}</span>}
    </button>
  );
};

export default ThemeToggle;
