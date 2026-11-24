import { BarChart3, BellRing, BookOpen, ClipboardCheck, GraduationCap, Play } from "lucide-react";
import ImagenTema from "./ImagenTema";
import { CAPTURA_PANEL } from "./contenido";

/** Funciones reales que resume la franja bajo la portada (sin cifras). */
const FUNCIONES = [
  { icono: GraduationCap, texto: "Gestión de estudiantes", tono: "bg-lavanda" },
  { icono: ClipboardCheck, texto: "Actividades y calificaciones", tono: "bg-menta" },
  { icono: BarChart3, texto: "Análisis del rendimiento", tono: "bg-cielo" },
  { icono: BellRing, texto: "Alertas tempranas", tono: "bg-mantequilla" },
];

/**
 * Portada: texto e identidad a la izquierda, el panel real a la
 * derecha en un equipo inclinado sobre una luz de color, y una franja con las funciones.
 */
const Hero = () => (
  <section aria-labelledby="titulo-portada" className="relative overflow-hidden">
    <div aria-hidden="true" className="fondo-aurora absolute inset-0" />

    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-10 lg:pb-24 lg:pt-20">
      <div className="animate-fade-in">
        <p className="inline-flex items-center gap-2 rounded-full bg-menta px-4 py-1.5 text-sm font-semibold text-nivel-excelente-fg">
          Aprender <span aria-hidden="true">·</span> Crecer <span aria-hidden="true">·</span> Avanzar
        </p>
        <h1 id="titulo-portada" className="mt-6 text-[2.7rem] font-bold leading-[1.0] tracking-[-0.025em] sm:text-6xl lg:text-[4.2rem]">
          Detecta a tiempo quién necesita <span className="text-primary">apoyo</span> en tu aula.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
          ClassKids acompaña a los docentes en la organización, la evaluación y el seguimiento del crecimiento de cada estudiante.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#recorrido" className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 sm:w-auto text-base font-semibold text-primary-foreground shadow-[0_14px_30px_-14px_hsl(var(--primary)/0.9)] transition hover:-translate-y-0.5 hover:opacity-95">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Conoce ClassKids
          </a>
          <a href="#plataforma" className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/20 bg-card/70 px-6 sm:w-auto text-base font-semibold text-foreground transition-colors hover:bg-secondary">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Explorar módulos
          </a>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Acceso por invitación de tu colegio.</p>
      </div>

      {/* Producto: panel real en un equipo con leve inclinación */}
      <figure className="relative animate-fade-in [animation-delay:150ms] [animation-fill-mode:both]">
        <div aria-hidden="true" className="absolute -inset-6 rounded-[46%_54%_42%_58%/55%_45%_55%_45%] bg-gradient-to-br from-menta via-cielo to-lavanda opacity-90 blur-2xl dark:from-primary/25 dark:via-azul/20 dark:to-[hsl(252_100%_80%/0.18)]" />
        <div className="relative lg:[transform:perspective(2200px)_rotateY(-10deg)_rotateX(4deg)] lg:transition-transform lg:duration-700 motion-safe:lg:hover:[transform:perspective(2200px)_rotateY(-4deg)_rotateX(1deg)]">
          <div className="rounded-[1.4rem] bg-[#1D2B45] p-2 shadow-[0_40px_80px_-30px_hsl(var(--tinta)/0.6)] sm:p-2.5 dark:bg-[#0B1220]">
            <div className="overflow-hidden rounded-[0.9rem] bg-card">
              {/* En el celular se omite el menú lateral de la captura para que el contenido se lea */}
              <div className="max-sm:aspect-[4/3] max-sm:overflow-hidden">
                <ImagenTema captura={CAPTURA_PANEL} prioritaria className="max-sm:ml-[-22.5%] max-sm:w-[125%] max-sm:max-w-none" />
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-b-2xl bg-gradient-to-b from-[#C9D2E3] to-[#9AA6BD] dark:from-[#2A3550] dark:to-[#1A2238]" />
        </div>
        <div className="absolute -left-10 bottom-16 hidden w-40 -rotate-6 rounded-3xl border border-border/80 bg-card/90 p-4 shadow-[0_20px_40px_-20px_hsl(var(--tinta)/0.5)] backdrop-blur lg:block">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-menta text-nivel-excelente-fg"><BarChart3 className="h-5 w-5" aria-hidden="true" /></span>
          <p className="mt-2.5 font-display text-base font-bold leading-tight">Seguimiento académico</p>
        </div>
        <figcaption className="relative mt-6 text-center text-xs text-muted-foreground">Captura real del panel del docente con datos de demostración.</figcaption>
      </figure>
    </div>

    {/* Franja de funciones reales */}
    <div className="relative mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-10">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-3xl border border-border bg-card/95 p-5 shadow-[0_24px_60px_-34px_hsl(var(--tinta)/0.45)] sm:p-7 lg:grid-cols-4 lg:divide-x lg:divide-border lg:gap-0" aria-label="Funciones principales">
        {FUNCIONES.map((f) => (
          <li key={f.texto} className="flex items-center gap-3.5 lg:px-6">
            <span className={`grid h-12 w-12 flex-none place-items-center rounded-2xl text-foreground ${f.tono}`}><f.icono className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-[15px] font-semibold leading-snug">{f.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Hero;
