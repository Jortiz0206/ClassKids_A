import { ArrowRight, BellRing, BookOpen, ClipboardCheck, Library, Users } from "lucide-react";
import { REGLA_ALERTA } from "./contenido";

const CONECTADOS = [
  { nombre: "Grupos", icono: Users, tono: "bg-lavanda" },
  { nombre: "Materias", icono: Library, tono: "bg-mantequilla" },
  { nombre: "Actividades", icono: BookOpen, tono: "bg-durazno" },
  { nombre: "Notas", icono: ClipboardCheck, tono: "bg-menta" },
];

const ESTADOS = [
  { nombre: "Activa", clase: "bg-nivel-alerta text-nivel-alerta-fg" },
  { nombre: "En revisión", clase: "bg-nivel-observar text-nivel-observar-fg" },
  { nombre: "Resuelta", clase: "bg-nivel-excelente text-nivel-excelente-fg" },
];

/**
 * El problema que resuelve ClassKids, en composición editorial: una afirmación grande a la
 * izquierda y tres propósitos a la derecha, cada uno con un detalle real de la interfaz.
 */
const Proposito = () => (
  <section id="proposito" aria-labelledby="titulo-proposito" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
    <div className="mx-auto grid max-w-[75rem] gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">El propósito</p>
          <h2 id="titulo-proposito" className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            Las señales ya están en las notas. ClassKids las hace visibles a tiempo.
          </h2>
          <a href="#metodo" className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-8 hover:text-primary">
            Ver cómo funciona <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <ol className="divide-y divide-border border-y border-border lg:col-span-7">
        <li className="grid gap-6 py-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Seguimiento</p>
            <h3 className="mt-3 text-2xl font-bold">Toda la información académica, ordenada.</h3>
            <p className="mt-2 max-w-md text-base leading-7 text-muted-foreground">Grupos, materias, actividades y notas conectados entre sí, en lugar de repartidos en archivos.</p>
          </div>
          <ul className="flex flex-wrap gap-1.5 justify-self-start text-sm font-semibold sm:max-w-[13rem] sm:justify-self-end" aria-label="Información conectada en ClassKids">
            {CONECTADOS.map((c) => <li key={c.nombre} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-foreground ${c.tono}`}><c.icono className="h-3.5 w-3.5" aria-hidden="true" />{c.nombre}</li>)}
          </ul>
        </li>
        <li className="grid gap-6 py-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Detección temprana</p>
            <h3 className="mt-3 text-2xl font-bold">Las dificultades se reconocen antes.</h3>
            <p className="mt-2 max-w-md text-base leading-7 text-muted-foreground">Al registrar una nota, si el promedio acumulado del estudiante baja de {REGLA_ALERTA.toFixed(1)}, ClassKids crea una alerta.</p>
          </div>
          <p className="flex items-center gap-3 justify-self-start rounded-2xl border border-border bg-card px-4 py-3 text-sm sm:justify-self-end">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-nivel-alerta text-nivel-alerta-fg"><BellRing className="h-4 w-4" aria-hidden="true" /></span>
            <span><span className="block font-semibold">Promedio acumulado</span><span className="text-muted-foreground">inferior a {REGLA_ALERTA.toFixed(1)}</span></span>
          </p>
        </li>
        <li className="grid gap-6 py-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Decisión docente</p>
            <h3 className="mt-3 text-2xl font-bold">El docente decide, con evidencia.</h3>
            <p className="mt-2 max-w-md text-base leading-7 text-muted-foreground">Cada caso queda registrado con su estado y su acompañamiento. ClassKids informa; no decide por nadie.</p>
          </div>
          <ul className="flex flex-wrap gap-1.5 justify-self-start text-sm font-semibold sm:justify-self-end" aria-label="Estados de una alerta">
            {ESTADOS.map((e) => <li key={e.nombre} className={`rounded-full px-3 py-1.5 ${e.clase}`}>{e.nombre}</li>)}
          </ul>
        </li>
      </ol>
    </div>
  </section>
);

export default Proposito;
