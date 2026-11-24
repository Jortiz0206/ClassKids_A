import { describe, it, expect } from "vitest";
import { accesosMovil, menuMas, modulosApp, esRutaActiva, itemsVisibles } from "@/components/layout/navegacion";

// Navegación móvil aprobada: Inicio, Estudiantes, Calificaciones, Alertas y «Más».
// Estas pruebas comprueban que ningún módulo queda sin acceso y que los de administración
// solo aparecen para administradores (las rutas siguen protegidas en App.tsx).

describe("barra inferior del celular", () => {
  it("tiene los cuatro accesos directos aprobados, en orden", () => {
    expect(accesosMovil.map((i) => i.corto ?? i.label)).toEqual(["Inicio", "Estudiantes", "Calificaciones", "Alertas"]);
  });

  it("entre la barra y «Más» están todos los módulos del menú lateral", () => {
    const enMovil = new Set([...accesosMovil, ...menuMas].map((i) => i.path));
    for (const modulo of modulosApp) expect(enMovil.has(modulo.path)).toBe(true);
  });
});

describe("permisos en «Más»", () => {
  it("un docente ve Grupos, Actividades, Análisis y Materias, pero no Usuarios ni el panel admin", () => {
    const docente = itemsVisibles(menuMas, false).map((i) => i.label);
    expect(docente).toEqual(["Grupos", "Actividades", "Análisis", "Materias"]);
    expect(docente).not.toContain("Usuarios");
  });

  it("un administrador además ve Usuarios y el panel de administración", () => {
    const admin = itemsVisibles(menuMas, true).map((i) => i.path);
    expect(admin).toContain("/admin/usuarios");
    expect(admin).toContain("/admin");
  });
});

describe("esRutaActiva", () => {
  it("«/app» solo se marca en el Dashboard; los módulos también en sus subrutas", () => {
    expect(esRutaActiva("/app", "/app")).toBe(true);
    expect(esRutaActiva("/app/estudiantes", "/app")).toBe(false);
    expect(esRutaActiva("/app/estudiantes", "/app/estudiantes")).toBe(true);
    expect(esRutaActiva("/app/estudiantes/5", "/app/estudiantes")).toBe(true);
    expect(esRutaActiva("/app/estudiantes-x", "/app/estudiantes")).toBe(false);
    expect(esRutaActiva("/admin/usuarios", "/admin")).toBe(false);
  });
});
