import { test as base, expect, Page } from "@playwright/test";

const TEST_API = "127.0.0.1:8001";
const REAL_API_PORT = ":8000";

// SALVAGUARDA: toda petición del navegador a la API debe ir al backend de PRUEBAS.
// Si alguna petición sale hacia el backend real (puerto 8000), la prueba falla.
export const test = base.extend<{ guardedPage: Page }>({
  guardedPage: async ({ page }, use) => {
    const realCalls: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes(REAL_API_PORT)) realCalls.push(url);
    });
    await use(page);
    expect(realCalls, `Peticiones al backend REAL detectadas: ${realCalls.join(", ")}`).toEqual([]);
  },
});

export { expect };

// Comprueba que el backend de pruebas ejecuta el código actual del repositorio. Con
// `uvicorn --reload` en Windows se observó una recarga que nunca terminó: el proceso
// siguió atendiendo con el código anterior y las pruebas daban resultados falsos.
// Se compara un campo que solo existe en el código actual.
export async function assertBackendDePruebasActualizado(request: import("@playwright/test").APIRequestContext) {
  const spec = await (await request.get("http://127.0.0.1:8001/openapi.json")).json();
  const props = spec?.components?.schemas?.CalificacionSchema?.properties ?? {};
  expect(Object.keys(props), "El backend de pruebas no ejecuta el código actual: reinícielo (ver e2e/README.md)").toContain("entregado");
}

export async function loginAdmin(page: Page) {
  await login(page, "admin@classkids.local", process.env.CK_ADMIN_PASS, "CK_ADMIN_PASS");
}

export async function loginDocente(page: Page) {
  await login(page, "docente@classkids.local", process.env.CK_DOCENTE_PASS, "CK_DOCENTE_PASS");
}

/** Docente con una sola materia (Matemáticas en 7 grupos); misma contraseña demo que el docente. */
export async function loginDocenteMatematicas(page: Page) {
  await login(page, "matematicas@classkids.local", process.env.CK_DOCENTE_PASS, "CK_DOCENTE_PASS");
}

async function login(page: Page, email: string, pass: string | undefined, variable: string) {
  if (!pass) throw new Error(`Defina ${variable} (contraseña demo en la base de pruebas).`);
  await page.goto("/auth");
  await page.fill("#email", email);
  await page.fill("#password", pass);
  const apiCall = page.waitForRequest((r) => r.url().includes("/auth/login"));
  await page.getByRole("button", { name: /Iniciar sesión/ }).click();
  const req = await apiCall;
  expect(req.url(), "El login debe ir al backend de pruebas").toContain(TEST_API);
  await page.waitForURL("**/app");
}
