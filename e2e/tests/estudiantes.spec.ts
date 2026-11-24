import { test, expect, loginDocente } from "./fixtures";
import type { APIRequestContext } from "@playwright/test";

// H-29: filtro por grupo · H-28: selector de grupo al editar y conservación de `activo`.
// Todas las escrituras van al backend de pruebas (8001 → classkids_test).
const API = "http://127.0.0.1:8001";

async function apiToken(request: APIRequestContext) {
  const r = await request.post(`${API}/auth/login`, {
    data: { email: "docente@classkids.local", password: process.env.CK_DOCENTE_PASS },
  });
  expect(r.ok()).toBeTruthy();
  return (await r.json()).access_token as string;
}

test("H-29: el filtro por grupo muestra los 20 estudiantes de cada grupo del docente", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/estudiantes");
  await page.getByText("Mateo Rodríguez").first().waitFor();
  // H-08: el docente demo solo tiene asignados estos tres grupos; los demás no se ofrecen.
  const grupos = ["Grado 1A", "Grado 2A", "Grado 3A"];
  await page.getByRole("combobox").first().click();
  await expect(page.getByRole("option", { name: "Grado 4A", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  for (const grupo of grupos) {
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: grupo, exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(20);
    // Todas las filas visibles pertenecen al grupo filtrado
    await expect(page.locator("tbody tr").filter({ hasNotText: grupo })).toHaveCount(0);
  }
});

test("H-29: el filtro por grupo se combina con el filtro por estado", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/estudiantes");
  await page.getByText("Mateo Rodríguez").first().waitFor();
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Activo", exact: true }).click();
  const filas = await page.locator("tbody tr").count();
  expect(filas).toBeGreaterThan(0);
  expect(filas).toBeLessThan(20);
});

test("H-28: al editar, el selector muestra el grupo actual y guardar sin cambios lo conserva", async ({ guardedPage: page, request }) => {
  await loginDocente(page);
  await page.goto("/app/estudiantes");
  await page.getByText("Mateo Rodríguez").first().click();
  await page.getByRole("button", { name: /Editar/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("combobox")).toHaveText("Grado 1A");
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Estudiante actualizado")).toBeVisible();

  const token = await apiToken(request);
  const estudiantes = await (await request.get(`${API}/estudiantes`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const mateo = estudiantes.find((e: { documento: string }) => e.documento === "100102");
  expect(mateo.grupo_id).toBe(1);
  expect(mateo.activo).toBe(true);
});

test("H-28: editar un estudiante inactivo no lo reactiva", async ({ guardedPage: page, request }) => {
  const token = await apiToken(request);
  const headers = { Authorization: `Bearer ${token}` };
  const lista = await (await request.get(`${API}/estudiantes`, { headers })).json();
  const est = lista.find((e: { documento: string }) => e.documento === "100115"); // Lucía Mendoza, Grado 3A (grupo del docente)
  const base = { documento: est.documento, nombre: est.nombre, apellido: est.apellido, grupo_id: est.grupo_id };
  // Preparación (solo en la base de pruebas): dejar al estudiante inactivo.
  expect((await request.put(`${API}/estudiantes/${est.id}`, { headers, data: { ...base, activo: false } })).ok()).toBeTruthy();
  try {
    await loginDocente(page);
    await page.goto("/app/estudiantes");
    await page.getByPlaceholder("Buscar estudiante...").fill("Lucía Mendoza");
    await page.locator("tbody tr").filter({ hasText: "Lucía Mendoza" }).first().click();
    await page.getByRole("button", { name: /Editar/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Estudiante actualizado")).toBeVisible();
    const despues = (await (await request.get(`${API}/estudiantes`, { headers })).json())
      .find((e: { id: number }) => e.id === est.id);
    expect(despues.activo).toBe(false);
  } finally {
    // Restaurar el estado original en la base de pruebas.
    await request.put(`${API}/estudiantes/${est.id}`, { headers, data: { ...base, activo: true } });
  }
});
