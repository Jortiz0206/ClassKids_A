import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertTriangle, Star, Eye, BellRing } from "lucide-react";

export type Tono = "excelente" | "aprobado" | "observar" | "reprobado" | "alerta" | "sin" | "grupo";

const estilos: Record<Tono, string> = {
  excelente: "bg-nivel-excelente text-nivel-excelente-fg",
  aprobado: "bg-nivel-aprobado text-nivel-aprobado-fg",
  observar: "bg-nivel-observar text-nivel-observar-fg",
  reprobado: "bg-nivel-reprobado text-nivel-reprobado-fg",
  alerta: "bg-nivel-alerta text-nivel-alerta-fg",
  sin: "bg-nivel-sin text-nivel-sin-fg",
  grupo: "bg-nivel-grupo text-nivel-grupo-fg",
};

// Un ícono por estado para no depender solo del color (WCAG 1.4.1).
const iconos: Partial<Record<Tono, typeof Circle>> = {
  excelente: Star,
  aprobado: CheckCircle2,
  observar: Eye,
  reprobado: AlertTriangle,
  alerta: BellRing,
  sin: Circle,
};

interface EstadoBadgeProps {
  tono: Tono;
  children: React.ReactNode;
  className?: string;
  /** Muestra el ícono del estado (por defecto sí, salvo en «grupo»). */
  icono?: boolean;
}

/** Etiqueta de estado con fondo suave y texto oscuro (contraste ≥ 4.5:1). */
const EstadoBadge = ({ tono, children, className, icono = tono !== "grupo" }: EstadoBadgeProps) => {
  const Icono = iconos[tono];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        estilos[tono],
        className,
      )}
    >
      {icono && Icono && <Icono className="h-3.5 w-3.5 flex-none" aria-hidden="true" />}
      {children}
    </span>
  );
};

export const tonoClases = estilos;
export default EstadoBadge;
