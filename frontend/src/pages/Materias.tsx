import { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2, Link2, Unlink, Search, Library, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import ConfirmarAccion from "@/components/common/ConfirmarAccion";
import NuevaMateriaDialog from "@/components/materias/NuevaMateriaDialog";
import VincularAsignacionDialog from "@/components/materias/VincularAsignacionDialog";
import { cargarDatosMaterias, eliminarAsignacion, eliminarMateria, type DatosMaterias } from "@/api/materias";
import { asignacionesPorGrupo, contarGruposDeMateria, contarGruposSinAsignar, filtrarMaterias } from "@/lib/materias";
import { useUserRole } from "@/hooks/useUserRole";

const SIN_DATOS: DatosMaterias = { materias: [], grupos: [], asignaciones: [], docentes: [] };

const Materias = () => {
  const [datos, setDatos] = useState<DatosMaterias>(SIN_DATOS);
  const { materias, grupos, asignaciones, docentes } = datos;
  const [loading, setLoading] = useState(true);

  // Filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Diálogos (cada formulario guarda su propio estado)
  const [materiaDialog, setMateriaDialog] = useState(false);
  const [asignacionDialog, setAsignacionDialog] = useState(false);

  const { isAdmin } = useUserRole();

  const fetchData = async () => {
    setLoading(true);
    try {
      setDatos(await cargarDatosMaterias(isAdmin));
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [isAdmin]);

  // Confirmación antes de eliminar o desvincular (antes se borraba con un solo clic: H-39).
  const [confirmacion, setConfirmacion] = useState<null | { tipo: "materia" | "asignacion"; id: string; nombre: string }>(null);
  const [procesando, setProcesando] = useState(false);

  const handleDeleteMateria = async (id: string) => {
    try {
      await eliminarMateria(id);
      toast.success("Materia eliminada");
      fetchData();
    } catch (error) {
      toast.error("No se pudo eliminar la materia. Si tiene actividades o asignaciones, primero desvincúlalas.");
    }
  };

  const handleDeleteAsignacion = async (id: string) => {
    try {
      await eliminarAsignacion(id);
      toast.success("Asignación desvinculada");
      fetchData();
    } catch (error) {
      toast.error("No se pudo desvincular la asignación. Inténtalo de nuevo.");
    }
  };

  const confirmar = async () => {
    if (!confirmacion) return;
    setProcesando(true);
    try {
      if (confirmacion.tipo === "materia") await handleDeleteMateria(confirmacion.id);
      else await handleDeleteAsignacion(confirmacion.id);
    } finally {
      setProcesando(false);
      setConfirmacion(null);
    }
  };

  const filteredMaterias = filtrarMaterias(materias, searchTerm);
  const asignacionesByGrupo = asignacionesPorGrupo(grupos, asignaciones);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary animate-bounce" />
          <p className="text-sm text-muted-foreground font-medium">Cargando materias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader eyebrow="Estructura académica" title="Materias y asignaciones" description={isAdmin ? "Organiza asignaturas y vincúlalas con los grupos" : "Tus materias y los grupos donde las dictas"} icon={Library} tono="bg-mantequilla" actions={isAdmin && <div className="flex items-center gap-3">
          <Button onClick={() => setMateriaDialog(true)} className="gap-2 rounded-2xl shadow-md" size="sm">
            <Plus className="w-4 h-4" /> Nueva Materia
          </Button>
          <Button onClick={() => setAsignacionDialog(true)} variant="secondary" className="gap-2 rounded-2xl shadow-sm" size="sm" disabled={materias.length === 0 || grupos.length === 0}>
            <Link2 className="w-4 h-4" /> Vincular a Grupo
          </Button>
        </div>} />

      {/* Indicadores: mismo componente que el resto de módulos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label={isAdmin ? "Materias totales" : "Mis materias"} value={materias.length} tono="bg-menta" />
        <StatCard icon={Link2} label={isAdmin ? "Asignaciones activas" : "Mis asignaciones"} value={asignaciones.length} tono="bg-cielo" delay={60} />
        {isAdmin
          ? <StatCard icon={Unlink} label="Grupos sin asignar" value={contarGruposSinAsignar(grupos, asignaciones)} tono="bg-mantequilla" delay={120} />
          : <StatCard icon={Users} label="Mis grupos" value={grupos.length} tono="bg-mantequilla" delay={120} />}
      </div>

      {/* Contenido principal en Pestañas */}
      <Tabs defaultValue="materias" className="space-y-6">
        <TabsList className="bg-secondary p-1 rounded-2xl">
          <TabsTrigger value="materias" className="rounded-xl px-6 font-semibold">Catálogo de Materias</TabsTrigger>
          <TabsTrigger value="asignaciones" className="rounded-xl px-6 font-semibold">Vista por Grupos</TabsTrigger>
        </TabsList>

        {/* Pestaña: Materias */}
        <TabsContent value="materias" className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar materia..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl bg-background border-border"
              />
            </div>
          </div>

          <Card className="rounded-3xl border-border overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead className="font-bold">Materia</TableHead>
                    <TableHead className="text-center font-bold">Grupos Asignados</TableHead>
                    <TableHead className="w-[80px] text-right font-bold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterias.map((m) => {
                    const gruposCount = contarGruposDeMateria(asignaciones, m.id);
                    return (
                      <TableRow key={m.id} className="hover:bg-secondary/60 transition-colors">
                        <TableCell className="font-semibold text-sm text-foreground py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          {m.nombre}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs font-bold">
                            {gruposCount} {gruposCount === 1 ? 'grupo' : 'grupos'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive" aria-label={`Eliminar la materia ${m.nombre}`} onClick={() => setConfirmacion({ tipo: "materia", id: m.id, nombre: m.nombre })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredMaterias.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron materias registradas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Asignaciones por grupo */}
        <TabsContent value="asignaciones" className="space-y-4">
          {asignacionesByGrupo.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-full bg-cielo flex items-center justify-center mx-auto">
                <Link2 className="w-6 h-6 text-nivel-aprobado-fg" />
              </div>
              <p className="text-sm font-semibold text-foreground">Aún no hay asignaciones creadas</p>
              <p className="text-xs text-muted-foreground">Vincula materias a tus grupos para empezar a organizarte.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {asignacionesByGrupo.map((g) => (
                <Card key={g.id} className="rounded-3xl border-border shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        {g.nombre}
                      </h3>
                      <Badge variant="outline" className="rounded-full text-xs font-semibold">
                        {g.materias.length} {g.materias.length === 1 ? 'materia' : 'materias'}
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {g.materias.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border group">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-foreground">{a.materia_nombre}</span>
                              <p className="text-xs text-muted-foreground">{a.docente || "Docente sin nombre"}</p>
                            </div>
                          </div>
                          {isAdmin && <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                            aria-label="Desvincular asignación"
                            onClick={() => setConfirmacion({ tipo: "asignacion", id: a.id, nombre: "esta asignación" })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NuevaMateriaDialog abierto={materiaDialog} onCambiarAbierto={setMateriaDialog} onCreada={fetchData} />
      <VincularAsignacionDialog
        abierto={asignacionDialog}
        onCambiarAbierto={setAsignacionDialog}
        docentes={docentes}
        materias={materias}
        grupos={grupos}
        asignaciones={asignaciones}
        onVinculada={fetchData}
      />
      <ConfirmarAccion
        abierto={!!confirmacion}
        titulo={confirmacion?.tipo === "materia" ? `¿Eliminar la materia ${confirmacion?.nombre}?` : "¿Desvincular esta asignación?"}
        descripcion={confirmacion?.tipo === "materia"
          ? "La materia se borrará del catálogo. Si tiene actividades o asignaciones, la base de datos no permitirá eliminarla."
          : "El docente dejará de estar asignado a esta materia en el grupo. Las calificaciones registradas no se borran."}
        textoConfirmar={confirmacion?.tipo === "materia" ? "Eliminar materia" : "Desvincular"}
        onConfirmar={confirmar}
        onCancelar={() => setConfirmacion(null)}
        procesando={procesando}
      />
    </div>
  );
};

export default Materias;