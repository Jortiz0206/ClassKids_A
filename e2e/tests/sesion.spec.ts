import { test, expect } from "./fixtures";

// H-09: si la cuenta cambia mientras la sesión está abierta, el token anterior deja de servir y la
// interfaz vuelve al inicio de sesión explicando el motivo. ESCRIBE en classkids_test: cambia el rol
// de un docente de prueba y lo restaura al final.
const API = "http://127.0.0.1:8001";

test("H-09: al cambiar el rol de un docente, su sesión abierta se cierra con el motivo", async ({ guardedPage: page, request }) => {
  const admin = await (await request.post(`${API}/auth/login`, { data: { email: "admin@classkids.local", password: process.env.CK_ADMIN_PASS } })).json();
  const h = { Authorization: `Bearer ${admin.access_token}` };
  const usuarios = await (await request.get(`${API}/usuarios`, { headers: h })).json();
  const ingles = usuarios.find((u: { email: string }) => u.email === "ingles@classkids.local");
  expect(ingles).toBeTruthy();

  await page.goto("/auth");
  await page.fill("#email", "ingles@classkids.local");
  await page.fill("#password", process.env.CK_DOCENTE_PASS ?? "");
  await page.getByRole("button", { name: /Iniciar sesión/ }).click();
  await page.waitForURL("**/app");

  expect((await request.put(`${API}/usuarios/${ingles.user_id}/rol`, { headers: h, data: { role: "admin" } })).ok()).toBeTruthy();
  try {
    await page.goto("/app/grupos");
    await page.waitForURL("**/auth", { timeout: 15_000 });
    await expect(page.getByRole("alert")).toContainText("Tu rol cambió");
    expect(await page.evaluate(() => localStorage.getItem("classkids_token"))).toBeNull();
  } finally {
    await request.put(`${API}/usuarios/${ingles.user_id}/rol`, { headers: h, data: { role: "docente" } });
  }
});
