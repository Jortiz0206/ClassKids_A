import { contarAlertasActivas } from "@/lib/conteos";
import { useRecurso } from "./useRecurso";

/**
 * Número de alertas activas para la insignia de la navegación. Usa el mismo criterio que
 * el Dashboard y el panel de administración (H-25) y comparte la lista de alertas con ellos
 * (una sola petición cuando se muestran a la vez).
 */
export function useAlertasActivas(): number {
  const { data } = useRecurso<{ estado?: string }>("/alertas");
  return contarAlertasActivas(data || []);
}
