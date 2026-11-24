import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Ícono del módulo, sobre el color del módulo (mismo que en el menú). */
  icon?: LucideIcon;
  /** Clase de fondo del ícono, por ejemplo «bg-menta». */
  tono?: string;
}

/** Encabezado común de las pantallas: identifica el módulo y agrupa sus acciones. */
const PageHeader = ({ eyebrow, title, description, actions, icon: Icon, tono = "bg-menta" }: PageHeaderProps) => (
  <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex min-w-0 items-start gap-3.5">
      {Icon && (
        <span className={cn("sombra-tarjeta mt-1 hidden h-12 w-12 flex-none place-items-center rounded-2xl text-foreground ring-1 ring-border/60 sm:grid", tono)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p>}
        <h1 className="mt-0.5 text-[28px] font-bold leading-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-muted-foreground">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </header>
);

export default PageHeader;
