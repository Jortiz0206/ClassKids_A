import { describe, it, expect } from "vitest";
import { contarAlertasActivas, contarEstudiantesActivos } from "@/lib/conteos";

// H-25: el Dashboard debe contar igual que los endpoints del panel de administración.
describe("criterios de conteo", () => {
  it("cuenta solo las alertas en estado 'active' (como /alertas/activas/count)", () => {
    const alertas = [{ estado: "active" }, { estado: "reviewed" }, { estado: "resolved" }, { estado: "active" }];
    expect(contarAlertasActivas(alertas)).toBe(2);
  });

  it("cuenta solo los estudiantes activos (como /estudiantes/count)", () => {
    const estudiantes = [{ activo: true }, { activo: false }, { activo: true }];
    expect(contarEstudiantesActivos(estudiantes)).toBe(2);
  });
});
