import { useMemo } from "react";
import { TrendingDown, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecurso } from "@/hooks/useRecurso";
import { Alerta } from "../../types";
import { contarAlertasActivas, esAlertaActiva } from "@/lib/conteos";
import { tiempoRelativo } from "@/lib/fechas";
import { mapaGrupoPorEstudiante } from "@/lib/listas";
import EstadoBadge from "@/components/common/EstadoBadge";
import { EstadoCargando, EstadoVacio, EstadoError } from "@/components/common/Estados";

interface AlertUI {
  id: number;
  student: string;
  group: string;
  type: string;
  message: string;
  date: string;
}

const iconoTipo = (tipo: string) => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("inasist")) return Clock;
  if (t.includes("low_grade") || t.includes("rendimiento")) return TrendingDown;
  return AlertTriangle;
};

/** Cuántas alertas muestra el resumen; la lista completa está en el módulo Alertas. */
const ALERTAS_EN_RESUMEN = 5;

/** Panel del Dashboard: solo alertas activas (mismo criterio que el contador, H-25). */
const AlertsPanel = () => {
  // Listas compartidas con el resto del Dashboard (una sola petición por recurso).
  const qAlertas = useRecurso<Alerta>("/alertas");
  const qEst = useRecurso<{ id: number; grupo_id?: number | null }>("/estudiantes");
  const qGrupos = useRecurso<{ id: number; nombre: string }>("/grupos");
  const loading = qAlertas.isLoading || qEst.isLoading || qGrupos.isLoading;
  const error = qAlertas.isError || qEst.isError || qGrupos.isError;
  const fetchAlerts = () => { qAlertas.refetch(); qEst.refetch(); qGrupos.refetch(); };

  const { alerts, activas } = useMemo(() => {
    const data = qAlertas.data || [];
    // El grupo del estudiante se muestra junto al nombre (antes decía «Activo» en todas).
    const grupoDe = mapaGrupoPorEstudiante(qEst.data || [], qGrupos.data || []);
    // Las resueltas siguen en PostgreSQL y se consultan en Alertas con el filtro «Resueltas».
    const mapped: AlertUI[] = data.filter(esAlertaActiva).map((a) => ({
      id: a.id,
      student: `${a.estudiante_nombre || ""} ${a.estudiante_apellido || ""}`.trim() || "Estudiante",
      group: grupoDe.get(String(a.estudiante_id)) || "Sin grupo",
      type: a.tipo,
      message: a.mensaje,
      date: tiempoRelativo(a.fecha_creacion),
    }));
    return { alerts: mapped, activas: contarAlertasActivas(data) };
  }, [qAlertas.data, qEst.data, qGrupos.data]);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card animate-fade-in">
      <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Alertas tempranas</h3>
          <p className="text-[13px] text-muted-foreground">Promedio acumulado inferior a 3.0</p>
        </div>
        {!loading && !error && <EstadoBadge tono="alerta">{activas} activas</EstadoBadge>}
      </div>

      {loading ? (
        <EstadoCargando texto="Cargando alertas…" />
      ) : error ? (
        <EstadoError titulo="No pudimos cargar las alertas" onReintentar={fetchAlerts} />
      ) : alerts.length === 0 ? (
        <EstadoVacio titulo="Sin alertas activas" descripcion="Ningún estudiante tiene un promedio por debajo de 3.0 en este momento." />
      ) : (
        <ul className="divide-y divide-border px-3" aria-label="Alertas activas más recientes">
          {alerts.slice(0, ALERTAS_EN_RESUMEN).map((alert) => {
            const Icon = iconoTipo(alert.type);
            return (
              <li key={alert.id}>
                <div className="group grid grid-cols-[36px_1fr_auto] items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/60">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-nivel-alerta text-nivel-alerta-fg">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[15px] font-semibold text-card-foreground">{alert.student}</span>
                      <EstadoBadge tono="grupo">{alert.group}</EstadoBadge>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{alert.message}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{alert.date}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3.5 text-sm font-semibold">
        <Link to="/app/alertas" className="inline-flex items-center gap-1 text-azul hover:underline">
          {alerts.length > ALERTAS_EN_RESUMEN ? `Ver las ${activas} alertas activas` : "Gestionar alertas"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/app/alertas?estado=resolved" className="text-muted-foreground hover:text-foreground hover:underline">
          Ver alertas resueltas
        </Link>
      </div>
    </div>
  );
};

export default AlertsPanel;
