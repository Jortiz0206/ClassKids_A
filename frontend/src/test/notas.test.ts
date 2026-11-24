import { describe, it, expect } from "vitest";
import {
  estadoNota, aEscala5, aPorcentaje, formatoEscala5, normalizarEntradaNota, nivelPromedio,
  nivelSeguimiento, filaModificada, promedioActividad, iniciales, ETIQUETA_ESTADO,
  UMBRAL_APROBADO, UMBRAL_EXCELENTE, UMBRAL_ALERTA_NOTA, UMBRAL_APROBACION_NOTA, promedioExacto, UMBRAL_ALERTA_PORCENTAJE,
} from "@/lib/notas";

// Pruebas unitarias de las reglas de presentación de notas (sin red ni base de datos).
// Los umbrales son los existentes en ClassKids; estas pruebas protegen que no cambien.

describe("umbrales académicos", () => {
  it("conservan los cortes 90 / 70 de la interfaz y 3.0 / 3.5 de la escala oficial", () => {
    expect(UMBRAL_EXCELENTE).toBe(90);
    expect(UMBRAL_APROBADO).toBe(70);
    expect(UMBRAL_ALERTA_NOTA).toBe(3.0);
    expect(UMBRAL_APROBACION_NOTA).toBe(3.5);
    // 70 % equivale exactamente a 3.5 (÷ 20)
    expect(aEscala5(UMBRAL_APROBADO)).toBe(UMBRAL_APROBACION_NOTA);
  });
});

describe("estadoNota", () => {
  it("clasifica en los límites exactos: 90 Excelente, 89 Aprobado, 70 Aprobado, 69 Reprobado", () => {
    expect(estadoNota(90)).toBe("excelente");
    expect(estadoNota(89)).toBe("aprobado");
    expect(estadoNota(70)).toBe("aprobado");
    expect(estadoNota(69)).toBe("reprobado");
  });

  it("sin nota (null) o 0 se muestra como «Sin calificar», como en la pantalla original", () => {
    expect(estadoNota(null)).toBe("sin");
    expect(estadoNota(undefined)).toBe("sin");
    expect(estadoNota(0)).toBe("sin");
    expect(ETIQUETA_ESTADO[estadoNota(null)]).toBe("Sin calificar");
  });
});

describe("conversión entre escalas", () => {
  it("aEscala5 divide entre 20 y deja un decimal (lo que se envía al backend)", () => {
    expect(aEscala5(86)).toBe(4.3);
    expect(aEscala5(100)).toBe(5);
    expect(aEscala5(0)).toBe(0);
    expect(aEscala5(75)).toBe(3.8); // 3.75 → 3.8
  });

  it("aPorcentaje multiplica por 20 (lo que muestra la interfaz al leer la base)", () => {
    expect(aPorcentaje(4.3)).toBeCloseTo(86);
    expect(aPorcentaje(3.5)).toBe(70);
  });

  it("formatoEscala5 muestra siempre un decimal y queda vacío sin nota", () => {
    expect(formatoEscala5(86)).toBe("4.3");
    expect(formatoEscala5(100)).toBe("5.0");
    expect(formatoEscala5(null)).toBe("");
    expect(formatoEscala5(Number.NaN)).toBe("");
  });
});

describe("normalizarEntradaNota", () => {
  it("vacío o texto no numérico → sin nota; los valores fuera de rango se limitan a 0–100", () => {
    expect(normalizarEntradaNota("")).toBeNull();
    expect(normalizarEntradaNota("   ")).toBeNull();
    expect(normalizarEntradaNota("abc")).toBeNull();
    expect(normalizarEntradaNota("150")).toBe(100);
    expect(normalizarEntradaNota("-5")).toBe(0);
    expect(normalizarEntradaNota("86")).toBe(86);
  });
});

describe("bandas de promedio", () => {
  it("nivelPromedio usa los cortes de las gráficas: 90 / 80 / 70", () => {
    expect(nivelPromedio(95)).toBe("excelente");
    expect(nivelPromedio(80)).toBe("alto");
    expect(nivelPromedio(79)).toBe("observar");
    expect(nivelPromedio(70)).toBe("observar");
    expect(nivelPromedio(69)).toBe("bajo");
  });

  it("nivelSeguimiento conserva la regla del Dashboard: < 70 en riesgo, 70–79 observar", () => {
    expect(nivelSeguimiento(65)).toBe("risk");
    expect(nivelSeguimiento(70)).toBe("watch");
    expect(nivelSeguimiento(79)).toBe("watch");
    expect(nivelSeguimiento(80)).toBe("good");
    expect(nivelSeguimiento(0)).toBe("good"); // sin notas: comportamiento existente
  });
});

describe("guardado de calificaciones (decisión D2)", () => {
  const base = { calificacion: 86, entregado: true, original: { calificacion: 86, entregado: true } };

  it("una fila sin cambios no se guarda", () => {
    expect(filaModificada(base)).toBe(false);
  });

  it("cambiar la nota o la entrega marca la fila para guardar", () => {
    expect(filaModificada({ ...base, calificacion: 90 })).toBe(true);
    expect(filaModificada({ ...base, entregado: false })).toBe(true);
    expect(filaModificada({ ...base, calificacion: null })).toBe(true);
  });
});

describe("promedioActividad", () => {
  it("mantiene el cálculo actual: quien no tiene nota cuenta como 0 (H-19 pendiente)", () => {
    const filas = [{ calificacion: 86 }, { calificacion: 98 }, { calificacion: null }, { calificacion: null }];
    expect(promedioActividad(filas)).toBe(46); // (86 + 98) / 4 = 46
    expect(promedioActividad([])).toBe(0);
  });
});

describe("iniciales", () => {
  it("toma la primera letra del nombre y del apellido, en mayúscula", () => {
    expect(iniciales("isabella", "díaz")).toBe("ID");
    expect(iniciales("Mateo")).toBe("M");
    expect(iniciales("", "")).toBe("?");
  });
});

describe("clasePromedio", () => {
  it("usa los cortes 80 / 70 de las listas: verde, ámbar y naranja oscuros", async () => {
    const { clasePromedio } = await import("@/lib/notas");
    expect(clasePromedio(80)).toBe("text-nivel-excelente-fg");
    expect(clasePromedio(79)).toBe("text-nivel-observar-fg");
    expect(clasePromedio(70)).toBe("text-nivel-observar-fg");
    expect(clasePromedio(69)).toBe("text-nivel-reprobado-fg");
  });
});

describe("H-01: clasificación con el promedio exacto", () => {
  it("promedioExacto no redondea y devuelve null sin notas", () => {
    expect(promedioExacto([])).toBeNull();
    expect(promedioExacto([2.99])).toBeCloseTo(59.8);
    expect(promedioExacto([3, 3.5])).toBeCloseTo(65);
  });

  it("un 2.99 se muestra como 60 % pero queda bajo el umbral de alerta, como en el backend", () => {
    const exacto = promedioExacto([2.99])!;
    expect(Math.round(exacto)).toBe(60);
    expect(exacto < UMBRAL_ALERTA_PORCENTAJE).toBe(true);
    expect(UMBRAL_ALERTA_PORCENTAJE).toBe(60);
  });

  it("los niveles se calculan con el valor exacto: 69.9 % sigue en riesgo aunque redondeado sea 70 %", () => {
    expect(nivelSeguimiento(69.9)).toBe("risk");
    expect(nivelSeguimiento(70)).toBe("watch");
  });
});
