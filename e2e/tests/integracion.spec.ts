import { test, expect, loginDocente, loginAdmin } from "./fixtures";
import type { APIRequestContext } from "@playwright/test";

// H-30a/H-30c (Actividades), H-25 (conteos) y H-26 (Datos globales). Todo en classkids_test.
const API = "http://127.0.0.1:8001";

async function headers(request: APIRequestContext, email = "docente@classkids.local", pass = process.env.CK_DOCENTE_PASS) {
  const r = await request.post(`${API}/auth/login`, { data: { email, password: pass } });
  return { Authorization: `Bearer ${(await r.json()).access_token}` };
}
const headersAdmin = (request: APIRequestContext) => headers(request, "admin@classkids.local", process.env.CK_ADMIN_PASS);
const activas = (lista: { estado: string }[]) => lista.filter((a) => a.estado === "active").length;

test("H-30a: la fecha de entrega se muestra el mismo día que en la base de datos", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/actividades");
  const tarjeta = page.locator("div.rounded-xl, div[class*='rounded']").filter({ hasText: "Taller de Sumas y Restas" }).last();
  await expect(tarjeta).toContainText("5 sep", { timeout: 30_000 }); // fecha_entrega = 2026-09-05
  await expect(tarjeta).not.toContainText("4 sep");
});

test("H-30c: Actividades y Calificaciones muestran las mismas entregas de la actividad 1", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/actividades");
  const tarjeta = page.locator("div.rounded-xl, div[class*='rounded']").filter({ hasText: "Taller de Sumas y Restas" }).last();
  await expect(tarjeta).toContainText("5/20 entregados", { timeout: 30_000 }); // 7 filas, 5 estudiantes

  await page.goto("/app/calificaciones");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
  await expect(page.getByText("5/20", { exact: true })).toBeVisible();
});

test("H-30 / D4: RN-16 sin cambios, las actividades vencidas siguen como vencidas", async ({ guardedPage: page }) => {
  // El administrador ve las 52 actividades del colegio; el docente demo, las 17 de sus asignaciones (H-08).
  for (const [entrar, total] of [[loginAdmin, "52"], [loginDocente, "17"]] as const) {
    await entrar(page);
    await page.goto("/app/actividades");
    await expect(page.getByText("Taller de Sumas y Restas").first()).toBeVisible({ timeout: 30_000 });
    const vencidas = page.locator("p", { hasText: /^Vencidas$/ }).locator("xpath=preceding-sibling::p[1]");
    await expect(vencidas).toHaveText(total);
    await page.getByText("Cerrar sesión").click();
  }
});

test("H-25: Dashboard y panel de administración cuentan las alertas con el mismo criterio", async ({ guardedPage: page, request }) => {
  const h = await headers(request);
  const ha = await headersAdmin(request);
  const alertas = await (await request.get(`${API}/alertas`, { headers: h })).json();
  const alerta = alertas.find((a: { estado: string }) => a.estado === "active");
  // Preparación (solo en la base de pruebas): una alerta resuelta.
  await request.put(`${API}/alertas/${alerta.id}/estado`, { headers: h, data: { estado: "resolved" } });
  try {
    // Criterio común: solo estado «active». El docente cuenta las de su ámbito (H-08); el administrador, todas.
    const delDocente = String(activas(await (await request.get(`${API}/alertas`, { headers: h })).json()));
    const delColegio = String(activas(await (await request.get(`${API}/alertas`, { headers: ha })).json()));
    await loginDocente(page);
    await expect(page.getByText("Alertas activas", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(delDocente);
    await expect(page.getByText(`${delDocente} activas`)).toBeVisible();

    await page.getByText("Cerrar sesión").click();
    await loginAdmin(page);
    await expect(page.getByText("Alertas activas", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(delColegio);
    await page.goto("/admin");
    await expect(page.getByText("Alertas activas", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(delColegio);
  } finally {
    await request.put(`${API}/alertas/${alerta.id}/estado`, { headers: h, data: { estado: "active" } });
  }
});

test("H-26: Datos globales muestra el año lectivo y el estado de las alertas en español", async ({ guardedPage: page }) => {
  await loginAdmin(page);
  await page.goto("/admin/datos");
  await expect(page.getByRole("columnheader", { name: "Año lectivo" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Creado" })).toHaveCount(0);
  await expect(page.locator("tbody tr").first()).toContainText("2026");
  await expect(page.getByText("N/A")).toHaveCount(0);
  await page.getByRole("tab", { name: /Alertas/ }).click();
  await expect(page.locator("tbody tr").first()).toContainText("Activa");
  await expect(page.locator("tbody").getByText("active", { exact: true })).toHaveCount(0);
});

test("Panel de alertas: muestra solo activas y las resueltas se consultan en Alertas sin eliminarse", async ({ guardedPage: page, request }) => {
  const h = await headers(request);
  const alertas = await (await request.get(`${API}/alertas`, { headers: h })).json();
  const total = alertas.length;
  const alerta = alertas.find((a: { estado: string }) => a.estado === "active");
  await request.put(`${API}/alertas/${alerta.id}/estado`, { headers: h, data: { estado: "resolved" } });
  try {
    const n = activas(await (await request.get(`${API}/alertas`, { headers: h })).json()); // activas del docente (H-08)
    await loginDocente(page);
    const panel = page.locator("div.bg-card").filter({ has: page.getByRole("heading", { name: "Alertas Tempranas" }) });
    await expect(panel.getByText(`${n} activas`)).toBeVisible();
    // El resumen muestra las 5 alertas activas más recientes y enlaza a la lista completa.
    await expect(panel.locator("div.group")).toHaveCount(5);
    await expect(panel.getByRole("link", { name: `Ver las ${n} alertas activas` })).toHaveAttribute("href", "/app/alertas");

    await panel.getByRole("link", { name: "Ver alertas resueltas" }).click();
    await expect(page).toHaveURL(/\/app\/alertas\?estado=resolved/);
    await expect(page.locator("select").nth(1)).toHaveValue("resolved");
    await expect(page.getByText("1 alertas")).toBeVisible();

    // La alerta resuelta se conserva en PostgreSQL (no se elimina).
    const despues = await (await request.get(`${API}/alertas`, { headers: h })).json();
    expect(despues.length).toBe(total);
    expect(despues.find((a: { id: number }) => a.id === alerta.id).estado).toBe("resolved");
  } finally {
    await request.put(`${API}/alertas/${alerta.id}/estado`, { headers: h, data: { estado: "active" } });
  }
});
