import { useState, useEffect } from "react";
import { useRecurso } from "@/hooks/useRecurso";
import { Users, GraduationCap, BookOpen, Bell, Search, ArrowRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/dashboard/StatCard";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import RecentStudents from "@/components/dashboard/RecentStudents";
import MisAsignaciones from "@/components/dashboard/MisAsignaciones";
import { useUserRole } from "@/hooks/useUserRole";
import Mascota from "@/components/common/Mascota";
import { toast } from "sonner";
import { contarAlertasActivas, contarEstudiantesActivos } from "@/lib/conteos";

const hoyLargo = () =>
  new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

const Dashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  // Listas compartidas con los componentes del Dashboard (una sola petición por recurso).
  const qGrupos = useRecurso("/grupos");
  const qEst = useRecurso("/estudiantes");
  const qAct = useRecurso("/actividades");
  const qAlertas = useRecurso("/alertas");
  const cargando = qGrupos.isLoading || qEst.isLoading || qAct.isLoading || qAlertas.isLoading;
  const hayError = qGrupos.isError || qEst.isError || qAct.isError || qAlertas.isError;
  const stats = {
    grupos: (qGrupos.data || []).length,
    // Mismos criterios que el panel de administración (H-25): solo estudiantes
    // activos y alertas en estado «active».
    estudiantes: contarEstudiantesActivos(qEst.data || []),
    actividades: (qAct.data || []).length,
    alertas: contarAlertasActivas(qAlertas.data || []),
  };
  const [search, setSearch] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/app/estudiantes?buscar=${encodeURIComponent(search.trim())}`);
  };

  useEffect(() => {
    if (hayError) toast.error("No pudimos cargar los indicadores del Dashboard. Revisa tu conexión.");
  }, [hayError]);

  const nombre = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || "Docente";
  const valor = (n: number) => (cargando ? "…" : n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Resumen de la jornada · <span className="normal-case tracking-normal">{hoyLargo()}</span>
          </p>
          <h1 className="mt-1 text-[28px] font-bold leading-tight text-foreground sm:text-[34px]">Hola, {nombre}</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">{isAdmin ? "Así va la institución hoy." : "Así van tus materias, grupos y estudiantes hoy."}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <form onSubmit={handleSearch} role="search" className="relative flex-1 lg:flex-none">
            <label htmlFor="buscar-estudiante" className="sr-only">Buscar estudiante</label>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="buscar-estudiante"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar estudiante..."
              className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-[15px] transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 lg:w-[260px]"
            />
          </form>
          <Link
            to="/app/alertas"
            aria-label={`Ver alertas (${stats.alertas} activas)`}
            className="relative grid h-11 w-11 flex-none place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-secondary"
          >
            <Bell className="h-5 w-5 text-foreground" aria-hidden="true" />
            {stats.alertas > 0 && (
              <span aria-hidden="true" className="absolute -right-2 -top-2 grid h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-background bg-destructive px-1 text-xs font-bold text-destructive-foreground">
                {stats.alertas}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="sombra-tarjeta relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-menta via-cielo to-lavanda p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pl-32">
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-card/40 blur-3xl" />
        <Mascota className="absolute bottom-2 left-7 hidden h-24 w-16 sm:block" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Mantén el seguimiento al día</h2>
          <p className="mt-0.5 text-[15px] text-muted-foreground">Registra una actividad o revisa los casos que necesitan atención.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/actividades" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nueva actividad
          </Link>
          <Link to="/app/alertas" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            Revisar alertas <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Grupos" value={valor(stats.grupos)} tono="bg-lavanda" delay={0} />
        <StatCard icon={GraduationCap} label="Estudiantes" value={valor(stats.estudiantes)} tono="bg-cielo" delay={60} />
        <StatCard icon={BookOpen} label="Actividades" value={valor(stats.actividades)} tono="bg-durazno" delay={120} />
        <StatCard icon={Bell} label="Alertas activas" value={valor(stats.alertas)} tono="bg-nivel-alerta text-nivel-alerta-fg" delay={180} />
      </div>

      {/* El docente ve primero cada materia que dicta en cada grupo (H-08). */}
      {!isAdmin && <MisAsignaciones />}

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3"><PerformanceChart /></div>
        <div className="xl:col-span-2"><AlertsPanel /></div>
      </div>

      <RecentStudents />
    </div>
  );
};

export default Dashboard;
