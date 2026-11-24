// La prueba se ejecuta en la zona horaria de Colombia (UTC-5), donde se observó el error.
process.env.TZ = "America/Bogota";

import { describe, it, expect } from "vitest";
import { fechaLocal, inicioDeHoy } from "@/lib/fechas";

// H-30a: una fecha "AAAA-MM-DD" debe mostrarse el mismo día, sin desplazarse por UTC.
describe("fechaLocal", () => {
  it("reproduce el error anterior: new Date('AAAA-MM-DD') cae en el día previo en Colombia", () => {
    expect(new Date("2026-09-05").getDate()).toBe(4);
  });

  it("conserva el día, el mes y el año", () => {
    const f = fechaLocal("2026-09-05");
    expect([f.getFullYear(), f.getMonth() + 1, f.getDate()]).toEqual([2026, 9, 5]);
  });

  it("se muestra como «5 sep» y no como «4 sep»", () => {
    expect(fechaLocal("2026-09-05").toLocaleDateString("es-MX", { day: "numeric", month: "short" })).toMatch(/^5 sep/);
  });

  it("acepta fechas con hora", () => {
    expect(fechaLocal("2026-09-03T15:39:12.594077").getDate()).toBe(3);
  });
});

describe("inicioDeHoy", () => {
  it("devuelve la medianoche local del día dado", () => {
    const h = inicioDeHoy(new Date(2026, 10, 20, 15, 30));
    expect([h.getFullYear(), h.getMonth(), h.getDate(), h.getHours(), h.getMinutes()]).toEqual([2026, 10, 20, 0, 0]);
  });
});
