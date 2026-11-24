import mascota from "@/assets/mascota-classkids.png";
import { cn } from "@/lib/utils";

interface MascotaProps {
  className?: string;
  /** Texto alternativo. Si la mascota es decorativa, déjelo vacío. */
  alt?: string;
}

/**
 * Mascota y logo de ClassKids (la plantita). Uso acordado: bienvenidas, estados vacíos,
 * mensajes positivos y algunas cargas. No se usa en tablas, alertas ni formularios.
 *
 * REGLA DEL EQUIPO: se usa el archivo original sin modificarlo (ni colores, ni formas, ni
 * recorte). Solo se ajustan tamaño, posición y presentación. Como el recorte original tiene
 * un borde claro, en modo oscuro se presenta sobre una placa clara en lugar de editar la imagen.
 */
const Mascota = ({ className, alt = "" }: MascotaProps) => (
  <img
    src={mascota}
    alt={alt}
    aria-hidden={alt ? undefined : true}
    draggable={false}
    className={cn("select-none object-contain dark:rounded-2xl dark:bg-[#F6F8FC] dark:p-1.5", className)}
  />
);

/**
 * Sello cuadrado con el logo: marca de ClassKids en menús y encabezados. La placa es menta
 * claro en los dos temas, para que el borde claro del recorte original no se note.
 */
export const SelloMascota = ({ className }: { className?: string }) => (
  <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl bg-[#DDF4EA]", className)}>
    <img src={mascota} alt="" aria-hidden="true" draggable={false} className="h-[78%] w-[78%] select-none object-contain" />
  </span>
);

export default Mascota;
