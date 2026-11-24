import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, GraduationCap, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Pencil } from "lucide-react";
import { Minus } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import EstadoBadge from "@/components/common/EstadoBadge";
import { EstadoCargando, EstadoVacio } from "@/components/common/Estados";
import { useIsMobile } from "@/hooks/use-mobile";
import { clasePromedio, formatoEscala5, iniciales, promedioExacto, UMBRAL_ALERTA_PORCENTAJE, UMBRAL_APROBADO } from "@/lib/notas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/api/client";
import { toast } from "sonner";
import ObservacionesEstudiante from "@/components/students/ObservacionesEstudiante";
import PageHeader from "@/components/layout/PageHeader";
import { aLista } from "@/lib/listas";
import type { Alerta, Calificacion, Estudiante, Grupo } from "@/types";

interface EstudianteView {
  id: string;
  documento: string;
  nombre: string;
  apellido: string;
  grupo_id: string;
  grupo_nombre: string;
  tendencia: string;
  estado: string;
  promedio: number;
  alertas: number;
  activo: boolean;
}

// Estado académico calculado en esta pantalla (sin cambios en la regla); solo cambia el color.
const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "en riesgo": return <EstadoBadge tono="reprobado">En riesgo</EstadoBadge>;
    case "crítico": return <EstadoBadge tono="alerta">Crítico</EstadoBadge>;
    default: return <EstadoBadge tono="aprobado">Activo</EstadoBadge>;
  }
};

const getTendenciaIcon = (tendencia: string) => {
  switch (tendencia) {
    case "up": return <span className="inline-flex items-center gap-1 text-xs font-semibold text-nivel-excelente-fg"><TrendingUp className="h-4 w-4" aria-hidden="true" />Sube</span>;
    case "down": return <span className="inline-flex items-center gap-1 text-xs font-semibold text-nivel-reprobado-fg"><TrendingDown className="h-4 w-4" aria-hidden="true" />Baja</span>;
    default: return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-4 w-4" aria-hidden="true" />Estable</span>;
  }
};

const POR_PAGINA = 25;


const avatarColors = ["bg-menta text-foreground", "bg-cielo text-foreground", "bg-lavanda text-foreground", "bg-durazno text-foreground", "bg-mantequilla text-foreground"];

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteView[]>([]);
  const [grupos, setGrupos] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("buscar") || "");
  // Permite llegar filtrado desde Grupos (?grupo=<id>).
  const [filterGrupo, setFilterGrupo] = useState(searchParams.get("grupo") || "todos");
  const [pagina, setPagina] = useState(1);
  const isMobile = useIsMobile();
  const [filterEstado, setFilterEstado] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteView | null>(null);
  const [editingEstudiante, setEditingEstudiante] = useState<EstudianteView | null>(null);
  const [newDocumento, setNewDocumento] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newApellido, setNewApellido] = useState("");
  const [newGrupoId, setNewGrupoId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gruposRes, estRes, calsRes, alertasRes] = await Promise.all([
        api.get("/grupos"),
        api.get("/estudiantes"),
        api.get("/calificaciones"),
        api.get("/alertas"),
      ]);

      const gruposList = aLista<Grupo>(gruposRes);
      // Los IDs se manejan SIEMPRE como texto dentro de esta pantalla (opciones de los
      // selectores, filtro y formulario). La API los entrega como número; mezclar ambos
      // tipos hacía que el filtro por grupo no encontrara coincidencias (H-29) y que el
      // selector apareciera vacío al editar (H-28).
      setGrupos(gruposList.map((g: { id: number | string; nombre?: string }) => ({ id: String(g.id), nombre: String(g.nombre || "") })));

      const gruposMap = new Map(gruposList.map((g) => [String(g.id), g.nombre]));

      const ests = aLista<Estudiante>(estRes);
      const cals = aLista<Calificacion>(calsRes);
      const alertas = aLista<Alerta>(alertasRes);

      const enriched: EstudianteView[] = ests.map((e) => {
        const estCals = cals.filter((c) => String(c.estudiante_id) === String(e.id));
        // H-01: se clasifica con el promedio exacto; el entero redondeado es solo para mostrar.
        const exacto = promedioExacto(estCals.map((c) => Number(c.nota || 0))) ?? 0;
        const promedio = Math.round(exacto);

        const estAlertas = alertas.filter((a) => String(a.estudiante_id) === String(e.id) && String(a.estado || "").toLowerCase() !== "resolved" && String(a.estado || "") !== "Resuelta");

        // No existe una columna de asistencia en la base de datos: el estado y la
        // tendencia se calculan a partir de datos reales (promedio, alertas activas
        // y comparación de promedio entre periodos), no de campos inventados.
        const periodos = new Map<number, number[]>();
        estCals.forEach((c) => {
          const p = Number(c.periodo || 1);
          const nota = Number(c.nota || 0);
          if (!periodos.has(p)) periodos.set(p, []);
          periodos.get(p)!.push(nota);
        });
        const avgFor = (p: number) => {
          const notas = periodos.get(p);
          return notas && notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
        };
        const periodosOrdenados = Array.from(periodos.keys()).sort((a, b) => a - b);
        let tendencia = "stable";
        if (periodosOrdenados.length >= 2) {
          const primero = avgFor(periodosOrdenados[0]);
          const ultimo = avgFor(periodosOrdenados[periodosOrdenados.length - 1]);
          if (primero !== null && ultimo !== null) {
            if (ultimo > primero + 0.1) tendencia = "up";
            else if (ultimo < primero - 0.1) tendencia = "down";
          }
        }

        let estado = "activo";
        if (estAlertas.length > 0 && exacto < UMBRAL_ALERTA_PORCENTAJE) estado = "crítico";
        else if (estAlertas.length > 0 || exacto < UMBRAL_APROBADO) estado = "en riesgo";

        return {
          id: String(e.id),
          documento: String(e.documento || ""),
          nombre: String(e.nombre || ""),
          apellido: String(e.apellido || ""),
          grupo_id: String(e.grupo_id || ""),
          grupo_nombre: gruposMap.get(String(e.grupo_id)) || "",
          tendencia,
          estado,
          promedio,
          alertas: estAlertas.length,
          activo: e.activo !== false,
        };
      });

      setEstudiantes(enriched);
    } catch (error) {
      toast.error("Error al cargar los estudiantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!newDocumento || !newNombre || !newApellido || !newGrupoId) {
      toast.error("Completa todos los campos"); 
      return; 
    }
    try {
      const payload = {
        documento: newDocumento,
        nombre: newNombre, 
        apellido: newApellido, 
        grupo_id: Number(newGrupoId),
        // Al editar se conserva el estado actual del estudiante; antes se enviaba
        // siempre `true` y un estudiante inactivo quedaba reactivado (H-28).
        activo: editingEstudiante ? editingEstudiante.activo : true,
      };
      if (editingEstudiante) {
        await api.put(`/estudiantes/${editingEstudiante.id}`, payload);
        toast.success("Estudiante actualizado");
      } else {
        await api.post("/estudiantes", payload);
        toast.success("Estudiante registrado");
      }
      setDialogOpen(false);
      setEditingEstudiante(null);
      setNewDocumento("");
      setNewNombre(""); 
      setNewApellido(""); 
      setNewGrupoId("");
      fetchData();
    } catch (error) {
      toast.error("Error al registrar estudiante");
    }
  };

  const openCreateDialog = () => {
    setEditingEstudiante(null);
    setNewDocumento("");
    setNewNombre("");
    setNewApellido("");
    setNewGrupoId("");
    setDialogOpen(true);
  };

  const openEditDialog = (estudiante: EstudianteView) => {
    setSelectedEstudiante(null);
    setEditingEstudiante(estudiante);
    setNewDocumento(estudiante.documento || "");
    setNewNombre(estudiante.nombre);
    setNewApellido(estudiante.apellido);
    setNewGrupoId(estudiante.grupo_id);
    setDialogOpen(true);
  };

  const filtered = estudiantes.filter((e) => {
    const matchSearch = `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase());
    const matchGrupo = filterGrupo === "todos" || e.grupo_id === filterGrupo;
    const matchEstado = filterEstado === "todos" || e.estado === filterEstado;
    return matchSearch && matchGrupo && matchEstado;
  });

  // Paginación (antes la tabla mostraba los 200 estudiantes en una sola página).
  const totalPaginas = Math.max(1, Math.ceil(filtered.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtered.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const enRiesgo = estudiantes.filter(e => e.estado === "en riesgo" || e.estado === "crítico").length;
  const promedioGeneral = estudiantes.length > 0 
    ? Math.round(estudiantes.reduce((s, e) => s + e.promedio, 0) / estudiantes.length) 
    : 0;

  if (loading) {
    return <EstadoCargando texto="Cargando estudiantes…" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Comunidad escolar" title="Estudiantes" description="Seguimiento individual de cada estudiante" icon={GraduationCap} tono="bg-cielo" actions={<Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo Estudiante
        </Button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={GraduationCap} label="Total estudiantes" value={estudiantes.length} tono="bg-cielo" />
        <StatCard icon={AlertTriangle} label="En riesgo o crítico" value={enRiesgo} hint="promedio menor que 70 %" tono="bg-durazno" />
        <StatCard icon={TrendingUp} label="Promedio general" value={`${promedioGeneral}%`} hint={`${formatoEscala5(promedioGeneral)} de 5.0`} tono="bg-menta" className="col-span-2 lg:col-span-1" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-[240px] sm:max-w-xs sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="Buscar estudiante..." aria-label="Buscar estudiante" value={search} onChange={(e) => { setSearch(e.target.value); setPagina(1); }} className="h-11 rounded-xl pl-9" />
        </div>
        <Select value={filterGrupo} onValueChange={(v) => { setFilterGrupo(v); setPagina(1); }}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[180px]" aria-label="Filtrar por grupo"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los grupos</SelectItem>
            {grupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={(v) => { setFilterEstado(v); setPagina(1); }}>
          <SelectTrigger className="h-11 w-[calc(50%-0.375rem)] rounded-xl sm:w-[160px]" aria-label="Filtrar por estado"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="en riesgo">En riesgo</SelectItem>
            <SelectItem value="crítico">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 && isMobile && (
        <ul className="space-y-2" aria-label="Estudiantes">
          {visibles.map((est, idx) => (
            <li key={est.id}>
              <button type="button" onClick={() => setSelectedEstudiante(est)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left">
                <span className={`grid h-10 w-10 flex-none place-items-center rounded-full text-xs font-bold ${avatarColors[idx % avatarColors.length]}`}>{iniciales(est.nombre, est.apellido)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{est.nombre} {est.apellido}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5"><EstadoBadge tono="grupo">{est.grupo_nombre}</EstadoBadge>{getEstadoBadge(est.estado)}</span>
                </span>
                <span className={`flex-none text-right text-sm font-bold tabular-nums ${clasePromedio(est.promedio)}`}>{est.promedio}%<span className="block text-xs font-semibold text-muted-foreground">{formatoEscala5(est.promedio)}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > 0 && !isMobile && (
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Estudiante</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Grupo</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Promedio</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Tendencia</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Estado</TableHead>
                <TableHead className="text-center text-xs font-bold uppercase tracking-wide">Alertas</TableHead>
                <TableHead><span className="sr-only">Abrir</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((est, idx) => (
                <TableRow key={est.id} className="cursor-pointer hover:bg-secondary/60" onClick={() => setSelectedEstudiante(est)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`text-xs font-bold ${avatarColors[idx % avatarColors.length]}`}>
                          {iniciales(est.nombre, est.apellido)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-[15px] font-semibold text-foreground">{est.nombre} {est.apellido}</p>
                    </div>
                  </TableCell>
                  <TableCell><EstadoBadge tono="grupo">{est.grupo_nombre}</EstadoBadge></TableCell>
                  <TableCell>
                    <span className={`text-sm font-bold tabular-nums ${clasePromedio(est.promedio)}`}>{est.promedio}%</span>
                    <span className="ml-1.5 text-[13px] tabular-nums text-muted-foreground">{formatoEscala5(est.promedio)}</span>
                  </TableCell>
                  <TableCell>{getTendenciaIcon(est.tendencia)}</TableCell>
                  <TableCell>{getEstadoBadge(est.estado)}</TableCell>
                  <TableCell className="text-center">
                    {est.alertas > 0 ? <EstadoBadge tono="alerta" icono={false}>{est.alertas}</EstadoBadge> : <span className="text-sm text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {filtered.length > POR_PAGINA && (
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Paginación de estudiantes">
          <p className="text-sm text-muted-foreground">
            Mostrando {(paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 rounded-xl" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</Button>
            <span className="min-w-[90px] text-center text-sm font-semibold tabular-nums">Página {paginaActual} de {totalPaginas}</span>
            <Button variant="outline" className="h-10 rounded-xl" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</Button>
          </div>
        </nav>
      )}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-card">
          {estudiantes.length === 0 ? (
            <EstadoVacio titulo="Aún no hay estudiantes" descripcion="Registra el primero con el botón «Nuevo Estudiante»." />
          ) : (
            <EstadoVacio conMascota={false} titulo="No se encontraron estudiantes" descripcion="Prueba con otro nombre o cambia los filtros." />
          )}
        </div>
      )}

      <Dialog open={!!selectedEstudiante} onOpenChange={() => setSelectedEstudiante(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedEstudiante && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-base font-bold bg-primary/15 text-primary">
                      {iniciales(selectedEstudiante.nombre, selectedEstudiante.apellido)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle>{selectedEstudiante.nombre} {selectedEstudiante.apellido}</DialogTitle>
                    <DialogDescription>Grupo {selectedEstudiante.grupo_nombre}</DialogDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditDialog(selectedEstudiante)}>
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Promedio</p>
                  <p className={`font-display text-2xl font-bold tabular-nums ${clasePromedio(selectedEstudiante.promedio)}`}>{selectedEstudiante.promedio}% <span className="text-base font-semibold text-muted-foreground">· {formatoEscala5(selectedEstudiante.promedio)} de 5.0</span></p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Estado:</span>{getEstadoBadge(selectedEstudiante.estado)}</div>
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Tendencia:</span>{getTendenciaIcon(selectedEstudiante.tendencia)}</div>
                </div>
                {selectedEstudiante.alertas > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-nivel-alerta p-3 text-nivel-alerta-fg">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    <p className="text-sm font-semibold">{selectedEstudiante.alertas} alerta(s) activa(s)</p>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <ObservacionesEstudiante estudianteId={selectedEstudiante.id} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEstudiante ? "Editar estudiante" : "Registrar nuevo estudiante"}</DialogTitle>
            <DialogDescription>{editingEstudiante ? "Actualiza los datos del estudiante" : "Ingresa los datos del estudiante"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Documento</Label><Input placeholder="Número de documento" value={newDocumento} onChange={(e) => setNewDocumento(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nombre</Label><Input placeholder="Nombre" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input placeholder="Apellido" value={newApellido} onChange={(e) => setNewApellido(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Grupo</Label>
              <Select value={newGrupoId} onValueChange={setNewGrupoId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar grupo" /></SelectTrigger>
                <SelectContent>{grupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingEstudiante ? "Guardar cambios" : "Registrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estudiantes;