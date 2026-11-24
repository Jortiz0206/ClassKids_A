import { useState, useEffect } from "react";
import { AlertTriangle, Clock, TrendingDown, CheckCircle, Filter, Bell, Eye, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/api/client";
import PageHeader from "@/components/layout/PageHeader";
import EstadoBadge, { type Tono } from "@/components/common/EstadoBadge";
import { EstadoCargando, EstadoVacio, EstadoError } from "@/components/common/Estados";
import { tiempoRelativo, fechaCorta } from "@/lib/fechas";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { aLista, mapaGrupoPorEstudiante } from "@/lib/listas";
import { mensajeDeError } from "@/lib/utils";
import type { Alerta, Estudiante, Grupo } from "@/types";

type AlertType = "declining" | "low_grade" | "attendance" | "critical";
type AlertStatus = "active" | "reviewed" | "resolved";

interface AlertView {
  id: string;
  student: string;
  group: string;
  type: AlertType;
  status: AlertStatus;
  message: string;
  detail: string;
  date: string;
  fecha: string;
  priority: string;
}

// Un solo color de alerta (frambuesa) para el ícono; el resto de etiquetas usa tonos que no
// compiten entre sí: antes cada tarjeta tenía tres rojos (ícono, estado y prioridad).
const typeConfig: Record<AlertType, { icon: typeof AlertTriangle; label: string; fondo: string }> = {
  critical: { icon: AlertTriangle, label: "Crítico", fondo: "bg-nivel-alerta text-nivel-alerta-fg" },
  low_grade: { icon: TrendingDown, label: "Calificación baja", fondo: "bg-nivel-alerta text-nivel-alerta-fg" },
  attendance: { icon: Clock, label: "Asistencia", fondo: "bg-mantequilla text-nivel-observar-fg" },
  declining: { icon: TrendingDown, label: "Tendencia", fondo: "bg-durazno text-nivel-reprobado-fg" },
};

const statusConfig: Record<AlertStatus, { label: string; tono: Tono }> = {
  active: { label: "Activa", tono: "alerta" },
  reviewed: { label: "En revisión", tono: "observar" },
  resolved: { label: "Resuelta", tono: "excelente" },
};

const prioridadTono: Record<string, Tono> = { alta: "reprobado", media: "observar", baja: "sin" };

const normalizeStatus = (status: string): AlertStatus => {
  if (status === "Pendiente") return "active";
  if (status === "Revisada") return "reviewed";
  if (status === "Resuelta") return "resolved";
  return status as AlertStatus;
};

// El backend guarda `tipo` como texto libre (ej. "Bajo Rendimiento", "Inasistencia",
// "Seguimiento", o "low_grade" generado automáticamente), no como un enum cerrado.
// Se infiere la categoría visual por palabras clave en vez de comparar el string exacto.
const inferType = (tipo: string): AlertType => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("crítico") || t.includes("critico") || t.includes("critical")) return "critical";
  if (t.includes("bajo rendimiento") || t.includes("low_grade") || t.includes("calificaci")) return "low_grade";
  if (t.includes("inasistencia") || t.includes("attendance") || t.includes("asistencia")) return "attendance";
  return "declining";
};

const priorityByType: Record<AlertType, string> = {
  critical: "alta",
  low_grade: "alta",
  attendance: "media",
  declining: "baja",
};

const claseSelect =
  "h-11 rounded-xl border border-input bg-card px-3 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

const Alertas = () => {
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  // El filtro de estado puede llegar en la URL (?estado=resolved), por ejemplo desde el
  // enlace «Ver alertas resueltas» del Dashboard. Solo se aceptan los estados conocidos.
  const [searchParams] = useSearchParams();
  const estadoInicial = searchParams.get("estado");
  const [filterStatus, setFilterStatus] = useState<string>(
    estadoInicial && ["active", "reviewed", "resolved"].includes(estadoInicial) ? estadoInicial : "all"
  );
  const [selectedAlert, setSelectedAlert] = useState<AlertView | null>(null);
  const [actualizando, setActualizando] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(false);
    try {
      const [data, estudiantes, grupos] = await Promise.all([
        api.get("/alertas"),
        api.get("/estudiantes"),
        api.get("/grupos"),
      ]);
      const list = aLista<Alerta>(data);
      // Grupo del estudiante (antes no se mostraba; H-15).
      const grupoDe = mapaGrupoPorEstudiante(aLista<Estudiante>(estudiantes), aLista<Grupo>(grupos));

      const mapped: AlertView[] = list.map((a) => {
        const type = inferType(a.tipo);
        return {
          id: String(a.id),
          student: [a.estudiante_nombre, a.estudiante_apellido].filter(Boolean).join(" ") || "Estudiante",
          group: grupoDe.get(String(a.estudiante_id)) || "",
          type,
          status: normalizeStatus(a.estado),
          message: a.mensaje,
          detail: a.tipo || "",
          date: tiempoRelativo(a.fecha_creacion),
          fecha: a.fecha_creacion || "",
          priority: priorityByType[type],
        };
      });
      setAlerts(mapped);
    } catch (err) {
      toast.error("No pudimos cargar las alertas. Revisa tu conexión.");
      setError(true);
      setAlerts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const updateStatus = async (id: string, status: AlertStatus) => {
    setActualizando(true);
    try {
      await api.put(`/alertas/${id}/estado`, { estado: status });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      setSelectedAlert(null);
      toast.success(status === "resolved" ? "Alerta resuelta. Se conserva en el historial." : "Alerta marcada como en revisión");
    } catch (err) {
      toast.error(mensajeDeError(err, "No pudimos actualizar la alerta. Inténtalo de nuevo."));
    } finally {
      setActualizando(false);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const activeCount = alerts.filter(a => a.status === "active").length;
  const reviewedCount = alerts.filter(a => a.status === "reviewed").length;
  const resolvedCount = alerts.filter(a => a.status === "resolved").length;

  if (loading) {
    return <EstadoCargando texto="Cargando alertas…" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Seguimiento" title="Alertas tempranas" description="Revisa señales y registra el acompañamiento de cada caso" icon={Bell} tono="bg-nivel-alerta" />

      <div className="grid grid-cols-3 gap-3">
        {([
          [Bell, activeCount, "Alertas activas", "bg-nivel-alerta text-nivel-alerta-fg", "active"],
          [Eye, reviewedCount, "En revisión", "bg-mantequilla", "reviewed"],
          [CheckCircle, resolvedCount, "Resueltas", "bg-menta", "resolved"],
        ] as const).map(([Icono, valor, rotulo, tono, estado]) => (
          <button
            key={rotulo}
            type="button"
            onClick={() => setFilterStatus(filterStatus === estado ? "all" : estado)}
            aria-pressed={filterStatus === estado}
            className={`flex flex-col items-start gap-2 rounded-2xl border bg-card p-3.5 text-left transition-colors hover:bg-secondary/60 sm:flex-row sm:items-center sm:gap-3.5 sm:p-4 ${filterStatus === estado ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
          >
            <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl sm:h-11 sm:w-11 ${tono}`}><Icono className="h-5 w-5" aria-hidden="true" /></span>
            <span><span className="block font-display text-2xl font-bold leading-none tabular-nums text-card-foreground">{valor}</span><span className="mt-1 block text-[13px] text-muted-foreground">{rotulo}</span></span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Filter className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden="true" />
        <label className="sr-only" htmlFor="filtro-tipo">Tipo de alerta</label>
        <select id="filtro-tipo" value={filterType} onChange={(e) => setFilterType(e.target.value)} className={claseSelect}>
          <option value="all">Todos los tipos</option>
          <option value="critical">Crítico</option>
          <option value="declining">Tendencia</option>
          <option value="low_grade">Calificación baja</option>
          <option value="attendance">Asistencia</option>
        </select>
        <label className="sr-only" htmlFor="filtro-estado">Estado de la alerta</label>
        <select id="filtro-estado" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={claseSelect}>
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="reviewed">En revisión</option>
          <option value="resolved">Resueltas</option>
        </select>
        <span className="ml-auto text-sm font-medium text-muted-foreground" aria-live="polite">{filtered.length} alertas</span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-card"><EstadoError onReintentar={fetchAlerts} /></div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((alert) => {
            const config = typeConfig[alert.type] || typeConfig.declining;
            const sConfig = statusConfig[alert.status] || statusConfig.active;
            const Icon = config.icon;
            return (
              <li key={alert.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedAlert(alert)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedAlert(alert); } }}
                  className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${config.fondo}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="mr-1 text-[15px] font-semibold text-card-foreground">{alert.student}</p>
                      {alert.group && <EstadoBadge tono="grupo">{alert.group}</EstadoBadge>}
                      <EstadoBadge tono={sConfig.tono}>{sConfig.label}</EstadoBadge>
                      <EstadoBadge tono={prioridadTono[alert.priority] || "sin"} icono={false}>Prioridad {alert.priority}</EstadoBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <span className="flex-none whitespace-nowrap text-xs text-muted-foreground">{alert.date}</span>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-border bg-card">
              {alerts.length === 0 ? (
                <EstadoVacio titulo="No hay alertas registradas" descripcion="Cuando un estudiante tenga un promedio por debajo de 3.0, la alerta aparecerá aquí." />
              ) : (
                <EstadoVacio conMascota={false} titulo="No hay alertas con estos filtros" descripcion="Cambia el tipo o el estado para ver otras alertas." />
              )}
            </li>
          )}
        </ul>
      )}

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 font-display text-xl">
              {selectedAlert && (() => {
                const c = typeConfig[selectedAlert.type] || typeConfig.declining;
                const Icon = c.icon;
                return <span className={`grid h-9 w-9 place-items-center rounded-xl ${c.fondo}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>;
              })()}
              Detalle de la alerta
            </DialogTitle>
            <DialogDescription>Revisa el caso y registra el seguimiento. Resolver una alerta no la borra: queda en el historial.</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-card-foreground">{selectedAlert.student}</span>
                {selectedAlert.group && <EstadoBadge tono="grupo"><Users className="h-3.5 w-3.5" aria-hidden="true" />{selectedAlert.group}</EstadoBadge>}
              </div>
              <div className="flex flex-wrap gap-2">
                <EstadoBadge tono="sin" icono={false}>{typeConfig[selectedAlert.type]?.label}</EstadoBadge>
                <EstadoBadge tono={statusConfig[selectedAlert.status]?.tono || "alerta"}>{statusConfig[selectedAlert.status]?.label}</EstadoBadge>
                <EstadoBadge tono={prioridadTono[selectedAlert.priority] || "sin"} icono={false}>Prioridad {selectedAlert.priority}</EstadoBadge>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-[15px] leading-relaxed text-card-foreground">{selectedAlert.message || selectedAlert.detail}</p>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Creada: {fechaCorta(selectedAlert.fecha)} ({selectedAlert.date.toLowerCase()})
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedAlert.status === "active" && (
                  <Button variant="outline" className="rounded-xl" disabled={actualizando} onClick={() => updateStatus(selectedAlert.id, "reviewed")}><Eye className="mr-1.5 h-4 w-4" /> Marcar en revisión</Button>
                )}
                {selectedAlert.status !== "resolved" && (
                  <Button className="rounded-xl" disabled={actualizando} onClick={() => updateStatus(selectedAlert.id, "resolved")}><CheckCircle className="mr-1.5 h-4 w-4" /> Resolver</Button>
                )}
                {selectedAlert.status === "resolved" && <p className="text-sm text-muted-foreground">Esta alerta ya está resuelta.</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alertas;
