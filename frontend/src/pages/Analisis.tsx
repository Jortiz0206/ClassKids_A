import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Users, AlertTriangle, Target } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { colorBarra, LeyendaPromedios } from "@/components/dashboard/PerformanceChart";
import EstadoBadge from "@/components/common/EstadoBadge";
import { EstadoCargando, EstadoVacio } from "@/components/common/Estados";
import { formatoEscala5, nivelPromedio } from "@/lib/notas";
import { ReferenceLine, LabelList } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { api } from "@/api/client";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { aLista } from "@/lib/listas";
import { mensajeDeError } from "@/lib/utils";
import type { Actividad, Calificacion, Estudiante, Grupo, Materia } from "@/types";

interface GrupoRendimiento { grupo: string; promedio: number; estudiantes: number; }
interface TendenciaItem { mes: string; promedio: number; }
interface DistribucionItem { name: string; value: number; color: string; }
interface EstudianteRiesgo {
  nombre: string; apellido: string; grupo: string; promedio: number;
  tendencia: string;
}
interface TipoRendimiento { tipo: string; promedio: number; }

const Analisis = () => {
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [rendimientoPorGrupo, setRendimientoPorGrupo] = useState<GrupoRendimiento[]>([]);
  const [tendenciaMensual, setTendenciaMensual] = useState<TendenciaItem[]>([]);
  const [distribucionRiesgo, setDistribucionRiesgo] = useState<DistribucionItem[]>([]);
  const [estudiantesEnRiesgo, setEstudiantesEnRiesgo] = useState<EstudianteRiesgo[]>([]);
  const [rendimientoPorTipo, setRendimientoPorTipo] = useState<TipoRendimiento[]>([]);
  const [promedioGeneral, setPromedioGeneral] = useState(0);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [totalEnRiesgo, setTotalEnRiesgo] = useState(0);
  const [mejoraMensual, setMejoraMensual] = useState(0);
  // Filtro por materia: cada indicador se puede leer para una sola materia, sin mezclarla con otras.
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materia, setMateria] = useState("todas");

  useEffect(() => {
    fetchAll(materia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materia]);

  const fetchAll = async (materiaFiltro: string) => {
    if (materias.length === 0) setLoading(true); // al cambiar de materia no se vacía la pantalla
    try {
      const [gruposRes, estudiantesRes, calificacionesRes, actividadesRes, materiasRes] = await Promise.all([
        api.get("/grupos"),
        api.get("/estudiantes"),
        api.get("/calificaciones"),
        api.get("/actividades"),
        api.get("/materias"),
      ]);
      setMaterias(aLista<Materia>(materiasRes));

      const grupos = aLista<Grupo>(gruposRes);
      const estudiantes = aLista<Estudiante>(estudiantesRes);
      const calificaciones = aLista<Calificacion>(calificacionesRes)
        .filter((c) => materiaFiltro === "todas" || String(c.materia_id) === materiaFiltro);
      const actividades = aLista<Actividad>(actividadesRes);

      setTotalEstudiantes(estudiantes.length);

      const estGrupoMap = new Map<string, string>(estudiantes.map((e) => [String(e.id), String(e.grupo_id)]));
      const grupoNameMap = new Map<string, string>(grupos.map((g) => [String(g.id), String(g.nombre)]));
      const actTipoMap = new Map<string, string>(actividades.map((a) => [String(a.id), String(a.tipo || "tarea")]));

      // --- Rendimiento por Grupo ---
      const grupoCalMap = new Map<string, number[]>();
      const grupoEstCount = new Map<string, number>();
      estudiantes.forEach((e) => {
        const gId = String(e.grupo_id);
        grupoEstCount.set(gId, (grupoEstCount.get(gId) || 0) + 1);
      });
      calificaciones.forEach((c) => {
        const gId = estGrupoMap.get(String(c.estudiante_id));
        if (gId) {
          if (!grupoCalMap.has(gId)) grupoCalMap.set(gId, []);
          grupoCalMap.get(gId)!.push(Number(c.nota || 0) * 20);
        }
      });
      const rpg: GrupoRendimiento[] = grupos.map((g) => {
        const cals = grupoCalMap.get(String(g.id)) || [];
        const prom = cals.length > 0 ? Math.round(cals.reduce((s, v) => s + v, 0) / cals.length) : 0;
        return { grupo: String(g.nombre || ""), promedio: prom, estudiantes: grupoEstCount.get(String(g.id)) || 0 };
      }).sort((a, b) => a.grupo.localeCompare(b.grupo));
      setRendimientoPorGrupo(rpg);

      // --- Promedio general ---
      const allCals = calificaciones.map((c) => Number(c.nota || 0) * 20);
      const promGen = allCals.length > 0 ? Math.round((allCals.reduce((s, v) => s + v, 0) / allCals.length) * 10) / 10 : 0;
      setPromedioGeneral(promGen);

      // --- Distribución de rendimiento por estudiante ---
      // Se guarda también el periodo de cada nota para poder calcular una tendencia
      // real (no existe una columna `tendencia` en el backend).
      const estCalMap = new Map<string, { valor: number; periodo: number }[]>();
      calificaciones.forEach((c) => {
        const estId = String(c.estudiante_id);
        if (!estCalMap.has(estId)) estCalMap.set(estId, []);
        estCalMap.get(estId)!.push({
          valor: Number(c.nota || 0) * 20,
          periodo: Number(c.periodo || 1),
        });
      });
      const tendenciaEstudiante = (estId: string): string => {
        const cals = estCalMap.get(estId) || [];
        const periodos = Array.from(new Set(cals.map((c) => c.periodo))).sort((a, b) => a - b);
        if (periodos.length < 2) return "estable";
        const avgFor = (p: number) => {
          const vals = cals.filter((c) => c.periodo === p).map((c) => c.valor);
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        };
        const primero = avgFor(periodos[0]);
        const ultimo = avgFor(periodos[periodos.length - 1]);
        if (primero === null || ultimo === null) return "estable";
        if (ultimo > primero + 2) return "up";
        if (ultimo < primero - 2) return "down";
        return "estable";
      };
      let excelente = 0, bueno = 0, regular = 0, enRiesgo = 0;
      estudiantes.forEach((e) => {
        const cals = (estCalMap.get(String(e.id)) || []).map((c) => c.valor);
        const prom = cals.length > 0 ? cals.reduce((s, v) => s + v, 0) / cals.length : -1;
        if (prom < 0) return;
        if (prom >= 90) excelente++;
        else if (prom >= 80) bueno++;
        else if (prom >= 70) regular++;
        else enRiesgo++;
      });
      setDistribucionRiesgo([
        { name: "Excelente (≥ 90 %)", value: excelente, color: colorBarra.excelente },
        { name: "Bueno (80 – 89 %)", value: bueno, color: colorBarra.alto },
        { name: "Regular (70 – 79 %)", value: regular, color: colorBarra.observar },
        { name: "En riesgo (< 70 %)", value: enRiesgo, color: colorBarra.bajo },
      ]);
      setTotalEnRiesgo(enRiesgo);

      // --- Estudiantes en riesgo ---
      const riesgoList: EstudianteRiesgo[] = [];
      estudiantes.forEach((e) => {
        const cals = (estCalMap.get(String(e.id)) || []).map((c) => c.valor);
        const prom = cals.length > 0 ? Math.round(cals.reduce((s, v) => s + v, 0) / cals.length) : -1;
        if (prom >= 0 && prom < 70) {
          riesgoList.push({
            nombre: String(e.nombre || ""),
            apellido: String(e.apellido || ""),
            grupo: grupoNameMap.get(String(e.grupo_id)) || "",
            promedio: prom,
            tendencia: tendenciaEstudiante(String(e.id)),
          });
        }
      });
      riesgoList.sort((a, b) => a.promedio - b.promedio);
      setEstudiantesEnRiesgo(riesgoList);

      // --- Tendencia mensual ---
      const mesesMap = new Map<string, number[]>();
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      calificaciones.forEach((c) => {
        const dateVal = c.fecha_registro;
        if (!dateVal) return;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        if (!mesesMap.has(key)) mesesMap.set(key, []);
        mesesMap.get(key)!.push(Number(c.nota || 0) * 20);
      });
      const sortedMonths = Array.from(mesesMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      const tend: TendenciaItem[] = sortedMonths.map(([key, vals]) => {
        const d = new Date(key + "-01");
        return {
          mes: monthNames[d.getMonth()] + " " + d.getFullYear().toString().slice(2),
          promedio: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
        };
      });
      setTendenciaMensual(tend);

      if (tend.length >= 2) {
        const last = tend[tend.length - 1].promedio;
        const prev = tend[tend.length - 2].promedio;
        setMejoraMensual(Math.round((last - prev) * 10) / 10);
      }

      // --- Rendimiento por tipo de actividad ---
      const tipoCalMap = new Map<string, number[]>();
      calificaciones.forEach((c) => {
        const tipo = actTipoMap.get(String(c.actividad_id));
        if (tipo) {
          if (!tipoCalMap.has(tipo)) tipoCalMap.set(tipo, []);
          tipoCalMap.get(tipo)!.push(Number(c.nota || 0) * 20);
        }
      });
      const rpt: TipoRendimiento[] = Array.from(tipoCalMap.entries()).map(([tipo, vals]) => ({
        tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        promedio: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
      })).sort((a, b) => b.promedio - a.promedio);
      setRendimientoPorTipo(rpt);

    } catch (error) {
      toast.error(mensajeDeError(error, "Error al cargar los datos de análisis"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <EstadoCargando texto="Calculando el análisis…" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Lectura pedagógica" title="Análisis de rendimiento" description="Promedios en % y en la escala 0.0 – 5.0 para priorizar el acompañamiento" icon={BarChart3} tono="bg-cielo"
        actions={materias.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-materia" className="text-sm font-semibold text-muted-foreground">Materia</label>
            <Select value={materia} onValueChange={setMateria}>
              <SelectTrigger id="filtro-materia" className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las materias</SelectItem>
                {materias.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Target} label="Promedio general" value={`${promedioGeneral}%`} hint={`${formatoEscala5(Number(promedioGeneral))} de 5.0`} tono="bg-menta" />
        <StatCard icon={Users} label="Estudiantes" value={totalEstudiantes} hint="registrados" tono="bg-cielo" />
        <StatCard icon={AlertTriangle} label="En riesgo académico" value={totalEnRiesgo} hint="promedio menor que 70 %" tono="bg-durazno" />
        <StatCard
          icon={mejoraMensual >= 0 ? TrendingUp : TrendingDown}
          label="Frente al mes anterior"
          value={`${mejoraMensual >= 0 ? "+" : ""}${mejoraMensual}%`}
          hint={mejoraMensual >= 0 ? "sube o se mantiene" : "baja"}
          tono={mejoraMensual >= 0 ? "bg-menta" : "bg-durazno"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" aria-hidden="true" /> Rendimiento por grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rendimientoPorGrupo.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={rendimientoPorGrupo} barSize={28} margin={{ top: 22, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="grupo" interval={0} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.replace("Grado ", "")} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--secondary))" }} contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 13 }}
                      formatter={(value, _nombre, props) => [`${value} % · ${formatoEscala5(Number(value))} de 5.0 (${(props.payload as GrupoRendimiento).estudiantes} est.)`, "Promedio"]} />
                    <ReferenceLine y={60} stroke="hsl(var(--nivel-alerta-fg))" strokeDasharray="5 4" strokeWidth={2} />
                    <ReferenceLine y={70} stroke="hsl(var(--foreground))" strokeDasharray="5 4" strokeWidth={2} />
                    <Bar dataKey="promedio" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {rendimientoPorGrupo.map((entry, index) => (
                        <Cell key={index} fill={colorBarra[nivelPromedio(entry.promedio)]} />
                      ))}
                      {!isMobile && <LabelList dataKey="promedio" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--foreground))" }} />}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2"><LeyendaPromedios /></div>
              </>
            ) : (
              <EstadoVacio titulo="Sin datos de calificaciones" descripcion="La gráfica aparecerá cuando se registren notas." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribución de rendimiento</CardTitle>
            <p className="text-[13px] text-muted-foreground">Estudiantes por promedio</p>
          </CardHeader>
          <CardContent>
            {distribucionRiesgo.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={distribucionRiesgo} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {distribucionRiesgo.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "12px", color: "hsl(var(--foreground))" }} />
                  <Tooltip formatter={(value) => [`${value} estudiantes`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EstadoVacio conMascota={false} titulo="Sin datos" descripcion="Aún no hay promedios para repartir." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" /> Tendencia mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tendenciaMensual.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={tendenciaMensual} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 13 }}
                    formatter={(value) => [`${value} % · ${formatoEscala5(Number(value))} de 5.0`, "Promedio"]} />
                  <ReferenceLine y={60} stroke="hsl(var(--nivel-alerta-fg))" strokeDasharray="5 4" strokeWidth={1.5} />
                  <ReferenceLine y={70} stroke="hsl(var(--foreground))" strokeDasharray="5 4" strokeWidth={1.5} />
                  <Line type="monotone" dataKey="promedio" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(var(--primary))" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EstadoVacio conMascota={false} titulo="Sin datos históricos" descripcion="La tendencia aparece cuando hay notas en más de un mes." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Rendimiento por tipo de actividad</CardTitle>
          </CardHeader>
          <CardContent>
            {rendimientoPorTipo.length > 0 ? (
              <div className="space-y-4 mt-2">
                {rendimientoPorTipo.map((item) => (
                  <div key={item.tipo}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-card-foreground">{item.tipo}</span>
                      <span className="text-sm font-bold tabular-nums text-card-foreground">{item.promedio}% <span className="font-semibold text-muted-foreground">· {formatoEscala5(item.promedio)}</span></span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${item.tipo}: ${item.promedio}%`}>
                      <div className="h-full rounded-full" style={{ width: `${item.promedio}%`, background: colorBarra[nivelPromedio(item.promedio)] }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVacio conMascota={false} titulo="Sin datos" descripcion="Aún no hay notas por tipo de actividad." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estudiantes en Riesgo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Estudiantes en riesgo académico
          </CardTitle>
          <p className="text-[13px] text-muted-foreground">Promedio menor que 70 % (3.5). «Crítico»: menor que 60 % (3.0), el umbral de alerta.</p>
        </CardHeader>
        <CardContent>
          {estudiantesEnRiesgo.length > 0 ? (
            <div className="max-h-[560px] overflow-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="sticky top-0 z-[1] border-b border-border bg-card">
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Estudiante</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Grupo</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Promedio</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Tendencia</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesEnRiesgo.map((est, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-card-foreground">{est.nombre} {est.apellido}</td>
                      <td className="py-3 px-3">
                        <EstadoBadge tono="grupo">{est.grupo}</EstadoBadge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold tabular-nums text-card-foreground">{est.promedio}% <span className="font-semibold text-muted-foreground">· {formatoEscala5(est.promedio)}</span></span>
                      </td>
                      <td className="py-3 px-3">
                        {est.tendencia === "down" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-nivel-reprobado-fg"><TrendingDown className="h-3.5 w-3.5" aria-hidden="true" /> Bajando</span>
                        ) : est.tendencia === "up" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-nivel-excelente-fg"><TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Subiendo</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Estable</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <EstadoBadge tono={est.promedio < 60 ? "alerta" : "reprobado"}>{est.promedio < 60 ? "Crítico" : "En riesgo"}</EstadoBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EstadoVacio titulo="No hay estudiantes en riesgo" descripcion="Todos los promedios están en 70 % o más. ¡Buen trabajo del equipo!" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analisis;