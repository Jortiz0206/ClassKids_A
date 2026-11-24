import { cn } from "@/lib/utils";
import ImagenTema from "./ImagenTema";
import { PANTALLAS_FLUJO, REGLA_ALERTA, type Captura } from "./contenido";

/** Cómo se encadenan nota, promedio, alerta y seguimiento (reglas reales del sistema). */
const FLUJO = [
  { paso: "Calificación", texto: "El docente escribe la nota de 0 a 100 y ve al instante su equivalencia en la escala 0.0 – 5.0." },
  { paso: "Promedio", texto: "ClassKids calcula el promedio de cada estudiante, grupo y materia." },
  { paso: "Alerta", texto: `Al registrar una nota, si el promedio acumulado del estudiante baja de ${REGLA_ALERTA.toFixed(1)}, se crea una alerta.` },
  { paso: "Seguimiento", texto: "El docente revisa el caso, deja observaciones en la ficha del estudiante y marca la alerta como resuelta." },
];

/** Un teléfono con una captura real de la app en el celular. */
const Telefono = ({ captura, rotulo, className }: { captura: Captura; rotulo: string; className?: string }) => (
  <figure className={cn("flex-none snap-center", className)}>
    <div className="rounded-[2rem] bg-[#1D2B45] p-[7px] shadow-[0_34px_70px_-34px_hsl(var(--tinta)/0.65)] dark:bg-[#0B1220] dark:ring-1 dark:ring-white/10">
      <div className="overflow-hidden rounded-[1.6rem] bg-card">
        <ImagenTema captura={captura} />
      </div>
    </div>
    <figcaption className="mt-3 text-center text-sm font-semibold">{rotulo}</figcaption>
  </figure>
);

/**
 * «Un flujo simple…»: el flujo real a la izquierda y, a la derecha, tres pantallas reales
 * de la app en el celular (datos de demostración) que muestran ese flujo en uso.
 */
const Seguimiento = () => (
  <section id="metodo" aria-labelledby="titulo-metodo" className="scroll-mt-24 overflow-hidden px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
    <div className="mx-auto max-w-[75rem]">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Del registro al acompañamiento</p>
        <h2 id="titulo-metodo" className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl">Un flujo simple para decisiones más oportunas.</h2>
      </div>

      <div className="mt-16 grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Flujo: una línea vertical une los cuatro pasos */}
        <ol className="relative lg:col-span-5">
          <span aria-hidden="true" className="absolute bottom-6 left-[11px] top-6 w-px bg-border" />
          {FLUJO.map((f, i) => (
            <li key={f.paso} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-5 pb-10 last:pb-0">
              <span className="relative mt-1 grid h-6 w-6 place-items-center rounded-full border-2 border-primary bg-background text-[11px] font-bold text-primary">{i + 1}</span>
              <div>
                <h3 className="text-xl font-bold">{f.paso}</h3>
                <p className="mt-1.5 text-[15px] leading-7 text-muted-foreground">{f.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Pantallas reales en el celular */}
        <div className="relative lg:col-span-7">
          <div aria-hidden="true" className="absolute inset-x-[8%] inset-y-[6%] rounded-[46%_54%_42%_58%/55%_45%_55%_45%] bg-gradient-to-br from-menta via-cielo to-lavanda opacity-80 blur-2xl dark:from-primary/20 dark:via-azul/15 dark:to-[hsl(252_100%_80%/0.14)]" />
          <div className="relative -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:justify-center sm:gap-0 sm:overflow-visible sm:px-0 sm:pb-0" aria-label="Pantallas reales de ClassKids en el celular">
            <Telefono captura={PANTALLAS_FLUJO.calificacion} rotulo="1 · Calificación" className="w-[62%] sm:z-0 sm:mt-14 sm:w-[31%] sm:-rotate-6 sm:translate-x-6" />
            <Telefono captura={PANTALLAS_FLUJO.alerta} rotulo="3 · Alerta" className="w-[62%] sm:z-10 sm:w-[34%]" />
            <Telefono captura={PANTALLAS_FLUJO.seguimiento} rotulo="4 · Seguimiento" className="w-[62%] sm:z-0 sm:mt-14 sm:w-[31%] sm:rotate-6 sm:-translate-x-6" />
          </div>
          <p className="relative mt-6 text-center text-xs text-muted-foreground">Capturas reales de ClassKids en el celular, con datos ficticios de demostración.</p>
        </div>
      </div>
    </div>
  </section>
);

export default Seguimiento;
