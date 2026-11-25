import { useState, useEffect } from "react";
import { Save, CheckCircle2, Users, Award, BarChart3, ClipboardList, CalendarDays, Library, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/api/client";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import { EstadoVacio, FilasCargando } from "@/components/common/Estados";
import { useIsMobile } from "@/hooks/use-mobile";
import { fechaCorta } from "@/lib/fechas";
import {
  ETIQUETA_ESTADO, UMBRAL_APROBACION_NOTA, aPorcentaje, estadoNota, filaModificada, formatoNota,
  iniciales, interpretarNota, promedioActividad, textoEquivalencias,
} from "@/lib/notas";
import { aLista } from "@/lib/listas";
import type { Calificacion, Estudiante } from "@/types";

interface Grupo { id: string; nombre: string; }
interface Actividad { id: string; titulo: string; tipo: string; grupo_id: string; materia_id?: number | string; materia_nombre?: string; fecha_entrega?: string; }
interface CalificacionRow {
  estudiante_id: string;
  nombre: string;
  apellido: string;
  // Nota en la escala oficial 0.0 – 5.0. `null` = el estudiante no tiene calificación en esta
  // actividad (antes se mostraba como 0 y se guardaba como 0: H-02).
  nota: number | null;
  // Lo que el docente escribió y, si no es válido, el motivo (la fila no se puede guardar).
  entrada: string;
  error: string | null;
  entregado: boolean;
  id?: string;
  // Valores con los que se cargó la fila, para guardar solo lo que el docente cambió (D2).
  original: { nota: number | null; entregado: boolean };
}

const tonosAvatar = ["bg-menta", "bg-cielo", "bg-lavanda", "bg-durazno", "bg-mantequilla"];

/** Campo de nota en la escala oficial (0.0 – 5.0) con sus equivalencias como dato secundario. */
const CampoNota = ({ fila, onChange }: { fila: CalificacionRow; onChange: (raw: string) => void }) => (
  <div className="flex items-center gap-2.5">
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={fila.entrada}
      placeholder="—"
      aria-label={`Calificación de ${fila.nombre} ${fila.apellido}`}
      aria-describedby={`equiv-${fila.estudiante_id}`}
      aria-invalid={fila.error ? true : undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-[68px] rounded-lg text-center text-[15px] font-bold tabular-nums ${fila.error ? "border-destructive ring-2 ring-destructive/40" : filaModificada(fila) ? "border-sol ring-2 ring-sol/60" : ""}`}
    />
    <span id={`equiv-${fila.estudiante_id}`} className="min-w-[96px] text-[13px] leading-tight tabular-nums text-muted-foreground">
      {fila.error ? <span className="font-semibold text-destructive">{fila.error}</span>
        : fila.nota !== null ? <>de 5.0<span className="block text-xs">{textoEquivalencias(fila.nota)}</span></>
        : <span className="sr-only">Sin nota</span>}
    </span>
  </div>
);

const Calificaciones = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedActividad, setSelectedActividad] = useState("");
  const [calificaciones, setCalificaciones] = useState<CalificacionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get("/grupos");
        const data = aLista(res);
        setGrupos(data);
      } catch (error) {
        toast.error("No pudimos cargar los grupos. Revisa tu conexión.");
      }
    };
    fetchGrupos();
  }, []);

  useEffect(() => {
    if (!selectedGrupo) { 
      setActividades([]); 
      setSelectedActividad(""); 
      return; 
    }
    const fetchActividades = async () => {
      try {
        const res = await api.get(`/actividades?grupo_id=${selectedGrupo}`);
        const data = aLista(res);
        const filtered = data.filter((a) => String(a.grupo_id) === String(selectedGrupo));
        setActividades(filtered);
        setSelectedActividad("");
      } catch (error) {
        toast.error("No pudimos cargar las actividades del grupo.");
      }
    };
    fetchActividades();
  }, [selectedGrupo]);

  useEffect(() => {
    if (!selectedGrupo || !selectedActividad) { 
      setCalificaciones([]); 
      return; 
    }
    loadCalificaciones();
  }, [selectedActividad]);

  const loadCalificaciones = async () => {
    setLoading(true);
    try {
      const [estRes, calRes] = await Promise.all([
        api.get(`/estudiantes?grupo_id=${selectedGrupo}`),
        api.get("/calificaciones"),
      ]);

      const estudiantesRaw = aLista<Estudiante>(estRes);
      const estudiantes = estudiantesRaw
        .filter((e) => String(e.grupo_id) === String(selectedGrupo))
        .sort((a, b) => String(a.apellido).localeCompare(String(b.apellido)));

      // Importante: filtrar por actividad_id (no solo materia_id). Una materia puede
      // tener varias actividades para el mismo grupo; filtrar solo por materia_id
      // mezclaba la nota de una actividad distinta y, al guardar, podía reasignarla
      // silenciosamente a la actividad seleccionada.
      const calsRaw = aLista<Calificacion>(calRes);
      const cals = calsRaw.filter((c) => String(c.actividad_id) === String(selectedActividad));

      const calMap = new Map(cals.map((c) => [String(c.estudiante_id), c]));

      const rows: CalificacionRow[] = estudiantes.map((e) => {
        const existing = calMap.get(String(e.id));
        const nota = existing ? Number(existing.nota) : null;
        // «Entregado» se lee de la base (columna `entregado`, migración 001). Si la base aún
        // no tiene la columna, se conserva el comportamiento anterior: con nota = entregado.
        const entregado = existing ? (typeof existing.entregado === "boolean" ? existing.entregado : true) : false;
        return {
          estudiante_id: String(e.id),
          nombre: String(e.nombre || ""),
          apellido: String(e.apellido || ""),
          nota,
          entrada: nota === null ? "" : formatoNota(nota),
          error: null,
          entregado,
          id: existing ? String(existing.id) : undefined,
          original: { nota, entregado },
        };
      });
      setCalificaciones(rows);
    } catch (error) {
      toast.error("No pudimos cargar las calificaciones. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const updateCalificacion = (idx: number, raw: string) => {
    const { nota, error } = interpretarNota(raw);
    setCalificaciones(prev => prev.map((c, i) => i === idx ? { ...c, entrada: raw, nota, error } : c));
  };

  const toggleEntregado = (idx: number) => {
    setCalificaciones(prev => prev.map((c, i) => i === idx ? { ...c, entregado: !c.entregado } : c));
  };

  const pendientesDeGuardar = calificaciones.filter(filaModificada).length;
  const filasConError = calificaciones.filter((c) => c.error).length;

  const handleSave = async () => {
    if (!selectedActividad) return;
    const materiaId = Number(actividades.find((item) => String(item.id) === String(selectedActividad))?.materia_id);
    // D2: solo se envían las filas que el docente modificó. Las demás no se tocan, y un
    // estudiante sin nota no recibe un 0 (H-02).
    if (filasConError > 0) {
      toast.error(filasConError === 1 ? "Corrige la nota marcada en rojo antes de guardar." : `Corrige las ${filasConError} notas marcadas en rojo antes de guardar.`);
      return;
    }
    const modificadas = calificaciones.filter(filaModificada);
    const guardables = modificadas.filter((c) => c.nota !== null);
    const omitidas = modificadas.length - guardables.length;
    if (guardables.length === 0) {
      if (omitidas > 0) toast.error("Ingresa la calificación para poder registrar la entrega.");
      else toast("No hay cambios para guardar");
      return;
    }
    setSaving(true);
    let guardadas = 0;
    try {
      for (const c of guardables) {
        // No se envían `periodo` ni `observacion`: el backend conserva los valores existentes
        // al actualizar (H-33, H-31) y usa el periodo 1 por defecto al crear (RN-08).
        const payload = {
          estudiante_id: Number(c.estudiante_id),
          materia_id: materiaId,
          actividad_id: Number(selectedActividad),
          nota: c.nota as number,
          entregado: c.entregado,
        };
        if (c.id) {
          await api.put(`/calificaciones/${c.id}`, payload);
        } else {
          await api.post("/calificaciones", payload);
        }
        guardadas++;
      }
      toast.success(`Calificaciones guardadas correctamente (${guardadas})`);
      if (omitidas > 0) toast(`${omitidas} fila(s) sin calificación no se guardaron.`);
      loadCalificaciones();
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "";
      toast.error(`Error al guardar calificaciones${guardadas ? ` (se guardaron ${guardadas} antes del error)` : ""}: ${detalle}`);
      if (guardadas) loadCalificaciones();
    } finally {
      setSaving(false);
    }
  };

  // Indicadores: mismo cálculo que antes (un estudiante sin nota cuenta como 0 en el
  // promedio, hallazgo H-19, que no forma parte de esta corrección).
  const promedio = promedioActividad(calificaciones);
  const entregados = calificaciones.filter(c => c.entregado).length;
  const aprobados = calificaciones.filter(c => (c.nota ?? 0) >= UMBRAL_APROBACION_NOTA).length;

  const isMobile = useIsMobile();
  const actividadSel = actividades.find((a) => String(a.id) === String(selectedActividad));
  const grupoSel = grupos.find((g) => String(g.id) === String(selectedGrupo));

  const botonGuardar = (
    <Button onClick={handleSave} disabled={saving || pendientesDeGuardar === 0 || filasConError > 0} className="h-11 gap-2 rounded-xl px-5">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
      {saving ? "Guardando..." : pendientesDeGuardar > 0 ? `Guardar cambios (${pendientesDeGuardar})` : "Guardar cambios"}
    </Button>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evidencia de aprendizaje"
        title="Calificaciones"
        description="Registra notas y entregas por actividad. La nota se escribe en la escala 0.0 – 5.0, con un decimal."
        icon={ClipboardList}
        tono="bg-menta"
        actions={calificaciones.length > 0 && !isMobile && botonGuardar}
      />

      {/* Selectores (el orden grupo → actividad lo usan las pruebas E2E) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <p className="text-[13px] font-semibold text-muted-foreground" id="lbl-grupo">Grupo</p>
          <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
            <SelectTrigger className="h-11 w-full rounded-xl sm:w-[220px]" aria-labelledby="lbl-grupo"><SelectValue placeholder="Seleccionar grupo" /></SelectTrigger>
            <SelectContent>
              {grupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-[13px] font-semibold text-muted-foreground" id="lbl-actividad">Actividad</p>
          <Select value={selectedActividad} onValueChange={setSelectedActividad} disabled={!selectedGrupo}>
            <SelectTrigger className="h-11 w-full rounded-xl sm:w-[320px]" aria-labelledby="lbl-actividad"><SelectValue placeholder={selectedGrupo ? "Seleccionar actividad" : "Primero elige un grupo"} /></SelectTrigger>
            <SelectContent>
              {actividades.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {a.titulo} <span className="ml-1 text-muted-foreground">({a.tipo})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {actividadSel && (
          <div className="flex flex-wrap gap-2 sm:pb-2.5">
            {actividadSel.materia_nombre && <EstadoBadge tono="sin" icono={false}><Library className="h-3.5 w-3.5" aria-hidden="true" />{actividadSel.materia_nombre}</EstadoBadge>}
            {actividadSel.fecha_entrega && <EstadoBadge tono="sin" icono={false}><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />Entrega: {fechaCorta(actividadSel.fecha_entrega)}</EstadoBadge>}
          </div>
        )}
      </div>

      {calificaciones.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"><Users className="h-4 w-4" aria-hidden="true" />Estudiantes</p>
              <p className="mt-1 font-display text-[26px] font-bold leading-none tabular-nums">{calificaciones.length}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{grupoSel ? `en ${grupoSel.nombre}` : "del grupo"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Entregados</p>
              <p className="mt-1 font-display text-[26px] font-bold leading-none tabular-nums">{entregados}/{calificaciones.length}</p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Entregas" aria-valuemin={0} aria-valuemax={calificaciones.length} aria-valuenow={entregados}>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(entregados / calificaciones.length) * 100}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"><Award className="h-4 w-4" aria-hidden="true" />Aprobados</p>
              <p className="mt-1 font-display text-[26px] font-bold leading-none tabular-nums">{aprobados}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">desde {formatoNota(UMBRAL_APROBACION_NOTA)} (70 %)</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"><BarChart3 className="h-4 w-4" aria-hidden="true" />Promedio</p>
              <p className="mt-1 font-display text-[26px] font-bold leading-none tabular-nums">{formatoNota(promedio)} <span className="text-base font-semibold text-muted-foreground">· {aPorcentaje(promedio)} %</span></p>
              <p className="mt-1.5 text-xs text-muted-foreground" title="Hallazgo H-19, pendiente">Quien no tiene nota cuenta como 0</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <span>Estados:</span>
            <EstadoBadge tono="excelente">Excelente ≥ 4.5</EstadoBadge>
            <EstadoBadge tono="aprobado">Aprobado 3.5 – 4.4</EstadoBadge>
            <EstadoBadge tono="reprobado">Reprobado &lt; 3.5</EstadoBadge>
            <EstadoBadge tono="sin">Sin calificar</EstadoBadge>
          </div>
        </>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card"><FilasCargando filas={6} /></div>
      ) : calificaciones.length > 0 ? (
        isMobile ? (
          <ul className="space-y-2.5" aria-label="Estudiantes del grupo">
            {calificaciones.map((c, i) => {
              const estado = estadoNota(c.nota === null ? null : aPorcentaje(c.nota));
              const modificada = filaModificada(c);
              return (
                <li key={c.estudiante_id} className={`rounded-2xl border p-3.5 ${modificada ? "border-sol bg-mantequilla" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`grid h-9 w-9 flex-none place-items-center rounded-full text-xs font-bold ${tonosAvatar[i % 5]}`}>{iniciales(c.nombre, c.apellido)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">{c.apellido}, {c.nombre}</span>
                        {modificada && <span className="block text-xs font-semibold text-nivel-observar-fg">Sin guardar</span>}
                      </span>
                    </div>
                    <EstadoBadge tono={estado}>{ETIQUETA_ESTADO[estado]}</EstadoBadge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <CampoNota fila={c} onChange={(raw) => updateCalificacion(i, raw)} />
                    <label className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                      Entregado
                      <Switch checked={c.entregado} onCheckedChange={() => toggleEntregado(i)} aria-label={`Entregado: ${c.nombre} ${c.apellido}`} />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-xs font-bold uppercase tracking-wide">#</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide">Estudiante</TableHead>
                  <TableHead className="w-[220px] text-xs font-bold uppercase tracking-wide">Calificación</TableHead>
                  <TableHead className="w-[120px] text-center text-xs font-bold uppercase tracking-wide">Entregado</TableHead>
                  <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wide">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.map((c, i) => {
                  const estado = estadoNota(c.nota === null ? null : aPorcentaje(c.nota));
                  const modificada = filaModificada(c);
                  return (
                    <TableRow key={c.estudiante_id} className={modificada ? "bg-mantequilla hover:bg-mantequilla" : ""}>
                      <TableCell className={`text-sm tabular-nums text-muted-foreground ${modificada ? "shadow-[inset_4px_0_0_hsl(var(--sol))]" : ""}`}>{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className={`grid h-9 w-9 flex-none place-items-center rounded-full text-xs font-bold text-foreground ${tonosAvatar[i % 5]}`}>{iniciales(c.nombre, c.apellido)}</span>
                          <span>
                            <span className="block text-[15px] font-semibold text-foreground">{c.apellido}, {c.nombre}</span>
                            {modificada && <span className="block text-xs font-semibold text-nivel-observar-fg">Sin guardar</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell><CampoNota fila={c} onChange={(raw) => updateCalificacion(i, raw)} /></TableCell>
                      <TableCell className="text-center">
                        <Switch checked={c.entregado} onCheckedChange={() => toggleEntregado(i)} aria-label={`Entregado: ${c.nombre} ${c.apellido}`} />
                      </TableCell>
                      <TableCell><EstadoBadge tono={estado}>{ETIQUETA_ESTADO[estado]}</EstadoBadge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
              Escribe la nota de 0.0 a 5.0 con un decimal (por ejemplo 3.8; también vale 3,8). Solo se guardan las filas que modifiques.
            </p>
          </div>
        )
      ) : selectedActividad ? (
        <div className="rounded-2xl border border-border bg-card">
          <EstadoVacio titulo="Este grupo no tiene estudiantes" descripcion="Registra estudiantes en el grupo para poder calificar esta actividad." />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-input bg-card">
          <EstadoVacio
            titulo={selectedGrupo ? "Ahora elige una actividad" : "Elige un grupo y una actividad"}
            descripcion="Aquí aparecerá la lista del grupo para registrar notas y entregas."
          />
        </div>
      )}

      {isMobile && pendientesDeGuardar > 0 && (
        <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center justify-between gap-3 rounded-2xl bg-foreground py-2.5 pl-4 pr-2.5 text-sm font-semibold text-background shadow-lg">
          <span>{pendientesDeGuardar === 1 ? "1 cambio sin guardar" : `${pendientesDeGuardar} cambios sin guardar`}</span>
          {botonGuardar}
        </div>
      )}
    </div>
  );
};

export default Calificaciones;
