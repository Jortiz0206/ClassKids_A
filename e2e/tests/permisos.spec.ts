import { test, expect, loginAdmin, loginDocenteMatematicas } from "./fixtures";

// H-08 en la interfaz: cada docente ve solo sus asignaciones; el administrador conserva la visión
// general. Solo lectura. La API se prueba por separado (backend/tests/test_permisos.py).

test("H-08: el docente de Matemáticas ve solo su materia, sus grupos y sus indicadores", async ({ guardedPage: page }) => {
  await loginDocenteMatematicas(page);
  const asignaciones = page.getByRole("list", { name: "Materias y grupos asignados" });
  await expect(asignaciones.getByRole("listitem")).toHaveCount(7);
  await expect(asignaciones.getByRole("listitem").filter({ hasNotText: "Matemáticas" })).toHaveCount(0);
  await expect(page.getByText("Alertas activas", { exact: true })).toBeVisible();
  // El gráfico de rendimiento solo tiene la materia del docente.
  const grafico = page.getByRole("region", { name: "Rendimiento por materia" });
  await expect(grafico).toContainText("Matemáticas");
  for (const otra of ["Español y Literatura", "Ciencias Naturales", "Sociales", "Inglés"]) await expect(grafico).not.toContainText(otra);

  await page.goto("/app/grupos");
  await expect(page.getByRole("button", { name: /Nuevo Grupo/ })).toHaveCount(0);
  await page.goto("/app/analisis");
  await expect(page.getByRole("heading", { name: "Análisis de rendimiento" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Materia" })).toHaveCount(0); // una sola materia: no hace falta el filtro
});

test("H-08: el administrador conserva la visión general y el filtro por materia en Análisis", async ({ guardedPage: page }) => {
  await loginAdmin(page);
  await expect(page.getByRole("list", { name: "Materias y grupos asignados" })).toHaveCount(0);
  await expect(page.getByText("Grupos", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText("10");
  await page.goto("/app/analisis");
  await page.getByRole("combobox", { name: "Materia" }).click();
  await page.getByRole("option", { name: "Matemáticas" }).click();
  await expect(page.getByRole("combobox", { name: "Materia" })).toContainText("Matemáticas");
});
