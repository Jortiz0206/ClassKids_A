import { test, expect, API, ADMIN, LUCIA, HERNAN, entrar, cabeceras, comprobarEntornoDemo } from "./apoyo";

// Recorrido de la demostración contra classkids_demo: todo lo que se ve sale de la base de datos.
// Las pruebas que crean registros los eliminan en `finally`, así la demostración queda igual.

test.beforeAll(async ({ request }) => {
  await comprobarEntornoDemo(request);
});

test("1. el administrador entra y el panel muestra los conteos de la base", async ({ demoPage: page, request }) => {
  const h = await cabeceras(request, ADMIN);
  const conteo = async (ruta: string) => String((await (await request.get(`${API}${ruta}`, { headers: h })).json()).count);
  await entrar(page, ADMIN);
  await page.goto("/admin");
  await expect(page.getByText("Grupos totales", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(await conteo("/grupos/count"));
  await expect(page.getByText("Alertas activas", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(await conteo("/alertas/activas/count"));
  await page.goto("/admin/usuarios");
  for (const correo of [ADMIN, LUCIA, HERNAN]) await expect(page.getByText(correo).first()).toBeVisible();
});

test("2. el administrador crea una materia, invita a un docente y le asigna la materia; el docente la ve", async ({ demoPage: page, request, browser }) => {
  const h = await cabeceras(request, ADMIN);
  const sufijo = Date.now();
  const materia = `Ética demostración ${sufijo}`;
  // Correo fijo: la API solo desactiva cuentas (no las borra), así que cada ejecución reutiliza
  // esta misma cuenta (la invitación la reactiva) en lugar de dejar una nueva desactivada.
  const correo = "docente.recorrido@demo.classkids.local";
  try {
    await entrar(page, ADMIN);
    await page.goto("/app/materias");
    await page.getByRole("button", { name: "Nueva Materia" }).click();
    await page.getByRole("dialog").getByPlaceholder("Ej: Matemáticas Avanzadas").fill(materia);
    await page.getByRole("dialog").getByRole("button", { name: "Crear Materia" }).click();
    await expect(page.getByText("¡Materia creada con éxito!")).toBeVisible();

    await page.goto("/admin/usuarios");
    await page.getByRole("button", { name: /Invitar docente/ }).click();
    await page.getByPlaceholder("docente@escuela.edu").fill(correo);
    await page.getByRole("dialog").getByRole("button", { name: "Enviar invitación" }).click();
    await expect(page.locator("#invitation-url")).toBeVisible();
    const enlace = await page.locator("#invitation-url").inputValue();
    expect(enlace).toContain("/invitacion?token=");

    // La persona invitada activa su cuenta en otra ventana.
    const otra = await (await browser.newContext()).newPage();
    await otra.goto(enlace.replace(/^https?:\/\/[^/]+/, "http://localhost:8082"));
    await otra.fill("#invitation-name", "Docente");
    await otra.fill("#invitation-lastname", "De Prueba");
    await otra.fill("#invitation-password", "Prueba-Demo-123");
    await otra.fill("#invitation-confirmation", "Prueba-Demo-123");
    await otra.getByRole("button", { name: "Activar cuenta" }).click();
    await otra.waitForURL("**/auth**");

    await page.goto("/app/materias");
    await page.getByRole("button", { name: "Vincular a Grupo" }).click();
    const combos = page.getByRole("dialog").getByRole("combobox");
    await combos.nth(0).click(); await page.getByRole("option", { name: /De Prueba/ }).click();
    await combos.nth(1).click(); await page.getByRole("option", { name: materia, exact: true }).click();
    await combos.nth(2).click(); await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Vincular" }).click();
    await expect(page.getByText("¡Asignación vinculada!")).toBeVisible();

    await otra.fill("#email", correo);
    await otra.fill("#password", "Prueba-Demo-123");
    await otra.getByRole("button", { name: /Iniciar sesión/ }).click();
    await otra.waitForURL("**/app");
    const asignaciones = otra.getByRole("list", { name: "Materias y grupos asignados" });
    await expect(asignaciones.getByRole("listitem")).toHaveCount(1);
    await expect(asignaciones).toContainText(materia);
    await expect(asignaciones).toContainText("Grado 1A");
  } finally {
    const asign = (await (await request.get(`${API}/asignaciones`, { headers: h })).json()).filter((a: { materia_nombre: string }) => a.materia_nombre === materia);
    for (const a of asign) await request.delete(`${API}/asignaciones/${a.id}`, { headers: h });
    const usuario = (await (await request.get(`${API}/usuarios`, { headers: h })).json()).find((u: { email: string }) => u.email === correo);
    if (usuario) await request.delete(`${API}/usuarios/${usuario.user_id}`, { headers: h });
    const mat = (await (await request.get(`${API}/materias`, { headers: h })).json()).find((m: { nombre: string }) => m.nombre === materia);
    if (mat) await request.delete(`${API}/materias/${mat.id}`, { headers: h });
  }
});

test("3. cada docente ve solo sus asignaciones y no puede tocar las de otro", async ({ demoPage: page, request }) => {
  await entrar(page, LUCIA);
  const asignaciones = page.getByRole("list", { name: "Materias y grupos asignados" });
  await expect(asignaciones.getByRole("listitem")).toHaveCount(12);
  await expect(asignaciones).not.toContainText("Grado 4A");
  await page.getByText("Cerrar sesión").click();

  await entrar(page, HERNAN);
  await expect(asignaciones.getByRole("listitem")).toHaveCount(8);
  await expect(asignaciones).not.toContainText("Grado 1A");
  await page.goto("/app/estudiantes");
  await page.getByRole("combobox", { name: "Filtrar por grupo" }).click();
  await expect(page.getByRole("option", { name: "Grado 1A", exact: true })).toHaveCount(0);
  await expect(page.getByRole("option", { name: "Grado 4A", exact: true })).toBeVisible();

  // Por la API, Hernán tampoco puede calificar a un estudiante de 1A.
  const hl = await cabeceras(request, LUCIA);
  const est1a = (await (await request.get(`${API}/estudiantes`, { headers: hl })).json()).find((e: { nombre_grupo: string }) => e.nombre_grupo === "Grado 1A");
  const mat = (await (await request.get(`${API}/materias`, { headers: hl })).json()).find((m: { nombre: string }) => m.nombre === "Matemáticas");
  const r = await request.post(`${API}/calificaciones`, { headers: await cabeceras(request, HERNAN), data: { estudiante_id: est1a.id, materia_id: mat.id, nota: 4.0 } });
  expect(r.status()).toBe(403);
});

test("4. la docente registra y edita una nota de 0 a 5 y se conserva al recargar", async ({ demoPage: page, request }) => {
  const h = await cabeceras(request, LUCIA);
  const actividad = (await (await request.get(`${API}/actividades`, { headers: h })).json())
    .find((a: { titulo: string; grupo_nombre: string }) => a.titulo === "Repaso de geometría" && a.grupo_nombre === "Grado 1A");
  const notasDe = async () => (await (await request.get(`${API}/calificaciones?actividad_id=${actividad.id}`, { headers: h })).json()) as { id: number; nota: number }[];
  expect(await notasDe(), "La actividad pendiente empieza sin notas").toHaveLength(0);
  try {
    await entrar(page, LUCIA);
    await page.goto("/app/calificaciones");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: /Repaso de geometría/ }).click();
    const campo = page.getByLabel(/^Calificación de /).first();
    await campo.fill("3.8");
    await expect(page.getByText("76 % · 15.2 / 20")).toBeVisible();
    await page.getByRole("button", { name: "Guardar cambios (1)" }).click();
    await expect.poll(async () => (await notasDe()).map((c) => c.nota)).toEqual([3.8]);

    await page.reload();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: /Repaso de geometría/ }).click();
    await expect(page.getByLabel(/^Calificación de /).first()).toHaveValue("3.8");

    await page.getByLabel(/^Calificación de /).first().fill("4,0");
    await page.getByRole("button", { name: "Guardar cambios (1)" }).click();
    await expect.poll(async () => (await notasDe()).map((c) => c.nota)).toEqual([4.0]);
  } finally {
    for (const c of await notasDe()) await request.delete(`${API}/calificaciones/${c.id}`, { headers: h });
  }
});

test("5. la docente registra una observación y queda guardada", async ({ demoPage: page, request }) => {
  const h = await cabeceras(request, LUCIA);
  const texto = `Observación de la demostración ${Date.now()}`;
  try {
    await entrar(page, LUCIA);
    await page.goto("/app/estudiantes");
    await page.getByRole("row").nth(1).click();
    await page.getByRole("button", { name: "Nueva" }).click();
    await page.getByPlaceholder("Escribe tu observación...").fill(texto);
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByText("Observación registrada")).toBeVisible();
    await expect(page.getByText(texto)).toBeVisible();
    const guardada = (await (await request.get(`${API}/observaciones`, { headers: h })).json()).filter((o: { descripcion: string }) => o.descripcion === texto);
    expect(guardada).toHaveLength(1);
  } finally {
    for (const o of (await (await request.get(`${API}/observaciones`, { headers: h })).json()).filter((x: { descripcion: string }) => x.descripcion === texto)) {
      await request.delete(`${API}/observaciones/${o.id}`, { headers: h });
    }
  }
});

test("6. indicadores y alertas del docente coinciden con la base", async ({ demoPage: page, request }) => {
  const h = await cabeceras(request, LUCIA);
  const alertas = (await (await request.get(`${API}/alertas`, { headers: h })).json()) as { estado: string }[];
  const activas = alertas.filter((a) => a.estado === "active").length;
  await entrar(page, LUCIA);
  await expect(page.getByText("Alertas activas", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(String(activas));
  await page.goto("/app/alertas");
  await expect(page.getByText(/estudiantes? con alerta|alertas?/i).first()).toBeVisible();

  const notas = (await (await request.get(`${API}/calificaciones`, { headers: h })).json()) as { nota: number }[];
  const promedio = notas.reduce((s, c) => s + Number(c.nota), 0) / notas.length;
  await page.goto("/app/analisis");
  const tarjeta = page.getByText("Promedio general", { exact: true }).locator("xpath=following-sibling::*[1]");
  await expect(tarjeta).toHaveText((Math.round(Math.round(promedio * 200) / 10 / 2) / 10).toFixed(1));
});
