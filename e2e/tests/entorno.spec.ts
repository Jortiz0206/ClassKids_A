import { test, expect, loginDocente } from "./fixtures";

test("el frontend de pruebas usa el backend de pruebas y carga datos", async ({ guardedPage: page }) => {
  await loginDocente(page);
  // Rótulo renombrado de «Total Grupos» a «Grupos» por decisión de diseño aprobada (renovación visual).
  await expect(page.getByRole("main").getByText("Grupos", { exact: true })).toBeVisible();
  // H-08: el docente demo tiene asignados Grado 1A, 2A y 3A (60 estudiantes), no los 200 del colegio.
  await expect(page.getByText("60", { exact: true }).first()).toBeVisible();
});
