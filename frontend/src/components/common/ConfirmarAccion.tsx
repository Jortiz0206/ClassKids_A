import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmarAccionProps {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoConfirmar: string;
  onConfirmar: () => void | Promise<void>;
  onCancelar: () => void;
  procesando?: boolean;
}

/**
 * Diálogo de confirmación para acciones que borran o desactivan datos.
 * Reemplaza el `confirm()` nativo del navegador, que no seguía el diseño ni el tema,
 * y agrega confirmación donde antes no había (Materias).
 */
const ConfirmarAccion = ({ abierto, titulo, descripcion, textoConfirmar, onConfirmar, onCancelar, procesando = false }: ConfirmarAccionProps) => (
  <Dialog open={abierto} onOpenChange={(v) => { if (!v && !procesando) onCancelar(); }}>
    <DialogContent className="max-w-md rounded-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">{titulo}</DialogTitle>
        <DialogDescription className="text-[15px]">{descripcion}</DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" className="rounded-xl" onClick={onCancelar} disabled={procesando}>Cancelar</Button>
        <Button variant="destructive" className="rounded-xl" onClick={onConfirmar} disabled={procesando}>
          {procesando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />}
          {textoConfirmar}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmarAccion;
