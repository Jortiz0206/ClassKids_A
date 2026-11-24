import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearMateria } from "@/api/materias";

interface NuevaMateriaDialogProps {
  abierto: boolean;
  onCambiarAbierto: (abierto: boolean) => void;
  /** Se llama después de crear la materia, para recargar la lista. */
  onCreada: () => void;
}

/** Formulario para crear una materia. Guarda su propio estado del campo. */
const NuevaMateriaDialog = ({ abierto, onCambiarAbierto, onCreada }: NuevaMateriaDialogProps) => {
  const [nombre, setNombre] = useState("");

  const crear = async () => {
    if (!nombre.trim()) { toast.error("Ingresa el nombre de la materia"); return; }
    try {
      await crearMateria(nombre.trim());
      toast.success("¡Materia creada con éxito!");
      onCambiarAbierto(false);
      setNombre("");
      onCreada();
    } catch {
      toast.error("Error al crear materia");
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCambiarAbierto}>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Crear nueva materia</DialogTitle>
          <DialogDescription>Ingresa el nombre de la asignatura académica.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label className="font-semibold">Nombre de la materia</Label>
            <Input placeholder="Ej: Matemáticas Avanzadas" value={nombre} onChange={(e) => setNombre(e.target.value)} className="rounded-2xl" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onCambiarAbierto(false)} className="rounded-2xl">Cancelar</Button>
          <Button onClick={crear} className="rounded-2xl">Crear Materia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NuevaMateriaDialog;
