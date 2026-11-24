import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SelloMascota } from "@/components/common/Mascota";
import { CONTACT_EMAIL } from "@/lib/contact";

interface CierreLandingProps {
  destino: string;
  conSesion: boolean;
}

/** Cierre breve: una frase grande, el logo original y dos accesos. */
const CierreLanding = ({ destino, conSesion }: CierreLandingProps) => (
  <section aria-labelledby="titulo-cierre" className="px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
    <div className="mx-auto max-w-[75rem] overflow-hidden rounded-[2rem] bg-[#1D2B45] px-6 py-16 text-white sm:px-12 lg:px-20 lg:py-24 dark:bg-card dark:ring-1 dark:ring-border">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3">
            <SelloMascota className="h-12 w-12 rounded-2xl" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Aprender · Crecer · Avanzar</p>
          </div>
          <h2 id="titulo-cierre" className="mt-8 text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-6xl">
            Menos tiempo buscando datos. <span className="text-[#7FE0B8]">Más tiempo acompañando.</span>
          </h2>
        </div>
        <div className="lg:col-span-4">
          <p className="text-base leading-7 text-white/80">El acceso se otorga por invitación institucional. Si tu colegio ya tiene cuenta, ingresa; si quieres conocer ClassKids, escríbenos.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link to={destino} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-[#1D2B45] transition hover:-translate-y-0.5">
              {conSesion ? "Ir al panel" : "Iniciar sesión"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CierreLanding;
