import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ghost, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Intento de acceso a ruta inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-6">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="text-center max-w-md w-full bg-card p-10 rounded-3xl shadow-lg border border-border">
        {/* Icono decorativo */}
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ghost className="w-10 h-10 text-primary animate-bounce" />
        </div>
        
        <h1 className="font-display text-6xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">¡Página no encontrada!</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Parece que te has perdido en el aula. No te preocupes, esto le pasa hasta a los mejores estudiantes. 
          Vamos a regresar al panel principal.
        </p>
        
        <Link to="/">
          <Button className="w-full gap-2 rounded-2xl h-12 font-semibold shadow-md shadow-primary/20">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;