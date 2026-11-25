import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRecurso } from "@/hooks/useRecurso";
import type { Calificacion, Estudiante } from "@/types";
import { aPorcentaje, formatoEscala5, nivelSeguimiento } from "@/lib/notas";
import EstadoBadge, { type Tono } from "@/components/common/EstadoBadge";
import { EstadoError, EstadoVacio, FilasCargando } from "@/components/common/Estados";

interface Asignacion {
  id: number;
  materia_id: number;
  grupo_id: number;
  materia_nombre: string;
  grupo_nombre: string;
}

interface FilaAsignacion {
  id: number;
  materia: string;
  grupo: string;
  estudiantes: number;
  notas: number;
  /** Promedio de ESTA materia en ESTE grupo, en % (nota × 20); null si aún no hay notas. */
  promedio: number | null;
  /** Promedio sin redondear: con él se clasifica el nivel (H-01). */
  exacto: number | null;
}

// Mismos cortes que el resto del panel: < 70 % en riesgo, 70 – 79 % observar, el resto buen nivel.
const NIVEL: Record<ReturnType<typeof nivelSeguimiento>, { texto: string; tono: Tono }> = {
  risk: { texto: "En riesgo", tono: "reprobado" },
  watch: { texto: "Observar", tono: "observar" },
  good: { texto: "Buen nivel", tono: "excelente" },
};

/**
 * Dashboard del docente: una fila por cada materia que dicta en cada grupo (tabla
 * `asignaciones`). El promedio se calcula por materia y grupo, sin mezclar materias.
 * La API ya entrega solo las asignaciones, estudiantes y notas del docente (H-08).
 */
const MisAsignaciones = () => {
  const qAsig = useRecurso<Asignacion>("/asignaciones");
  const qEst = useRecurso<Estudiante>("/estudiantes");
  const qCal = useRecurso<Calificacion>("/calificaciones");
  const cargando = qAsig.isLoading || qEst.isLoading || qCal.isLoading;
  const error = qAsig.isError || qEst.isError || qCal.isError;

  const filas = useMemo<FilaAsignacion[]>(() => {
    const estudiantes = qEst.data || [];
    const grupoDe = new Map(estudiantes.map((e) => [String(e.id), String(e.grupo_id)]));
    return (qAsig.data || []).map((a) => {
      const notas = (qCal.data || [])
        .filter((c) => String(c.materia_id) === String(a.materia_id) && grupoDe.get(String(c.estudiante_id)) === String(a.grupo_id))
        .map((c) => aPorcentaje(Number(c.nota)));
      return {
        id: a.id,
        materia: a.materia_nombre,
        grupo: a.grupo_nombre,
        estudiantes: estudiantes.filter((e) => String(e.grupo_id) === String(a.grupo_id) && e.activo !== false).length,
        notas: notas.length,
        promedio: notas.length ? Math.round(notas.reduce((s, v) => s + v, 0) / notas.length) : null,
        exacto: notas.length ? notas.reduce((s, v) => s + v, 0) / notas.length : null,
      };
    });
  }, [qAsig.data, qEst.data, qCal.data]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 animate-fade-in" aria-labelledby="titulo-asignaciones">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="titulo-asignaciones" className="text-lg font-semibold text-card-foreground">Mis asignaciones</h3>
          <p className="text-[13px] text-muted-foreground">Cada materia que dictas en cada grupo, con el promedio de esa materia en ese grupo</p>
        </div>
        <Link to="/app/calificaciones" className="inline-flex items-center gap-1 text-sm font-semibold text-azul hover:underline">
          Registrar notas <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {cargando ? (
        <FilasCargando filas={3} />
      ) : error ? (
        <EstadoError titulo="No pudimos cargar tus asignaciones" onReintentar={() => { qAsig.refetch(); qEst.refetch(); qCal.refetch(); }} />
      ) : filas.length === 0 ? (
        <EstadoVacio titulo="Aún no tienes asignaciones" descripcion="Cuando el administrador te asigne una materia en un grupo, la verás aquí." />
      ) : (
        <ul className="mt-4 divide-y divide-border" aria-label="Materias y grupos asignados">
          {filas.map((f) => {
            const nivel = f.exacto === null ? null : NIVEL[nivelSeguimiento(f.exacto)];
            return (
              <li key={f.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_4.5rem_12rem]">
                <p className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-card-foreground">{f.materia}</span>
                  <span className="text-[13px] text-muted-foreground sm:hidden">{f.grupo} · {f.estudiantes} estudiantes</span>
                </p>
                <p className="hidden text-sm text-muted-foreground sm:block">{f.grupo} · {f.estudiantes} estudiantes</p>
                <p className="hidden text-right text-xs text-muted-foreground sm:block tabular-nums">{f.notas} {f.notas === 1 ? "nota" : "notas"}</p>
                <p className="flex items-center justify-end gap-2 tabular-nums">
                  {f.promedio === null ? (
                    <span className="text-sm text-muted-foreground">Sin notas</span>
                  ) : (
                    <>
                      <span className="text-[15px] font-bold text-card-foreground">{formatoEscala5(f.promedio)}</span>
                      <EstadoBadge tono={nivel!.tono}>{nivel!.texto} · {f.promedio} %</EstadoBadge>
                    </>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default MisAsignaciones;
