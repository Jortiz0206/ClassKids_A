import { describe, expect, it } from "vitest";
import {
  asignacionExiste,
  asignacionesPorGrupo,
  contarGruposDeMateria,
  contarGruposSinAsignar,
  filtrarMaterias,
  normalizarAsignaciones,
  normalizarDocentes,
  nombreDocente,
} from "@/lib/materias";

const asignaciones = normalizarAsignaciones({
  items: [
    { id: 1, docente_id: 7, docente: "Ana", materia_id: 10, grupo_id: 100, materia_nombre: "Matemáticas" },
    { id: 2, docente_id: 7, materia_id: 11, grupo_id: 100, materias: { nombre: "Inglés" }, grupos: { nombre: "Grado 1A" } },
    { id: 3, docente_id: 8, materia_id: 10, grupo_id: 200 },
  ],
});
const grupos = [{ id: "100", nombre: "Grado 1A" }, { id: "200", nombre: "Grado 2A" }, { id: "300", nombre: "Grado 3A" }];

describe("lib/materias", () => {
  it("normaliza ids a texto y toma los nombres anidados cuando faltan los planos", () => {
    expect(asignaciones[0]).toMatchObject({ id: "1", docente_id: "7", materia_id: "10", grupo_id: "100", materia_nombre: "Matemáticas", grupo_nombre: "" });
    expect(asignaciones[1]).toMatchObject({ docente: "", materia_nombre: "Inglés", grupo_nombre: "Grado 1A" });
  });

  it("cuenta grupos por materia y grupos sin ninguna asignación", () => {
    expect(contarGruposDeMateria(asignaciones, "10")).toBe(2);
    expect(contarGruposDeMateria(asignaciones, "99")).toBe(0);
    expect(contarGruposSinAsignar(grupos, asignaciones)).toBe(1);
  });

  it("agrupa asignaciones por grupo y omite los grupos vacíos", () => {
    const porGrupo = asignacionesPorGrupo(grupos, asignaciones);
    expect(porGrupo.map((g) => [g.id, g.materias.length])).toEqual([["100", 2], ["200", 1]]);
  });

  it("detecta una asignación repetida de la misma materia en el mismo grupo", () => {
    expect(asignacionExiste(asignaciones, "10", "100")).toBe(true);
    expect(asignacionExiste(asignaciones, "11", "200")).toBe(false);
  });

  it("filtra materias sin distinguir mayúsculas y arma el nombre del docente", () => {
    const materias = [{ id: "1", nombre: "Matemáticas" }, { id: "2", nombre: "Inglés" }];
    expect(filtrarMaterias(materias, "MATE").map((m) => m.id)).toEqual(["1"]);
    expect(filtrarMaterias(materias, "")).toHaveLength(2);
    const [d] = normalizarDocentes([{ id: 5, nombre: "Ana", email: "a@x.co" }]);
    expect(nombreDocente(d)).toBe("Ana");
    expect(nombreDocente({ ...d, apellido: "Ruiz" })).toBe("Ana Ruiz");
  });
});
