import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Proposito from "@/components/landing/Proposito";
import Plataforma from "@/components/landing/Plataforma";
import Seguimiento from "@/components/landing/Seguimiento";
import RecorridoVideo from "@/components/landing/RecorridoVideo";
import CierreLanding from "@/components/landing/CierreLanding";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * Página pública de ClassKids. Esta página solo decide el destino de los botones de acceso
 * según la sesión; cada sección vive en components/landing y su contenido en contenido.ts.
 */
const Landing = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const destino = user ? (isAdmin ? "/admin" : "/app") : "/auth";
  const acceso = { destino, conSesion: !!user };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader {...acceso} />
      <main>
        <Hero />
        <Proposito />
        <Seguimiento />
        <Plataforma />
        <RecorridoVideo />
        <CierreLanding {...acceso} />
      </main>
      <LandingFooter {...acceso} />
    </div>
  );
};

export default Landing;
