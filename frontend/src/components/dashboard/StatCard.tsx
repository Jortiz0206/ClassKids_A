import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Texto de apoyo bajo la cifra. */
  hint?: string;
  /** Clase de fondo del ícono (color del módulo), por ejemplo «bg-lavanda». */
  tono?: string;
  delay?: number;
  className?: string;
}

/**
 * Indicador numérico. Tarjeta blanca; el color solo va en el ícono para que la cifra
 * se lea primero. El rótulo va inmediatamente antes de la cifra (las pruebas E2E lo usan).
 */
export const StatCard = ({ icon: Icon, label, value, hint, tono = "bg-secondary", delay = 0, className }: StatCardProps) => (
  <div
    className={cn("sombra-tarjeta flex items-center gap-4 rounded-2xl border border-border bg-card p-4 animate-fade-in transition-transform motion-safe:hover:-translate-y-0.5 sm:p-5", className)}
    style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
  >
    <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-xl text-foreground", tono)}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-[28px] font-bold leading-none tabular-nums text-card-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  </div>
);

export default StatCard;
