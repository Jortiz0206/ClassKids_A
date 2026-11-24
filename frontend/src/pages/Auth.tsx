import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Info, Loader2, AlertCircle, ArrowLeft, Users, BellRing, ClipboardList } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Mascota, { SelloMascota } from "@/components/common/Mascota";
import { api } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { noClipboardProps } from "@/lib/passwordField";
import { mensajeDeError } from "@/lib/utils";

/** Traduce el error del inicio de sesión a un mensaje comprensible. */
function mensajeErrorLogin(msg: string): string {
  if (/credentials|invalid|incorrect|401/i.test(msg)) return "El correo o la contraseña no son correctos.";
  if (/desactivad|inactiv|disabled|403/i.test(msg)) return "Tu cuenta está desactivada. Comunícate con la coordinación.";
  if (/fetch|network|conex|failed/i.test(msg)) return "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  return msg || "No pudimos iniciar sesión. Inténtalo de nuevo.";
}

const EnlacesLegales = () => (
  <nav aria-label="Información legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px]">
    <Link to="/legal/terminos" className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">Términos</Link>
    <Link to="/legal/privacidad" className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">Privacidad</Link>
    <Link to="/legal/proteccion-datos" className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">Protección de datos</Link>
  </nav>
);

/** Lado de bienvenida: identidad, mascota y reglas reales del sistema. */
const PanelBienvenida = () => (
  <section className="relative hidden overflow-hidden bg-background lg:flex lg:flex-col lg:justify-between lg:p-12">
    {/* Fondo: degradados suaves de la paleta, sin puntos ni retícula (igual que la landing) */}
    <div aria-hidden="true" className="fondo-aurora absolute inset-0" />
    <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-menta opacity-70 blur-3xl dark:bg-primary/20 dark:opacity-100" />
    <div aria-hidden="true" className="absolute -left-24 bottom-24 h-72 w-72 rounded-full bg-lavanda opacity-70 blur-3xl dark:opacity-60" />
    <div aria-hidden="true" className="absolute -bottom-16 right-16 h-56 w-56 rounded-full bg-durazno opacity-60 blur-3xl dark:opacity-40" />

    <Link to="/" className="relative flex items-center gap-3">
      <SelloMascota className="h-12 w-12" />
      <div>
        <p className="font-display text-xl font-bold leading-tight text-foreground">ClassKids</p>
        <p className="text-sm text-muted-foreground">Aprender · Crecer · Avanzar</p>
      </div>
    </Link>

    <div className="relative max-w-md">
      <h2 className="text-[44px] font-bold leading-[1.05] text-foreground">El progreso de tus grupos, claro y a tiempo</h2>
      <p className="mt-4 text-lg text-muted-foreground">Calificaciones, actividades y alertas tempranas de tus estudiantes en un solo lugar.</p>
    </div>

    <div className="relative h-72">
      <Mascota alt="Mascota de ClassKids saludando" className="absolute bottom-0 left-1/2 h-64 w-44 -translate-x-1/2" />
      <div className="absolute left-0 top-6 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-menta"><ClipboardList className="h-4 w-4" aria-hidden="true" /></span>
        <span className="text-sm font-semibold">Escala 0.0 – 5.0<span className="block text-xs font-medium text-muted-foreground">aprobación desde 3.5</span></span>
      </div>
      <div className="absolute right-0 top-24 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-nivel-alerta text-nivel-alerta-fg"><BellRing className="h-4 w-4" aria-hidden="true" /></span>
        <span className="text-sm font-semibold">Alertas tempranas<span className="block text-xs font-medium text-muted-foreground">promedio inferior a 3.0</span></span>
      </div>
      <div className="absolute bottom-6 left-6 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-lavanda"><Users className="h-4 w-4" aria-hidden="true" /></span>
        <span className="text-sm font-semibold">Grupos y estudiantes<span className="block text-xs font-medium text-muted-foreground">organizados por grado</span></span>
      </div>
    </div>
  </section>
);

/** Encabezado de la versión para celular y tableta (sin el panel lateral). */
const CabeceraCompacta = () => (
  <div className="relative overflow-hidden rounded-3xl bg-background px-5 pb-0 pt-5 lg:hidden">
    <div aria-hidden="true" className="fondo-aurora absolute inset-0" />
    <div aria-hidden="true" className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-menta opacity-70 blur-3xl dark:bg-primary/20 dark:opacity-100" />
    <div className="relative flex items-center gap-3">
      <SelloMascota className="h-11 w-11" />
      <div>
        <p className="font-display text-lg font-bold leading-tight">ClassKids</p>
        <p className="text-[13px] text-muted-foreground">Aprender · Crecer · Avanzar</p>
      </div>
    </div>
    <div className="relative mt-3 flex items-end justify-between gap-2">
      <p className="max-w-[14ch] pb-5 font-display text-2xl font-bold leading-tight">El progreso de tus grupos, claro y a tiempo</p>
      <Mascota className="h-32 w-[88px] flex-none" />
    </div>
  </div>
);

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const authResponse = response as { access_token?: string; token?: string; user?: { id: number; email: string; nombre?: string; apellido?: string; rol?: string } };
      const token = authResponse.access_token || authResponse.token;
      if (!token || !authResponse.user) throw new Error("Respuesta de autenticación inválida");
      login(token, authResponse.user);
      toast.success("¡Bienvenido a ClassKids!");
      navigate("/app", { replace: true });
    } catch (err) {
      const mensaje = mensajeErrorLogin(mensajeDeError(err, ""));
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Escribe tu correo electrónico para enviarte el enlace.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post<{ reset_token?: string }>("/auth/forgot-password", {
        email,
        redirect_to: `${window.location.origin}/reset-password`,
      });
      toast.success("Revisa tu correo para restablecer tu contraseña");
      setResetEnviado(true);
      if (response.reset_token) navigate(`/reset-password?token=${encodeURIComponent(response.reset_token)}`);
    } catch (err) {
      const mensaje = mensajeDeError(err, "No pudimos enviar el enlace de recuperación. Inténtalo de nuevo.");
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const campoCorreo = (id: string) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">Correo electrónico</Label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nombre@institucion.edu.co"
          className="h-12 rounded-xl pl-11 text-[15px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!error}
          aria-describedby={error ? "error-acceso" : undefined}
        />
      </div>
    </div>
  );

  const mensajeError = error && (
    <div id="error-acceso" role="alert" className="flex gap-2.5 rounded-xl bg-nivel-alerta px-3.5 py-3 text-sm font-medium text-nivel-alerta-fg">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );

  return (
    <div className="relative grid min-h-screen bg-card lg:grid-cols-[1.05fr_1fr]">
      <ThemeToggle className="absolute right-4 top-4 z-10" />
      <PanelBienvenida />

      <main className="flex flex-col justify-center px-4 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[420px] space-y-6">
          <CabeceraCompacta />

          {showReset ? (
            <form onSubmit={handleResetPassword} className="space-y-5" noValidate={false}>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Recupera tu contraseña</h1>
                <p className="mt-1.5 text-[15px] text-muted-foreground">Te enviaremos un enlace a tu correo para crear una contraseña nueva.</p>
              </div>
              {campoCorreo("reset-email")}
              {mensajeError}
              {resetEnviado && !error && (
                <div role="status" className="flex gap-2.5 rounded-xl bg-nivel-excelente px-3.5 py-3 text-sm font-medium text-nivel-excelente-fg">
                  <Mascota className="h-8 w-6 flex-none" />
                  <span>Si el correo está registrado, te llegará un enlace válido por 30 minutos.</span>
                </div>
              )}
              <Button type="submit" className="h-12 w-full gap-2 rounded-xl text-[15px]" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando…</> : "Enviar enlace"}
              </Button>
              <button
                type="button"
                onClick={() => { setShowReset(false); setError(""); setResetEnviado(false); }}
                className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-azul hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al inicio de sesión
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Inicia sesión</h1>
                <p className="mt-1.5 text-[15px] text-muted-foreground">Entra con la cuenta que te entregó la coordinación.</p>
              </div>

              {campoCorreo("email")}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type={verPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    className="h-12 rounded-xl pl-11 pr-12 text-[15px]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    aria-describedby="ayuda-password"
                    {...noClipboardProps}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={verPassword}
                    className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {verPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                <p id="ayuda-password" className="text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
              </div>

              <button
                type="button"
                onClick={() => { setShowReset(true); setError(""); }}
                className="text-sm font-semibold text-azul hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>

              {mensajeError}

              <Button type="submit" className="h-12 w-full gap-2 rounded-xl text-[15px]" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Iniciando sesión…</>
                ) : (
                  <>Iniciar sesión <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
                )}
              </Button>

              <div className="flex gap-2.5 rounded-xl bg-secondary px-3.5 py-3 text-[13px] text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                <span>Las cuentas las crea el administrador. Si necesitas acceso, escribe a la coordinación de tu institución.</span>
              </div>
            </form>
          )}

          <EnlacesLegales />
        </div>
      </main>
    </div>
  );
};

export default Auth;
