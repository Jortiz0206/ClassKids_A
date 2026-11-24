import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecurso } from "@/hooks/useRecurso";
import { Estudiante, Grupo, Calificacion } from "../../types";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { nivelSeguimiento, formatoEscala5, iniciales, promedioExacto } from "@/lib/notas";
import EstadoBadge, { type Tono } from "@/components/common/EstadoBadge";
import { FilasCargando, EstadoVacio } from "@/components/common/Estados";

interface StudentView {
  id: number | string;
  name: string;
  group: string;
  average: number;
  status: "risk" | "watch" | "good";
  trend: string;
}

// Regla existente: < 70 % en riesgo, 70 – 79 % observar, el resto buen nivel.
const statusConfig: Record<StudentView["status"], { label: string; tono: Tono }> = {
  risk: { label: "En riesgo", tono: "reprobado" },
  watch: { label: "Observar", tono: "observar" },
  good: { label: "Buen nivel", tono: "excelente" },
};

const trendConfig = {
  up: { icon: TrendingUp, label: "Mejora" },
  down: { icon: TrendingDown, label: "Baja" },
  stable: { icon: Minus, label: "Estable" },
} as const;

export const RecentStudents = () => {
  const navigate = useNavigate();
  // Listas compartidas con el resto del Dashboard (una sola petición por recurso).
  const qEst = useRecurso<Estudiante>("/estudiantes");
  const qGrupos = useRecurso<Grupo>("/grupos");
  const qCal = useRecurso<Calificacion>("/calificaciones");
  const loading = qEst.isLoading || qGrupos.isLoading || qCal.isLoading;

  // Mismo cálculo que antes (promedio × 20, estado y tendencia entre periodos).
  const students = useMemo<StudentView[]>(() => {
    const estudiantes = qEst.data || [];
    const grupos = qGrupos.data || [];
    const calificaciones = qCal.data || [];
    if (estudiantes.length === 0) return [];
    // Mapa de ID de Grupo -> Nombre del Grupo
    const gruposMap = new Map(grupos.map((g) => [g.id, g.nombre]));

    // Mapa de ID de Estudiante -> Lista de Calificaciones (nota + periodo)
    const calMap = new Map<number | string, { nota: number; periodo: number }[]>();
    calificaciones.forEach((c) => {
      const estId = c.estudiante_id;
      if (estId !== undefined && c.nota !== undefined) {
        if (!calMap.has(estId)) calMap.set(estId, []);
        calMap.get(estId)!.push({ nota: Number(c.nota), periodo: Number(c.periodo || 1) });
      }
    });

    // Tomamos los primeros 6 estudiantes
    const recent = estudiantes.slice(0, 6);

    const enriched: StudentView[] = recent.map((e) => {
      const calsList = calMap.get(e.id) || [];
      // H-01: nivel con el promedio exacto; el entero redondeado es solo para mostrar.
      const exacto = promedioExacto(calsList.map((c) => Number(c.nota))) ?? 0;
      const avg = Math.round(exacto);

      const status = nivelSeguimiento(exacto);

      // No existe columna `tendencia` en el backend: se calcula comparando el
      // promedio del primer y el último periodo con calificaciones reales.
      const periodos = Array.from(new Set(calsList.map((c) => c.periodo))).sort((a, b) => a - b);
      let trend = "stable";
      if (periodos.length >= 2) {
        const avgFor = (p: number) => {
          const notas = calsList.filter((c) => c.periodo === p).map((c) => c.nota);
          return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
        };
        const primero = avgFor(periodos[0]);
        const ultimo = avgFor(periodos[periodos.length - 1]);
        if (primero !== null && ultimo !== null) {
          if (ultimo > primero + 0.1) trend = "up";
          else if (ultimo < primero - 0.1) trend = "down";
        }
      }

      return {
        id: e.id,
        name: `${e.nombre} ${e.apellido}`,
        group: e.grupo_id ? gruposMap.get(e.grupo_id) || "" : "",
        average: avg,
        status,
        trend,
      };
    });
    return enriched;
  }, [qEst.data, qGrupos.data, qCal.data]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 animate-fade-in" aria-labelledby="titulo-seguimiento">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="titulo-seguimiento" className="text-lg font-semibold text-card-foreground">Seguimiento de estudiantes</h3>
          <p className="text-[13px] text-muted-foreground">Primeros estudiantes de la lista con su promedio y tendencia entre periodos</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/estudiantes")}
          className="inline-flex items-center gap-1 text-sm font-semibold text-azul hover:underline"
        >
          Ver todos <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {loading ? (
        <FilasCargando filas={4} className="p-0" />
      ) : students.length === 0 ? (
        <EstadoVacio titulo="Sin estudiantes registrados" descripcion="Cuando registres estudiantes, aquí verás su promedio." />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => {
            const config = statusConfig[s.status];
            const tendencia = trendConfig[s.trend as keyof typeof trendConfig] ?? trendConfig.stable;
            const [nombre, ...resto] = s.name.split(" ");
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/app/estudiantes?buscar=${encodeURIComponent(s.name)}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary/60"
                >
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-cielo text-sm font-bold text-nivel-aprobado-fg">
                    {iniciales(nombre, resto.join(" "))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-card-foreground">{s.name}</span>
                    <span className="block text-[13px] text-muted-foreground">{s.group || "Sin grupo"}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 text-sm font-bold tabular-nums text-card-foreground">
                      {s.average > 0 ? `${s.average} %` : "—"}
                      <tendencia.icon className="h-4 w-4 text-muted-foreground" aria-label={tendencia.label} />
                    </span>
                    {s.average > 0 ? (
                      <EstadoBadge tono={config.tono} icono={false}>{config.label} · {formatoEscala5(s.average)}</EstadoBadge>
                    ) : (
                      <EstadoBadge tono="sin" icono={false}>Sin notas</EstadoBadge>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecentStudents;
