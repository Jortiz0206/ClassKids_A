import { describe, it, expect } from "vitest";
import { aLista, mapaGrupoPorEstudiante } from "@/lib/listas";

describe("aLista", () => {
  it("devuelve el mismo arreglo cuando la API responde con una lista", () => {
    const lista = [{ id: 1 }, { id: 2 }];
    expect(aLista(lista)).toBe(lista);
  });

  it("acepta respuestas envueltas en items o data, como antes", () => {
    expect(aLista({ items: [1, 2] })).toEqual([1, 2]);
    expect(aLista({ data: [3] })).toEqual([3]);
  });

  it("devuelve una lista vacía ante respuestas inesperadas", () => {
    expect(aLista(null)).toEqual([]);
    expect(aLista(undefined)).toEqual([]);
    expect(aLista({ detail: "error" })).toEqual([]);
    expect(aLista("texto")).toEqual([]);
  });
});

describe("mapaGrupoPorEstudiante", () => {
  it("asocia cada estudiante con el nombre de su grupo, comparando ids como texto", () => {
    const mapa = mapaGrupoPorEstudiante(
      [{ id: 1, grupo_id: 10 }, { id: "2", grupo_id: "20" }, { id: 3, grupo_id: null }, { id: 4, grupo_id: 99 }],
      [{ id: 10, nombre: "Grado 1A" }, { id: "20", nombre: "Grado 2A" }],
    );
    expect(mapa.get("1")).toBe("Grado 1A");
    expect(mapa.get("2")).toBe("Grado 2A");
    expect(mapa.get("3")).toBe("");
    expect(mapa.get("4")).toBe("");
  });
});
