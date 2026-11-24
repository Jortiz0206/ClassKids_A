import { ReactNode } from "react";
import { AlertCircle, Loader2, RefreshCw, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import Mascota from "./Mascota";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  /** La mascota acompaña los estados vacíos «de inicio»; en búsquedas sin resultados no. */
  conMascota?: boolean;
  icono?: ReactNode;
  className?: string;
}

/** Estado vacío: explica qué aparecerá aquí y cómo empezar. */
export const EstadoVacio = ({ titulo, descripcion, accion, conMascota = true, icono, className }: EstadoVacioProps) => (
  <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
    {conMascota ? (
      <Mascota className="h-24 w-16" />
    ) : (
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        {icono ?? <SearchX className="h-6 w-6" aria-hidden="true" />}
      </span>
    )}
    <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
    {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
    {accion && <div className="mt-1">{accion}</div>}
  </div>
);

/** Carga de una sección: texto claro, sin mencionar detalles técnicos. */
export const EstadoCargando = ({ texto = "Cargando información…", className }: { texto?: string; className?: string }) => (
  <div role="status" aria-live="polite" className={cn("flex items-center justify-center gap-3 py-12 text-sm text-muted-foreground", className)}>
    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
    <span>{texto}</span>
  </div>
);

/** Filas fantasma para tablas y listas mientras llegan los datos. */
export const FilasCargando = ({ filas = 5, className }: { filas?: number; className?: string }) => (
  <div role="status" aria-label="Cargando" className={cn("space-y-2 p-4", className)}>
    {Array.from({ length: filas }).map((_, i) => (
      <div key={i} className="h-11 animate-pulse rounded-lg bg-secondary" />
    ))}
  </div>
);

interface EstadoErrorProps {
  titulo?: string;
  descripcion?: string;
  onReintentar?: () => void;
  className?: string;
}

/** Error de conexión o de carga, con opción de reintentar. */
export const EstadoError = ({
  titulo = "No pudimos cargar la información",
  descripcion = "Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, avisa a la coordinación.",
  onReintentar,
  className,
}: EstadoErrorProps) => (
  <div role="alert" className={cn("flex flex-col items-center justify-center gap-3 px-6 py-10 text-center", className)}>
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-nivel-alerta text-nivel-alerta-fg">
      <AlertCircle className="h-6 w-6" aria-hidden="true" />
    </span>
    <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
    <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>
    {onReintentar && (
      <button
        type="button"
        onClick={onReintentar}
        className="mt-1 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reintentar
      </button>
    )}
  </div>
);
