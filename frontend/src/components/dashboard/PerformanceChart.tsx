import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, LabelList } from "recharts";
import { useRecurso } from "@/hooks/useRecurso";
import { useUserRole } from "@/hooks/useUserRole";
import { Materia, Calificacion } from "../../types";
import { nivelPromedio, formatoEscala5, type NivelPromedio } from "@/lib/notas";
import { useIsMobile } from "@/hooks/use-mobile";
import { EstadoCargando, EstadoVacio, EstadoError } from "@/components/common/Estados";

interface MateriaRendimiento {
  subject: string;
  promedio: number;
}

export const colorBarra: Record<NivelPromedio, string> = {
  excelente: "hsl(var(--barra-excelente))",
  alto: "hsl(var(--barra-alto))",
  observar: "hsl(var(--barra-observar))",
  bajo: "hsl(var(--barra-bajo))",
};

/** Leyenda compartida de las gráficas de promedio. */
export const LeyendaPromedios = () => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
    <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm" style={{ background: colorBarra.excelente }} />4.5 – 5.0</span>
    <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm" style={{ background: colorBarra.alto }} />4.0 – 4.4</span>
    <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm" style={{ background: colorBarra.observar }} />3.5 – 3.9 (observar)</span>
    <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm" style={{ background: colorBarra.bajo }} />&lt; 3.5</span>
    <span className="inline-flex items-center gap-1.5"><i className="h-3.5 w-0 border-l-2 border-dashed border-nivel-alerta-fg" />3.0 · alerta</span>
    <span className="inline-flex items-center gap-1.5"><i className="h-3.5 w-0 border-l-2 border-dashed border-foreground" />3.5 · aprobación</span>
  </div>
);

export const PerformanceChart = () => {
  const { isAdmin } = useUserRole();
  const isMobile = useIsMobile();
  // Listas compartidas con el resto del Dashboard (una sola petición por recurso).
  const qMaterias = useRecurso<Materia>("/materias");
  const qCal = useRecurso<Calificacion>("/calificaciones");
  const loading = qMaterias.isLoading || qCal.isLoading;
  const error = qMaterias.isError || qCal.isError;
  const fetchData = () => { qMaterias.refetch(); qCal.refetch(); };

  // Mismo cálculo de siempre: promedio de las notas (0.0 – 5.0) × 20, por materia.
  const data = useMemo<MateriaRendimiento[]>(() => {
    const materiaCalMap = new Map<number | string, number[]>();
    (qCal.data || []).forEach((c) => {
      const valorNota = c.nota;
      const materiaId = c.materia_id;
      if (materiaId !== undefined && valorNota !== undefined) {
        if (!materiaCalMap.has(materiaId)) materiaCalMap.set(materiaId, []);
        materiaCalMap.get(materiaId)!.push(Number(valorNota));
      }
    });
    return (qMaterias.data || [])
      .map((m) => {
        const cals = materiaCalMap.get(m.id) || [];
        const prom = cals.length > 0 ? Math.round((cals.reduce((s, v) => s + v, 0) / cals.length) * 20) : 0;
        return { subject: m.nombre, promedio: prom };
      })
      .filter((m) => m.promedio > 0);
  }, [qMaterias.data, qCal.data]);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 animate-fade-in" aria-labelledby="titulo-rendimiento">
      <div className="mb-3">
        <h3 id="titulo-rendimiento" className="text-lg font-semibold text-card-foreground">Rendimiento por materia</h3>
        <p className="text-[13px] text-muted-foreground">{isAdmin ? "Promedio de todas las calificaciones registradas" : "Promedio de las calificaciones de tus materias en tus grupos"}, en % y en la escala 0.0 – 5.0</p>
      </div>
      {loading ? (
        <EstadoCargando texto="Calculando promedios…" className="h-[260px]" />
      ) : error ? (
        <EstadoError titulo="No pudimos cargar la gráfica" onReintentar={fetchData} />
      ) : data.length === 0 ? (
        <EstadoVacio titulo="Aún no hay calificaciones" descripcion="La gráfica aparecerá cuando se registren notas." />
      ) : (
        <>
          <div className="min-h-0 flex-1" style={{ minHeight: Math.max(220, data.length * 52 + 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: isMobile ? 64 : 84, left: 0, bottom: 4 }} barCategoryGap="28%">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tickFormatter={(v: number) => formatoEscala5(v)}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={isMobile ? 104 : 150}
                  tick={{ fontSize: isMobile ? 12 : 13, fill: "hsl(var(--foreground))", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 13 }}
                  formatter={(value: number) => [`${formatoEscala5(value)} de 5.0 · ${value} %`, "Promedio"]}
                />
                <ReferenceLine x={60} stroke="hsl(var(--nivel-alerta-fg))" strokeDasharray="5 4" strokeWidth={2} />
                <ReferenceLine x={70} stroke="hsl(var(--foreground))" strokeDasharray="5 4" strokeWidth={2} />
                <Bar dataKey="promedio" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={false}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={colorBarra[nivelPromedio(entry.promedio)]} />
                  ))}
                  <LabelList
                    dataKey="promedio"
                    position="right"
                    formatter={(v: number) => `${formatoEscala5(v)} · ${v} %`}
                    style={{ fontSize: 13, fontWeight: 700, fill: "hsl(var(--foreground))" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3"><LeyendaPromedios /></div>
        </>
      )}
    </section>
  );
};

export default PerformanceChart;
