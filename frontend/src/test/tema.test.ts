import { describe, it, expect } from "vitest";
import { siguienteTema, etiquetaCambioTema, CLAVE_TEMA } from "@/lib/tema";

// Selector de modo claro / oscuro.
describe("selector de tema", () => {
  it("alterna entre claro y oscuro", () => {
    expect(siguienteTema("light")).toBe("dark");
    expect(siguienteTema("dark")).toBe("light");
  });

  it("la etiqueta accesible describe la acción que hará el botón", () => {
    expect(etiquetaCambioTema("light")).toBe("Cambiar a modo oscuro");
    expect(etiquetaCambioTema("dark")).toBe("Cambiar a modo claro");
  });

  it("la preferencia se guarda con una clave propia de ClassKids", () => {
    expect(CLAVE_TEMA).toBe("classkids-tema");
  });
});
