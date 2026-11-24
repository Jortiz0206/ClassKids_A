import { cn } from "@/lib/utils";
import type { Captura } from "./contenido";

interface ImagenTemaProps {
  captura: Captura;
  className?: string;
  /** Carga inmediata solo para lo que se ve al abrir la página. */
  prioritaria?: boolean;
}

/**
 * Captura real en el tema activo: existen las dos versiones y CSS oculta la que no aplica
 * (la oculta no se descarga si es diferida ni la leen los lectores de pantalla).
 */
const ImagenTema = ({ captura, className, prioritaria = false }: ImagenTemaProps) => {
  const comunes = {
    alt: captura.alt,
    width: captura.ancho,
    height: captura.alto,
    loading: prioritaria ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    draggable: false,
  };
  return (
    <>
      <img src={captura.claro} {...comunes} className={cn("block h-auto w-full select-none dark:hidden", className)} />
      <img src={captura.oscuro} {...comunes} className={cn("hidden h-auto w-full select-none dark:block", className)} />
    </>
  );
};

export default ImagenTema;
