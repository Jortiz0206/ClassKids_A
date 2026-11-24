import { test, expect, loginDocente, assertBackendDePruebasActualizado } from "./fixtures";
import type { APIRequestContext, Page } from "@playwright/test";

// H-02: solo se guardan las filas modificadas · H-31: «Entregado» se lee de la base y las
// observaciones se conservan · H-33: el periodo se conserva.
// Actividad 1 = «Taller de Sumas y Restas» (Grado 1A). Todo ocurre en classkids_test.
const API = "http://127.0.0.1:8001";
type Cal = { id: number; estudiante_id: number; nota: number; periodo: number; observacion: string | null; entregado: boolean };

test.beforeAll(async ({ request }) => {
  await assertBackendDePruebasActualizado(request);
});

async function headers(request: APIRequestContext) {
  const r = await request.post(`${API}/auth/login`, {
    data: { email: "docente@classkids.local", password: process.env.CK_DOCENTE_PASS },
  });
  return { Authorization: `Bearer ${(await r.json()).access_token}` };
}

async function calificacionesActividad1(request: APIRequestContext, h: Record<string, string>): Promise<Cal[]> {
  const r = await request.get(`${API}/calificaciones?actividad_id=1`, { headers: h });
  return (await r.json()).sort((a: Cal, b: Cal) => a.id - b.id);
}

async function abrirActividad1(page: Page) {
  await page.goto("/app/calificaciones");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
  await expect(page.getByLabel("Calificación de Isabella Díaz")).toBeVisible();
}

test("sin cambios no se puede guardar y los estudiantes sin nota aparecen vacíos", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await abrirActividad1(page);
  await expect(page.getByRole("button", { name: /Guardar cambios/ })).toBeDisabled();
  await expect(page.getByLabel("Calificación de Mariana Acosta")).toHaveValue(""); // sin nota: vacío, no 0
});

test("H-02/H-31/H-33: cambiar una nota guarda solo esa fila y conserva observaciones y periodos", async ({ guardedPage: page, request }) => {
  const h = await headers(request);
  const antes = await calificacionesActividad1(request, h);
  const isabella = antes.find((c) => c.estudiante_id === 5)!; // Isabella Díaz, nota 4.3 (86 %)
  try {
    await loginDocente(page);
    await abrirActividad1(page);
    await page.getByLabel("Calificación de Isabella Díaz").fill("90");
    await expect(page.getByRole("button", { name: "Guardar cambios (1)" })).toBeEnabled();
    await page.getByRole("button", { name: "Guardar cambios (1)" }).click();
    await expect(page.getByText("Calificaciones guardadas correctamente (1)")).toBeVisible();

    const despues = await calificacionesActividad1(request, h);
    expect(despues.length, "No se crean filas nuevas (H-02)").toBe(antes.length);
    for (const a of antes) {
      const d = despues.find((x) => x.id === a.id)!;
      expect(d.observacion, `observación de la nota ${a.id}`).toBe(a.observacion);
      expect(d.periodo, `periodo de la nota ${a.id}`).toBe(a.periodo);
      expect(d.nota, `nota ${a.id}`).toBe(a.id === isabella.id ? 4.5 : a.nota);
    }
  } finally {
    await request.put(`${API}/calificaciones/${isabella.id}`, { headers: h, data: { estudiante_id: 5, materia_id: 1, actividad_id: 1, nota: isabella.nota } });
  }
});

test("H-31: el estado «Entregado» se guarda, se lee de vuelta y no borra la observación", async ({ guardedPage: page, request }) => {
  const h = await headers(request);
  const isabella = (await calificacionesActividad1(request, h)).find((c) => c.estudiante_id === 5)!;
  expect(isabella.entregado).toBe(true);
  try {
    await loginDocente(page);
    await abrirActividad1(page);
    await page.getByLabel("Entregado: Isabella Díaz").click();
    await page.getByRole("button", { name: "Guardar cambios (1)" }).click();
    await expect(page.getByText("Calificaciones guardadas correctamente (1)")).toBeVisible();

    await page.reload();
    await abrirActividad1(page);
    await expect(page.getByLabel("Entregado: Isabella Díaz")).not.toBeChecked();

    const despues = (await calificacionesActividad1(request, h)).find((c) => c.id === isabella.id)!;
    expect(despues.entregado).toBe(false);
    expect(despues.observacion).toBe(isabella.observacion);
  } finally {
    await request.put(`${API}/calificaciones/${isabella.id}`, { headers: h, data: { estudiante_id: 5, materia_id: 1, actividad_id: 1, nota: isabella.nota, entregado: true } });
  }
});

test("H-02: calificar a un estudiante sin nota crea solo su calificación en el periodo 1", async ({ guardedPage: page, request }) => {
  const h = await headers(request);
  const antes = await calificacionesActividad1(request, h);
  let creada: Cal | undefined;
  try {
    await loginDocente(page);
    await abrirActividad1(page);
    await page.getByLabel("Calificación de Mariana Acosta").fill("80");
    await page.getByRole("button", { name: "Guardar cambios (1)" }).click();
    await expect(page.getByText("Calificaciones guardadas correctamente (1)")).toBeVisible();

    const despues = await calificacionesActividad1(request, h);
    expect(despues.length).toBe(antes.length + 1);
    creada = despues.find((c) => !antes.some((a) => a.id === c.id));
    expect(creada!.nota).toBe(4.0);
    expect(creada!.periodo).toBe(1);
  } finally {
    // Limpieza: se elimina únicamente la calificación creada por esta prueba.
    if (creada) await request.delete(`${API}/calificaciones/${creada.id}`, { headers: h });
  }
});
