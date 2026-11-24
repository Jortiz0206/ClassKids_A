import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ImagenTema from "./ImagenTema";
import { MODULOS, type ModuloLanding } from "./contenido";

/** Rótulo del módulo: ícono con su color y nombre. */
const Rotulo = ({ m }: { m: ModuloLanding }) => (
  <p className="flex items-center gap-2.5 text-sm font-semibold">
    <span className={cn("grid h-8 w-8 place-items-center rounded-lg text-foreground", m.tono)}><m.icono className="h-4 w-4" aria-hidden="true" /></span>
    {m.nombre}
  </p>
);

const Puntos = ({ puntos }: { puntos: string[] }) => (
  <ul className="mt-6 space-y-3">
    {puntos.map((p) => (
      <li key={p} className="flex gap-3 text-[15px] leading-6">
        <Check className="mt-0.5 h-4 w-4 flex-none text-primary" aria-hidden="true" />{p}
      </li>
    ))}
  </ul>
);

/** Marco sobrio para una captura de módulo. */
const Marco = ({ m, className, recorte }: { m: ModuloLanding; className?: string; recorte?: string }) => (
  <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-40px_hsl(var(--tinta)/0.45)]", className)}>
    <div className={cn("overflow-hidden", recorte)}>
      <ImagenTema captura={m.captura} />
    </div>
  </div>
);

/**
 * Recorrido por los módulos reales con composiciones distintas según su peso:
 * dos filas destacadas, un par, una lista compacta y la franja de administración.
 */
const Plataforma = () => {
  const { calificaciones, analisis, estudiantes, alertas, grupos, actividades, materias, usuarios } = MODULOS;
  return (
    <section id="plataforma" aria-labelledby="titulo-plataforma" className="scroll-mt-24 bg-card px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[75rem]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">La plataforma</p>
            <h2 id="titulo-plataforma" className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl">Explora la plataforma.</h2>
          </div>
          <p className="max-w-md text-lg leading-8 text-muted-foreground lg:col-span-5 lg:justify-self-end">
            Ocho módulos que comparten la misma información. Lo que se registra en uno se refleja en el análisis y en las alertas.
          </p>
        </div>

        {/* Destacado 1: Calificaciones (texto estrecho, captura amplia) */}
        <article className="mt-24 grid gap-10 lg:mt-32 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <Rotulo m={calificaciones} />
            <h3 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.01em]">{calificaciones.titular}</h3>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{calificaciones.descripcion}</p>
            <Puntos puntos={calificaciones.puntos} />
          </div>
          <Marco m={calificaciones} className="lg:col-span-8 lg:-mr-10" recorte="max-h-[460px]" />
        </article>

        {/* Destacado 2: Análisis (orden invertido) */}
        <article className="mt-24 grid gap-10 lg:mt-32 lg:grid-cols-12 lg:items-center">
          <Marco m={analisis} className="lg:order-1 lg:col-span-7 lg:-ml-10" recorte="max-h-[460px]" />
          <div className="lg:order-2 lg:col-span-5 lg:pl-8">
            <Rotulo m={analisis} />
            <h3 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.01em]">{analisis.titular}</h3>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{analisis.descripcion}</p>
            <Puntos puntos={analisis.puntos} />
          </div>
        </article>

        {/* Par: Estudiantes y Alertas, con la captura asomando desde abajo */}
        <div className="mt-24 grid gap-5 lg:mt-32 lg:grid-cols-12">
          {[{ m: estudiantes, tono: "bg-cielo/60", span: "lg:col-span-7" }, { m: alertas, tono: "bg-nivel-alerta/60", span: "lg:col-span-5" }].map(({ m, tono, span }) => (
            <article key={m.id} className={cn("flex flex-col overflow-hidden rounded-3xl", tono, span)}>
              <div className="p-7 sm:p-9">
                <Rotulo m={m} />
                <h3 className="mt-4 text-2xl font-bold leading-tight">{m.titular}</h3>
                <p className="mt-2 max-w-md text-[15px] leading-7 text-muted-foreground">{m.descripcion}</p>
              </div>
              <div className="mt-auto px-7 sm:px-9">
                <div className="h-56 overflow-hidden rounded-t-xl border border-b-0 border-border bg-card sm:h-72"><ImagenTema captura={m.captura} /></div>
              </div>
            </article>
          ))}
        </div>

        {/* Lista compacta: Grupos, Actividades y Materias */}
        <ul className="mt-5 grid divide-y divide-border rounded-3xl border border-border md:grid-cols-3 md:divide-x md:divide-y-0" aria-label="Más módulos">
          {[grupos, actividades, materias].map((m) => (
            <li key={m.id} className="flex flex-col gap-5 p-7">
              <Rotulo m={m} />
              <p className="text-[15px] leading-7 text-muted-foreground">{m.descripcion}</p>
              <div className="mt-auto h-36 overflow-hidden rounded-xl border border-border bg-card"><ImagenTema captura={m.captura} /></div>
            </li>
          ))}
        </ul>

        {/* Administración: franja de contraste, solo para el rol administrador */}
        <article className="mt-5 grid gap-10 overflow-hidden rounded-3xl bg-[#1D2B45] p-7 text-white sm:p-10 lg:grid-cols-12 lg:items-center lg:p-14 dark:bg-background dark:ring-1 dark:ring-border">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#E8E4FF] text-[#1D2B45]"><usuarios.icono className="h-4 w-4" aria-hidden="true" /></span>
              {usuarios.nombre}
            </p>
            <h3 className="mt-5 text-3xl font-bold leading-tight">{usuarios.titular}</h3>
            <p className="mt-4 text-base leading-7 text-white/80">{usuarios.descripcion}</p>
            <ul className="mt-6 space-y-3">
              {usuarios.puntos.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-6"><Check className="mt-0.5 h-4 w-4 flex-none text-[#7FE0B8]" aria-hidden="true" />{p}</li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 lg:col-span-7"><div className="max-h-[380px] overflow-hidden"><ImagenTema captura={usuarios.captura} /></div></div>
        </article>
      </div>
    </section>
  );
};

export default Plataforma;
