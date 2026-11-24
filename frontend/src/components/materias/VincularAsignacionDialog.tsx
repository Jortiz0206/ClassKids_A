import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crearAsignacion } from "@/api/materias";
import { asignacionExiste, nombreDocente, type Asignacion, type Docente, type GrupoBasico, type Materia } from "@/lib/materias";

interface VincularAsignacionDialogProps {
  abierto: boolean;
  onCambiarAbierto: (abierto: boolean) => void;
  docentes: Docente[];
  materias: Materia[];
  grupos: GrupoBasico[];
  /** Asignaciones actuales, para no repetir materia y grupo. */
  asignaciones: Asignacion[];
  onVinculada: () => void;
}

/** Formulario para vincular una materia a un grupo con su docente. */
const VincularAsignacionDialog = ({ abierto, onCambiarAbierto, docentes, materias, grupos, asignaciones, onVinculada }: VincularAsignacionDialogProps) => {
  const [docenteId, setDocenteId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [grupoId, setGrupoId] = useState("");

  const vincular = async () => {
    if (!materiaId || !grupoId || !docenteId) { toast.error("Selecciona docente, materia y grupo"); return; }
    if (asignacionExiste(asignaciones, materiaId, grupoId)) { toast.error("Esta asignación ya existe para este grupo"); return; }
    try {
      await crearAsignacion(docenteId, materiaId, grupoId);
      toast.success("¡Asignación vinculada!");
      onCambiarAbierto(false);
      setMateriaId("");
      setGrupoId("");
      setDocenteId("");
      onVinculada();
    } catch {
      toast.error("Error al crear asignación");
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCambiarAbierto}>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Vincular Materia a Grupo</DialogTitle>
          <DialogDescription>Selecciona el docente, la materia y el grupo escolar correspondiente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label className="font-semibold">Docente</Label>
            <Select value={docenteId} onValueChange={setDocenteId}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Seleccionar docente" /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                {docentes.map((d) => <SelectItem key={d.id} value={d.id}>{nombreDocente(d)} ({d.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Materia</Label>
            <Select value={materiaId} onValueChange={setMateriaId}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                {materias.map((m) => <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Grupo</Label>
            <Select value={grupoId} onValueChange={setGrupoId}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Seleccionar grupo" /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                {grupos.map((g) => <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onCambiarAbierto(false)} className="rounded-2xl">Cancelar</Button>
          <Button onClick={vincular} className="rounded-2xl">Vincular</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VincularAsignacionDialog;
