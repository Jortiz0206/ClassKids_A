process.env.TZ = "America/Bogota";

import { describe, it, expect } from "vitest";
import { tiempoRelativo, fechaCorta } from "@/lib/fechas";

// Corrige «Hace -1 días» (diagnóstico visual V-08): la fecha de creación de una alerta podía
// quedar en el futuro por la diferencia de zona horaria entre el servidor y el navegador.
const ahora = new Date(2026, 10, 20, 9, 0); // 20 de noviembre de 2026, 9:00 a. m. en Bogotá

describe("tiempoRelativo", () => {
  it("una fecha futura por zona horaria se muestra como «Hoy», nunca como «Hace -1 días»", () => {
    expect(tiempoRelativo("2026-11-21T02:00:00", ahora)).toBe("Hoy");
    expect(tiempoRelativo("2026-11-20", ahora)).toBe("Hoy");
  });

  it("calcula ayer, días, semanas y meses por días de calendario", () => {
    expect(tiempoRelativo("2026-11-19", ahora)).toBe("Ayer");
    expect(tiempoRelativo("2026-11-17", ahora)).toBe("Hace 3 días");
    expect(tiempoRelativo("2026-11-13", ahora)).toBe("Hace 1 semana");
    expect(tiempoRelativo("2026-11-01", ahora)).toBe("Hace 2 semanas");
    expect(tiempoRelativo("2026-09-20", ahora)).toBe("Hace 2 meses");
  });

  it("sin fecha o con un valor inválido muestra «Sin fecha»", () => {
    expect(tiempoRelativo(null, ahora)).toBe("Sin fecha");
    expect(tiempoRelativo("no-es-fecha", ahora)).toBe("Sin fecha");
  });
});

describe("fechaCorta", () => {
  it("muestra día, mes abreviado y año sin desplazar el día", () => {
    expect(fechaCorta("2026-09-05")).toMatch(/^5 .*sep.* 2026$/);
    expect(fechaCorta(undefined)).toBe("Sin fecha");
  });
});
