import Mascota from "@/components/common/Mascota";

interface LoadingScreenProps {
  label?: string;
}

/** Pantalla de carga inicial (sesión y rol). Usa la mascota con una animación suave. */
const LoadingScreen = ({ label = "Cargando" }: LoadingScreenProps) => (
  <div role="status" aria-live="polite" className="fondo-aurora flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
    <div className="relative grid h-28 w-28 place-items-center">
      <span className="absolute inset-0 rounded-full bg-menta animate-pulse-gentle" />
      <Mascota className="relative h-20 w-14 animate-fade-in" />
    </div>
    <div className="flex flex-col items-center gap-1">
      <p className="font-display text-xl font-bold text-foreground">ClassKids</p>
      <p className="text-sm text-muted-foreground">{label}…</p>
    </div>
  </div>
);

export default LoadingScreen;
