import { useState, useEffect } from "react";
import { Search, Plus, BookOpen, Calendar, CheckCircle2, Clock, Hourglass, FileText, Users } from "lucide-react";
import EstadoBadge from "@/components/common/EstadoBadge";
import { EstadoCargando, EstadoVacio } from "@/components/common/Estados";
import { clasePromedio, formatoEscala5 } from "@/lib/notas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/api/client";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { fechaLocal, inicioDeHoy } from "@/lib/fechas";
import { aLista } from "@/lib/listas";
import { mensajeDeError } from "@/lib/utils";
import type { Actividad, Calificacion, Estudiante, Grupo, Materia } from "@/types";
import { useUserRole } from "@/hooks/useUserRole";

interface ActividadView {
  id: string;
  titulo: string;
  tipo: string;
  grupo_id: string;
  grupo_nombre: string;
  fecha_entrega: string;
  estado: string;
  descripcion: string | null;
  entregados: number;
  totalEstudiantes: number;
  promedioCalificacion: number | null;
}

// Cada tipo de actividad tiene un color de la paleta. Sin rojo: el frambuesa queda reservado
// para alertas académicas.
const getTipoBadge = (tipo: string) => {
  const styles: Record<string, string> = {
    tarea: "bg-menta text-nivel-excelente-fg",
    examen: "bg-durazno text-nivel-reprobado-fg",
    proyecto: "bg-mantequilla text-nivel-observar-fg",
    participación: "bg-cielo text-nivel-aprobado-fg",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[tipo] || "bg-secondary text-foreground"}`}>{tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : ""}</span>;
};

// RN-16 sin cambios: el estado se calcula igual que antes; solo cambia cómo se muestra.
// «Vencida» informa que la fecha de entrega pasó; no es una alerta.
const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "pendiente": return <EstadoBadge tono="aprobado" icono={false}><Hourglass className="h-3.5 w-3.5" aria-hidden="true" />Pendiente</EstadoBadge>;
    case "completada": return <EstadoBadge tono="excelente" icono={false}><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Completada</EstadoBadge>;
    case "vencida": return <EstadoBadge tono="observar" icono={false}><Clock className="h-3.5 w-3.5" aria-hidden="true" />Vencida</EstadoBadge>;
    default: return null;
  }
};

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case "completada": return <span className="grid h-9 w-9 place-items-center rounded-xl bg-menta"><CheckCircle2 className="h-[18px] w-[18px]" aria-hidden="true" /></span>;
    case "vencida": return <span className="grid h-9 w-9 place-items-center rounded-xl bg-mantequilla"><Clock className="h-[18px] w-[18px]" aria-hidden="true" /></span>;
    default: return <span className="grid h-9 w-9 place-items-center rounded-xl bg-cielo"><FileText className="h-[18px] w-[18px]" aria-hidden="true" /></span>;
  }
};


const Actividades = () => {
  const [actividades, setActividades] = useState<ActividadView[]>([]);
  const [grupos, setGrupos] = useState<{ id: string; nombre: string }[]>([]);
  const [materias, setMaterias] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterGrupo, setFilterGrupo] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newTipo, setNewTipo] = useState("");
  const [newGrupoId, setNewGrupoId] = useState("");
  const [newMateriaId, setNewMateriaId] = useState("");
  const [newFecha, setNewFecha] = useState("");
  const [newDesc, setNewDesc] = useState("");
  // Pares materia–grupo asignados (para el docente, solo los suyos: H-08).
  const [asignaciones, setAsignaciones] = useState<{ materia_id: string; grupo_id: string }[]>([]);
  const { isAdmin } = useUserRole();

  const fetchData = async () => {
    setLoading(true);
    try {
      // H-16: antes se hacían dos peticiones por actividad (estudiantes del grupo y notas de la
      // actividad). Ahora se piden una sola vez y se agrupan aquí; la API ya filtra por permisos.
      const [gruposRes, actRes, matRes, asigRes, estRes, calRes] = await Promise.all([
        api.get("/grupos"),
        api.get("/actividades"),
        api.get("/materias"),
        api.get("/asignaciones"),
        api.get("/estudiantes"),
        api.get("/calificaciones"),
      ]);
      setAsignaciones(aLista<{ materia_id: number; grupo_id: number }>(asigRes).map((x) => ({ materia_id: String(x.materia_id), grupo_id: String(x.grupo_id) })));

      const gruposList = aLista<Grupo>(gruposRes);
      const actList = aLista<Actividad>(actRes);
      const matList = aLista<Materia>(matRes);

      setGrupos(gruposList.map((g) => ({ id: String(g.id), nombre: g.nombre })));
      setMaterias(matList.map((m) => ({ id: String(m.id), nombre: m.nombre })));

      const estudiantesPorGrupo = new Map<string, Estudiante[]>();
      for (const e of aLista<Estudiante>(estRes)) {
        const g = String(e.grupo_id);
        if (!estudiantesPorGrupo.has(g)) estudiantesPorGrupo.set(g, []);
        estudiantesPorGrupo.get(g)!.push(e);
      }
      const notasPorActividad = new Map<string, Calificacion[]>();
      for (const c of aLista<Calificacion>(calRes)) {
        const a = String(c.actividad_id);
        if (!notasPorActividad.has(a)) notasPorActividad.set(a, []);
        notasPorActividad.get(a)!.push(c);
      }

      const enriched = await Promise.all(
        actList.map(async (a) => {
          try {
            const estList = estudiantesPorGrupo.get(String(a.grupo_id)) ?? [];
            const cals = notasPorActividad.get(String(a.id)) ?? [];

            // H-30c: se cuentan ESTUDIANTES distintos del grupo con la entrega marcada, no
            // filas de calificación (una nota repetida contaba dos veces: 7/20 frente a 5/20
            // en Calificaciones). La entrega se lee de `entregado` (migración 001); si la base
            // aún no tiene esa columna, toda nota registrada cuenta como entregada, como antes.
            type EstudianteId = { id: number | string };
            type CalEntrega = { estudiante_id: number | string; entregado?: boolean };
            const idsDelGrupo = new Set((estList as EstudianteId[]).map((e) => String(e.id)));
            const entregados = new Set(
              (cals as CalEntrega[])
                .filter((c) => idsDelGrupo.has(String(c.estudiante_id)) && c.entregado !== false)
                .map((c) => String(c.estudiante_id))
            ).size;
            const totalEstudiantes = estList.length;
            const calValues = cals.map((c) => Number(c.nota || 0) * 20).filter((v: number) => !isNaN(v));
            const prom = calValues.length > 0 ? Math.round(calValues.reduce((s, v) => s + v, 0) / calValues.length) : null;

            let estado = a.estado || (a.fecha_entrega && fechaLocal(a.fecha_entrega) < inicioDeHoy() ? "vencida" : "pendiente");
            if (estado === "pendiente" && totalEstudiantes > 0 && entregados === totalEstudiantes) estado = "completada";

            return {
              id: String(a.id),
              titulo: a.titulo,
              tipo: a.tipo || "tarea",
              grupo_id: String(a.grupo_id),
              grupo_nombre: a.grupo_nombre || "",
              fecha_entrega: a.fecha_entrega,
              estado,
              descripcion: a.descripcion,
              entregados,
              totalEstudiantes,
              promedioCalificacion: prom,
            };
          } catch {
            return {
              id: String(a.id),
              titulo: a.titulo,
              tipo: a.tipo || "tarea",
              grupo_id: String(a.grupo_id),
              grupo_nombre: a.grupo_nombre || "",
              fecha_entrega: a.fecha_entrega,
              estado: a.estado || (a.fecha_entrega && fechaLocal(a.fecha_entrega) < inicioDeHoy() ? "vencida" : "pendiente"),
              descripcion: a.descripcion,
              entregados: 0,
              totalEstudiantes: 0,
              promedioCalificacion: null,
            };
          }
        })
      );
      setActividades(enriched);
    } catch (error) {
      toast.error(mensajeDeError(error, "Error al cargar las actividades"));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // El docente solo puede crear actividades de una materia que dicta en el grupo elegido.
  const materiasDelGrupo = isAdmin || !newGrupoId
    ? materias
    : materias.filter((m) => asignaciones.some((a) => a.grupo_id === newGrupoId && a.materia_id === m.id));

  const handleCreate = async () => {
    if (!newTitulo || !newTipo || !newGrupoId || !newMateriaId || !newFecha) {
      toast.error("Completa los campos requeridos");
      return;
    }
    try {
      await api.post("/actividades", {
        titulo: newTitulo,
        tipo: newTipo,
        grupo_id: Number(newGrupoId),
        fecha_entrega: newFecha,
        descripcion: newDesc || null,
        materia_id: newMateriaId ? Number(newMateriaId) : null,
      });
      toast.success("Actividad creada");
      setDialogOpen(false);
      setNewTitulo(""); setNewTipo(""); setNewGrupoId(""); setNewMateriaId(""); setNewFecha(""); setNewDesc("");
      fetchData();
    } catch (error) {
      toast.error(mensajeDeError(error, "Error al crear actividad"));
    }
  };

  const filtered = actividades.filter((a) => {
    const matchSearch = a.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "todos" || a.tipo === filterTipo;
    const matchEstado = filterEstado === "todos" || a.estado === filterEstado;
    const matchGrupo = filterGrupo === "todos" || a.grupo_id === filterGrupo;
    return matchSearch && matchTipo && matchEstado && matchGrupo;
  });

  const completadas = actividades.filter(a => a.estado === "completada").length;
  const vencidas = actividades.filter(a => a.estado === "vencida").length;
  const pendientes = actividades.filter(a => a.estado === "pendiente").length;

  if (loading) {
    return <EstadoCargando texto="Cargando actividades…" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Planeación docente" title="Actividades" description="Tareas, exámenes, proyectos y participaciones de tus grupos" icon={BookOpen} tono="bg-durazno" actions={<Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Nueva Actividad</Button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          [BookOpen, actividades.length, "Total", "bg-durazno"],
          [CheckCircle2, completadas, "Completadas", "bg-menta"],
          [Hourglass, pendientes, "Pendientes", "bg-cielo"],
          [Clock, vencidas, "Vencidas", "bg-mantequilla"],
        ] as const).map(([Icono, valor, rotulo, tono]) => (
          <div key={rotulo} className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4">
            <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl ${tono}`}><Icono className="h-5 w-5" aria-hidden="true" /></span>
            {/* La cifra va antes del rótulo (las pruebas E2E leen «Vencidas» así). */}
            <div><p className="font-display text-[26px] font-bold leading-none tabular-nums text-foreground">{valor}</p><p className="mt-1 text-[13px] text-muted-foreground">{rotulo}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar actividad..." aria-label="Buscar actividad" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[170px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="tarea">Tarea</SelectItem>
            <SelectItem value="examen">Examen</SelectItem>
            <SelectItem value="proyecto">Proyecto</SelectItem>
            <SelectItem value="participación">Participación</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[170px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGrupo} onValueChange={setFilterGrupo}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[170px]"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los grupos</SelectItem>
            {grupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((act) => {
          const porcentajeEntrega = act.totalEstudiantes > 0 ? Math.round((act.entregados / act.totalEstudiantes) * 100) : 0;
          return (
            <Card key={act.id} className="group rounded-2xl transition-shadow hover:shadow-md">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getEstadoIcon(act.estado)}</div>
                    <div className="space-y-1">
                      <p className="text-[15px] font-semibold leading-tight text-foreground">{act.titulo}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getTipoBadge(act.tipo)}
                        <EstadoBadge tono="grupo">{act.grupo_nombre}</EstadoBadge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>{act.fecha_entrega ? fechaLocal(act.fecha_entrega).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "N/A"}</span></div>
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /><span>{act.entregados}/{act.totalEstudiantes} entregados</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Progreso de entrega</span><span className="font-semibold tabular-nums text-foreground">{porcentajeEntrega}%</span></div>
                  <Progress value={porcentajeEntrega} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  {getEstadoBadge(act.estado)}
                  {act.promedioCalificacion !== null && (
                    <span className={`text-sm font-bold tabular-nums ${clasePromedio(act.promedioCalificacion)}`}>Prom: {formatoEscala5(act.promedioCalificacion)} <span className="font-semibold text-muted-foreground">· {act.promedioCalificacion} %</span></span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        actividades.length === 0 ? (
          <EstadoVacio titulo="Aún no hay actividades" descripcion="Crea la primera actividad con el botón «Nueva Actividad»." />
        ) : (
          <EstadoVacio conMascota={false} titulo="No se encontraron actividades" descripcion="Prueba con otra búsqueda o cambia los filtros." />
        )
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Crear nueva actividad</DialogTitle><DialogDescription>Ingresa los datos de la actividad</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Título</Label><Input placeholder="Nombre de la actividad" value={newTitulo} onChange={(e) => setNewTitulo(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={newTipo} onValueChange={setNewTipo}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent><SelectItem value="tarea">Tarea</SelectItem><SelectItem value="examen">Examen</SelectItem><SelectItem value="proyecto">Proyecto</SelectItem><SelectItem value="participación">Participación</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Grupo</Label>
                <Select value={newGrupoId} onValueChange={(v) => { setNewGrupoId(v); setNewMateriaId(""); }}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{grupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Fecha de entrega</Label><Input type="date" value={newFecha} onChange={(e) => setNewFecha(e.target.value)} /></div>
            <div className="space-y-2"><Label>Materia</Label>
              <Select value={newMateriaId} onValueChange={setNewMateriaId}><SelectTrigger><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
                <SelectContent>{materiasDelGrupo.map(m => <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Descripción (opcional)</Label><Textarea placeholder="Instrucciones" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear actividad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Actividades;