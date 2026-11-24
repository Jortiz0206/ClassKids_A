import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { aLista } from "@/lib/listas";
import { useAuth } from "@/contexts/AuthContext";

export type RutaRecurso = "/grupos" | "/estudiantes" | "/actividades" | "/alertas" | "/materias" | "/calificaciones" | "/asignaciones";

/**
 * Lista de un recurso de la API compartida entre componentes (TanStack Query).
 *
 * Varios componentes del Dashboard pedían la misma lista por separado (13 peticiones para
 * 6 recursos). Con una clave común, los componentes que se montan a la vez comparten una sola
 * petición. `staleTime: 0` hace que cada pantalla vuelva a pedir los datos al abrirse: no se
 * muestran datos viejos después de guardar algo en otra pantalla.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRecurso<T = any>(ruta: RutaRecurso) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recurso", ruta],
    enabled: !!user,
    staleTime: 0,
    retry: false,
    queryFn: async () => aLista<T>(await api.get(ruta)),
  });
}
