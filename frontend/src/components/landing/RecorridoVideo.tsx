import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { VIDEO_PORTADA, VIDEO_RECORRIDO } from "./contenido";

const MODULOS_DEL_VIDEO = ["Dashboard", "Estudiantes", "Calificaciones", "Análisis", "Alertas", "Grupos", "Actividades", "Materias"];

/** Volumen con el que arranca la música: discreto, el video no tiene narración. */
const VOLUMEN_INICIAL = 0.4;

/**
 * «Conoce cómo funciona ClassKids»: el recorrido en video REAL (grabación de la app en el
 * entorno de pruebas, datos de demostración) con música instrumental original.
 * Nunca se reproduce solo: empieza cuando la persona pulsa «Ver video» o el control del
 * reproductor. La música se puede silenciar y ajustar con controles propios, además de los
 * del navegador. Si no hay archivo configurado, la sección no se muestra.
 */
const RecorridoVideo = () => {
  const video = useRef<HTMLVideoElement>(null);
  const [silenciado, setSilenciado] = useState(false);
  const [volumen, setVolumen] = useState(VOLUMEN_INICIAL);

  // Volumen inicial discreto y sincronía con los controles nativos del reproductor.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.volume = VOLUMEN_INICIAL;
    const alCambiar = () => { setSilenciado(v.muted || v.volume === 0); setVolumen(v.volume); };
    v.addEventListener("volumechange", alCambiar);
    return () => v.removeEventListener("volumechange", alCambiar);
  }, []);

  if (!VIDEO_RECORRIDO) return null;

  const reproducir = () => {
    video.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    void video.current?.play();
  };

  const alternarMusica = () => {
    const v = video.current;
    if (!v) return;
    if (v.muted || v.volume === 0) {
      v.muted = false;
      if (v.volume === 0) v.volume = VOLUMEN_INICIAL;
    } else {
      v.muted = true;
    }
  };

  const cambiarVolumen = (valor: number) => {
    const v = video.current;
    if (!v) return;
    v.volume = valor;
    v.muted = valor === 0;
  };

  return (
    <section id="recorrido" aria-labelledby="titulo-recorrido" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-[75rem] items-center gap-10 rounded-[2rem] border border-border bg-card p-4 shadow-[0_40px_90px_-60px_hsl(var(--tinta)/0.6)] sm:p-6 lg:grid-cols-12 lg:gap-12 lg:p-8">
        <div className="overflow-hidden rounded-2xl bg-[#1D2B45] p-1.5 lg:col-span-8">
          <video
            ref={video}
            src={VIDEO_RECORRIDO}
            poster={VIDEO_PORTADA}
            controls
            playsInline
            preload="metadata"
            aria-label="Recorrido en video por los módulos de ClassKids, con música instrumental"
            className="aspect-video w-full rounded-xl bg-black object-contain"
          />
        </div>
        <div className="lg:col-span-4 lg:pr-4">
          <h2 id="titulo-recorrido" className="text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl">Conoce cómo funciona ClassKids</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Un recorrido real por la plataforma, del inicio de sesión al seguimiento de una alerta, con los datos de demostración.</p>
          <button type="button" onClick={reproducir} className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:opacity-95">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Ver video
          </button>

          {/* Controles de la música */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border px-3 py-2.5" role="group" aria-label="Música del video">
            <button
              type="button"
              onClick={alternarMusica}
              aria-pressed={!silenciado}
              aria-label={silenciado ? "Activar la música" : "Silenciar la música"}
              title={silenciado ? "Activar la música" : "Silenciar la música"}
              className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/70"
            >
              {silenciado ? <VolumeX className="h-[18px] w-[18px]" aria-hidden="true" /> : <Volume2 className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
            <label htmlFor="volumen-recorrido" className="text-sm font-semibold">Volumen<span className="sr-only"> de la música</span></label>
            <input
              id="volumen-recorrido"
              type="range"
              min={0}
              max={100}
              step={5}
              value={silenciado ? 0 : Math.round(volumen * 100)}
              onChange={(e) => cambiarVolumen(Number(e.target.value) / 100)}
              aria-valuetext={silenciado ? "Silenciada" : `${Math.round(volumen * 100)} %`}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
            />
          </div>

          <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="Módulos que muestra el video">
            {MODULOS_DEL_VIDEO.map((m) => <li key={m} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">{m}</li>)}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Con música instrumental original. Muestra la plataforma con los datos de demostración.</p>
        </div>
      </div>
    </section>
  );
};

export default RecorridoVideo;
