import { test, expect, loginAdmin, loginDocente } from "./fixtures";

// Formularios de Materias (separados de la página en componentes propios).
// ESCRIBE en la base de pruebas: crea una materia temporal y la elimina al final.
// Crear, eliminar y vincular materias es tarea del administrador (H-08); el docente solo consulta.

test("Materias: crear una materia y eliminarla con confirmación", async ({ guardedPage: page }) => {
  const nombre = `Materia temporal E2E ${Date.now()}`;
  await loginAdmin(page);
  await page.goto("/app/materias");

  await page.getByRole("button", { name: "Nueva Materia" }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByRole("button", { name: "Crear Materia" }).click();
  await expect(page.getByText("Ingresa el nombre de la materia")).toBeVisible();
  await dialogo.getByPlaceholder("Ej: Matemáticas Avanzadas").fill(nombre);
  await dialogo.getByRole("button", { name: "Crear Materia" }).click();
  await expect(page.getByText("¡Materia creada con éxito!")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("cell", { name: nombre, exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Eliminar la materia ${nombre}` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar materia" }).click();
  await expect(page.getByText("Materia eliminada")).toBeVisible();
  await expect(page.getByRole("cell", { name: nombre, exact: true })).toHaveCount(0);
});

test("Materias: vincular exige los tres campos y no repite materia en el mismo grupo (sin escribir)", async ({ guardedPage: page }) => {
  await loginAdmin(page);
  await page.goto("/app/materias");
  await page.getByRole("button", { name: "Vincular a Grupo" }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByRole("button", { name: "Vincular" }).click();
  await expect(page.getByText("Selecciona docente, materia y grupo")).toBeVisible();

  const combos = dialogo.getByRole("combobox");
  await combos.nth(0).click(); await page.getByRole("option").first().click();
  await combos.nth(1).click(); await page.getByRole("option", { name: "Matemáticas", exact: true }).click();
  await combos.nth(2).click(); await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await dialogo.getByRole("button", { name: "Vincular" }).click();
  await expect(page.getByText("Esta asignación ya existe para este grupo")).toBeVisible();
  await dialogo.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Materias: el docente solo consulta sus materias y no ve acciones de administración (H-08)", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/materias");
  await expect(page.getByRole("cell", { name: "Matemáticas", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nueva Materia" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Vincular a Grupo" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Eliminar la materia/ })).toHaveCount(0);
});
