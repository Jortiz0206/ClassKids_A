import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "docente";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Si tu objeto usuario guardado en FastAPI ya trae el rol, lo usamos directamente:
    // (Por defecto asignamos "docente" o el que tenga definido)
    const userRole = (user as any).rol || (user as any).role || "docente";
    setRole(userRole as AppRole);
    setLoading(false);
  }, [user]);

  return { role, loading, isAdmin: role === "admin" };
}