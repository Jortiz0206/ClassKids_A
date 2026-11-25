import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const API = "http://127.0.0.1:8002";
export const ADMIN = "admin@demo.classkids.local";
export const LUCIA = "lucia.mendez@demo.classkids.local"; // Matemáticas y Ciencias Naturales en 1A–3B
export const HERNAN = "hernan.villamizar@demo.classkids.local"; // Matemáticas y Ciencias Naturales en 4A–5B

// Las contraseñas de demostración se leen de backend/.env.demo (local, excluido de Git).
function leerEnvDemo(): Record<string, string> {
  const ruta = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/.env.demo");
  const pares: Record<string, string> = {};
  for (const linea of readFileSync(ruta, "utf-8").split(/\r?\n/)) {
    const m = linea.match(/^([A-Z_]+)=(.*)$/);
    if (m) pares[m[1]] = m[2].trim();
  }
  return pares;
}
const ENV = leerEnvDemo();
export const clave = (email: string) => (email === ADMIN ? ENV.DEMO_ADMIN_PASSWORD : ENV.DEMO_DOCENTE_PASSWORD);

// SALVAGUARDA: el navegador solo puede hablar con el backend de demostración.
export const test = base.extend<{ demoPage: Page }>({
  demoPage: async ({ page }, use) => {
    const ajenas: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (/:(8000|8001)\//.test(url)) ajenas.push(url);
    });
    await use(page);
    expect(ajenas, `Peticiones fuera del entorno de demostración: ${ajenas.join(", ")}`).toEqual([]);
  },
});
export { expect };

export async function comprobarEntornoDemo(request: APIRequestContext) {
  const info = await (await request.get(`${API}/`)).json();
  expect(info.entorno, "El backend del puerto 8002 debe ser el de demostración").toBe("demo");
  expect(info.base_de_datos).toBe("classkids_demo");
}

export async function entrar(page: Page, email: string) {
  await page.goto("/auth");
  await page.fill("#email", email);
  await page.fill("#password", clave(email));
  await page.getByRole("button", { name: /Iniciar sesión/ }).click();
  await page.waitForURL("**/app");
}

export async function cabeceras(request: APIRequestContext, email: string) {
  const r = await request.post(`${API}/auth/login`, { data: { email, password: clave(email) } });
  expect(r.status()).toBe(200);
  return { Authorization: `Bearer ${(await r.json()).access_token}` };
}
