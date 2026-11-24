import { useState, useEffect } from "react";
import { Search, Plus, Users, TrendingUp, ChevronRight } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import { colorBarra } from "@/components/dashboard/PerformanceChart";
import EstadoBadge, { type Tono } from "@/components/common/EstadoBadge";
import { EstadoCargando, EstadoVacio } from "@/components/common/Estados";
import { formatoEscala5, nivelPromedio } from "@/lib/notas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/client";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { aLista } from "@/lib/listas";
import type { Actividad, Alerta, Calificacion, Estudiante, Grupo } from "@/types";
import { useUserRole } from "@/hooks/useUserRole";

interface GrupoRow {
  id: string;
  nombre: string;
  grado: string;
  turno: string;
  color: string;
  user_id?: string;
  estudiantesCount?: number;
  actividadesCount?: number;
  alertasCount?: number;
  promedioGeneral?: number;
}

const getPerformanceColor = (promedio: number) => {
  if (promedio >= 90) return "text-nivel-excelente-fg";
  if (promedio >= 80) return "text-nivel-aprobado-fg";
  if (promedio >= 70) return "text-nivel-observar-fg";
  return "text-nivel-reprobado-fg";
};

const getPerformanceLabel = (promedio: number) => {
  if (promedio >= 90) return "Excelente";
  if (promedio >= 80) return "Bueno";
  if (promedio >= 70) return "Regular";
  return "En riesgo";
};

// «Regular» (70 – 79 %) es un promedio aprobado: antes se pintaba en rojo como si fuera malo.
const getPerformanceTono = (promedio: number): Tono => {
  if (promedio >= 90) return "excelente";
  if (promedio >= 80) return "aprobado";
  if (promedio >= 70) return "observar";
  return "reprobado";
};

// Cursos disponibles para el selector de "Nuevo grupo": de 1° a 5°, secciones A y B.
// Reemplaza la digitación libre del nombre/grado por una lista cerrada de valores válidos.
const CURSOS_DISPONIBLES = ["1°", "2°", "3°", "4°", "5°"].flatMap((grado) =>
  ["A", "B"].map((seccion) => ({
    value: `${grado}${seccion}`,
    grado,
    nombre: `Grado ${grado.replace("°", "")}${seccion}`,
  })),
);

// La tabla `grupos` no tiene columna `color`; se deriva un color estable a partir
// del nombre para poder distinguir tarjetas sin depender de un campo inexistente.
const AVATAR_PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
const colorForGrupo = (nombre: string) => {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

const Grupos = () => {
  const { isAdmin } = useUserRole();
  const [grupos, setGrupos] = useState<GrupoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGrado, setFilterGrado] = useState("todos");
  const [filterTurno, setFilterTurno] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCurso, setNewCurso] = useState("");
  const [newTurno, setNewTurno] = useState("");

  const fetchGrupos = async () => {
    setLoading(true);
    try {
      const [gruposRes, estRes, actRes, alertasRes, calsRes] = await Promise.all([
        api.get("/grupos"),
        api.get("/estudiantes"),
        api.get("/actividades"),
        api.get("/alertas"),
        api.get("/calificaciones"),
      ]);

      const gruposData = aLista<Grupo>(gruposRes);
      const estudiantesData = aLista<Estudiante>(estRes);
      const actividadesData = aLista<Actividad>(actRes);
      const alertasData = aLista<Alerta>(alertasRes);
      const calificacionesData = aLista<Calificacion>(calsRes);

      const enriched: GrupoRow[] = gruposData.map((g) => {
        const grupoEstudiantes = estudiantesData.filter((e) => String(e.grupo_id) === String(g.id));
        const estIds = new Set(grupoEstudiantes.map((e) => String(e.id)));

        const grupoActividades = actividadesData.filter((a) => String(a.grupo_id) === String(g.id));
        const grupoAlertas = alertasData.filter((al) => estIds.has(String(al.estudiante_id)) && String(al.estado || "").toLowerCase() !== "resolved" && String(al.estado || "") !== "Resuelta");
        const grupoCalificaciones = calificacionesData.filter((c) => estIds.has(String(c.estudiante_id)));

        const promedio = grupoCalificaciones.length > 0
          ? Math.round((grupoCalificaciones.reduce((s: number, c) => s + Number(c.nota) * 20, 0) / grupoCalificaciones.length))
          : 0;

        return {
          id: String(g.id),
          nombre: String(g.nombre || ""),
          grado: String(g.grado || "1°"),
          turno: String(g.turno || "Matutino"),
          color: colorForGrupo(String(g.nombre || g.id)),
          estudiantesCount: grupoEstudiantes.length,
          actividadesCount: grupoActividades.length,
          alertasCount: grupoAlertas.length,
          promedioGeneral: promedio,
        };
      });

      setGrupos(enriched);
    } catch (error) {
      toast.error("Error cargando grupos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrupos(); }, []);

  const handleCreate = async () => {
    const curso = CURSOS_DISPONIBLES.find((c) => c.value === newCurso);
    if (!curso || !newTurno) {
      toast.error("Completa todos los campos");
      return;
    }
    try {
      await api.post("/grupos", {
        nombre: curso.nombre,
        grado: curso.grado,
        turno: newTurno,
      });
      toast.success("Grupo creado");
      setDialogOpen(false);
      setNewCurso("");
      setNewTurno("");
      fetchGrupos();
    } catch (error) {
      toast.error("Error al crear grupo");
    }
  };

  const filtered = grupos.filter((g) => {
    const matchSearch = g.nombre.toLowerCase().includes(search.toLowerCase()) || g.grado.toLowerCase().includes(search.toLowerCase());
    const matchGrado = filterGrado === "todos" || g.grado === filterGrado;
    const matchTurno = filterTurno === "todos" || g.turno === filterTurno;
    return matchSearch && matchGrado && matchTurno;
  });

  const totalEstudiantes = grupos.reduce((s, g) => s + (g.estudiantesCount || 0), 0);
  const promedioGlobal = grupos.length > 0 ? Math.round(grupos.reduce((s, g) => s + (g.promedioGeneral || 0), 0) / grupos.length) : 0;

  if (loading) {
    return <EstadoCargando texto="Cargando grupos…" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Estructura académica" title="Grupos" description={isAdmin ? "Gestión y seguimiento de grupos académicos" : "Los grupos donde tienes materias asignadas"} icon={Users} tono="bg-lavanda" actions={isAdmin && <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo Grupo
        </Button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Users} label="Grupos activos" value={grupos.length} tono="bg-lavanda" />
        <StatCard icon={GraduationCap} label="Estudiantes totales" value={totalEstudiantes} tono="bg-cielo" />
        <StatCard icon={TrendingUp} label="Promedio global" value={`${promedioGlobal}%`} hint={`${formatoEscala5(promedioGlobal)} de 5.0`} tono="bg-menta" className="col-span-2 lg:col-span-1" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="Buscar grupo..." aria-label="Buscar grupo" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" />
        </div>
        <Select value={filterGrado} onValueChange={setFilterGrado}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[170px]"><SelectValue placeholder="Grado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los grados</SelectItem>
            {Array.from(new Set(grupos.map((g) => g.grado))).sort().map((grado) => (
              <SelectItem key={grado} value={grado}>{grado}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTurno} onValueChange={setFilterTurno}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[170px]"><SelectValue placeholder="Turno" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los turnos</SelectItem>
            <SelectItem value="Matutino">Matutino</SelectItem>
            <SelectItem value="Vespertino">Vespertino</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((grupo) => (
          <Card key={grupo.id} className="group rounded-2xl transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-lavanda font-display text-sm font-bold text-nivel-grupo-fg">
                    {grupo.nombre.replace("Grado ", "")}
                    {/* Color propio del grupo (dato existente), como marca pequeña. */}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card" style={{ backgroundColor: grupo.color }} aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{grupo.nombre}</CardTitle>
                    <p className="text-[13px] text-muted-foreground">{grupo.grado} · {grupo.turno}</p>
                  </div>
                </div>
                {(grupo.alertasCount || 0) > 0 && (
                  <EstadoBadge tono="alerta">{grupo.alertasCount} alertas</EstadoBadge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 py-3 text-center">
                <div>
                  <p className="font-display text-xl font-bold tabular-nums text-foreground">{grupo.estudiantesCount}</p>
                  <p className="text-xs text-muted-foreground">Estudiantes</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold tabular-nums text-foreground">{grupo.actividadesCount}</p>
                  <p className="text-xs text-muted-foreground">Actividades</p>
                </div>
                <div>
                  <p className={`font-display text-xl font-bold tabular-nums ${getPerformanceColor(grupo.promedioGeneral || 0)}`}>{grupo.promedioGeneral}%</p>
                  <p className="text-xs text-muted-foreground">Promedio · {formatoEscala5(grupo.promedioGeneral || 0)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Rendimiento</span>
                  <EstadoBadge tono={getPerformanceTono(grupo.promedioGeneral || 0)}>
                    {getPerformanceLabel(grupo.promedioGeneral || 0)}
                  </EstadoBadge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full" style={{ width: `${grupo.promedioGeneral || 0}%`, background: colorBarra[nivelPromedio(grupo.promedioGeneral || 0)] }} />
                </div>
              </div>
              <Link
                to={`/app/estudiantes?grupo=${grupo.id}`}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-azul transition-colors hover:bg-secondary"
              >
                Ver estudiantes del grupo <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-card">
          {grupos.length === 0 ? (
            <EstadoVacio titulo={isAdmin ? "Aún no hay grupos" : "Aún no tienes grupos asignados"} descripcion={isAdmin ? "Crea el primer grupo con el botón «Nuevo Grupo»." : "Cuando el administrador te asigne una materia en un grupo, aparecerá aquí."} />
          ) : (
            <EstadoVacio conMascota={false} titulo="No se encontraron grupos" descripcion="Intenta con otros filtros de búsqueda." />
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo grupo</DialogTitle>
            <DialogDescription>Ingresa los datos del grupo académico</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={newCurso} onValueChange={setNewCurso}>
                <SelectTrigger><SelectValue placeholder="Seleccionar curso" /></SelectTrigger>
                <SelectContent>
                  {CURSOS_DISPONIBLES.map((curso) => (
                    <SelectItem key={curso.value} value={curso.value}>{curso.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={newTurno} onValueChange={setNewTurno}>
                <SelectTrigger><SelectValue placeholder="Seleccionar turno" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matutino">Matutino</SelectItem>
                  <SelectItem value="Vespertino">Vespertino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Grupos;