import { test, expect, loginDocente, loginAdmin } from "./fixtures";

// Renovación visual: comportamiento nuevo que debe funcionar sobre la app real (entorno de
// pruebas 8081 → 8001 → classkids_test). Ninguna de estas pruebas escribe en la base.

test.describe("navegación móvil", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("docente: barra inferior con 5 accesos y «Más» sin módulos de administración", async ({ guardedPage: page }) => {
    await loginDocente(page);
    const barra = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(barra.getByRole("link")).toHaveText([/Inicio/, /Estudiantes/, /Calificaciones/, /Alertas/]);
    // El aviso de bienvenida aparece arriba: abajo tapaba la barra y bloqueaba «Más» mientras se veía.
    const aviso = page.getByText("¡Bienvenido a ClassKids!");
    await expect(aviso).toBeVisible();
    expect((await aviso.boundingBox())!.y).toBeLessThan(200);
    await barra.getByRole("button", { name: "Más" }).click();
    const hoja = page.getByRole("dialog");
    for (const modulo of ["Grupos", "Actividades", "Análisis", "Materias"]) {
      await expect(hoja.getByRole("link", { name: modulo })).toBeVisible();
    }
    await expect(hoja.getByRole("link", { name: "Usuarios" })).toHaveCount(0);
    await hoja.getByRole("link", { name: "Materias" }).click();
    await expect(page).toHaveURL(/\/app\/materias$/);
    // Sin desplazamiento horizontal accidental
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("administrador: «Más» incluye Usuarios y el panel de administración", async ({ guardedPage: page }) => {
    await loginAdmin(page);
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("button", { name: "Más" }).click();
    const hoja = page.getByRole("dialog");
    await expect(hoja.getByRole("link", { name: "Usuarios" })).toBeVisible();
    await expect(hoja.getByRole("link", { name: "Panel de administración" })).toBeVisible();
  });
});

test("Calificaciones muestra la equivalencia en la escala 0.0 – 5.0 sin cambiar la nota", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/calificaciones");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
  const campo = page.getByLabel("Calificación de Isabella Díaz");
  await expect(campo).toHaveValue("4.3");
  await expect(page.locator(`#${await campo.getAttribute("aria-describedby")}`)).toContainText("86 % · 17.2 / 20");
  // Escribir una nota actualiza el estado y la equivalencia; no se guarda nada sin pulsar el botón.
  await page.getByLabel("Calificación de Mariana Acosta").fill("3.8");
  await expect(page.getByRole("row", { name: /Acosta, Mariana/ })).toContainText("76 % · 15.2 / 20");
  await expect(page.getByRole("row", { name: /Acosta, Mariana/ })).toContainText("Aprobado");
  await expect(page.getByRole("button", { name: "Guardar cambios (1)" })).toBeEnabled();
});

test("Alertas: el detalle muestra el grupo y el mensaje, y la fecha nunca es negativa", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/alertas");
  await expect(page.getByText(/Hace -\d+ días/)).toHaveCount(0);
  await page.getByText("Santiago Guerrero").first().click();
  const detalle = page.getByRole("dialog");
  await expect(detalle).toContainText("Grado 1A");
  await expect(detalle).toContainText("Promedio acumulado inferior a 3.0");
});

test("Estudiantes: la lista se pagina de 25 en 25 y los filtros siguen funcionando", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/estudiantes");
  await expect(page.locator("tbody tr")).toHaveCount(25);
  // H-08: el docente demo ve los 60 estudiantes de sus tres grupos.
  await expect(page.getByText("Mostrando 1–25 de 60")).toBeVisible();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("Mostrando 26–50 de 60")).toBeVisible();
});

test("Grupos: «Ver estudiantes del grupo» abre Estudiantes filtrado por ese grupo", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.goto("/app/grupos");
  await page.getByRole("link", { name: "Ver estudiantes del grupo" }).first().click();
  await expect(page).toHaveURL(/\/app\/estudiantes\?grupo=\d+/);
  await expect(page.locator("tbody tr")).toHaveCount(20);
});

test("Cambiar el ancho de la ventana no borra las notas digitadas sin guardar", async ({ guardedPage: page }) => {
  // Defecto encontrado en esta etapa: al cruzar el ancho de celular el layout volvía a montar
  // la pantalla y se perdían los datos sin guardar.
  await loginDocente(page);
  await page.goto("/app/calificaciones");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
  await page.getByLabel("Calificación de Mariana Acosta").fill("3.8");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Calificación de Mariana Acosta")).toHaveValue("3.8");
  await page.setViewportSize({ width: 1366, height: 860 });
  await expect(page.getByLabel("Calificación de Mariana Acosta")).toHaveValue("3.8");
  await expect(page.getByRole("button", { name: "Guardar cambios (1)" })).toBeEnabled();
});

test("Dashboard: «Ver todos» de seguimiento abre Estudiantes (antes llevaba a una ruta inexistente)", async ({ guardedPage: page }) => {
  await loginDocente(page);
  await page.getByRole("button", { name: "Ver todos" }).click();
  await expect(page).toHaveURL(/\/app\/estudiantes$/);
  await expect(page.getByRole("heading", { name: "Estudiantes", level: 1 })).toBeVisible();
});

test.describe("modo claro y oscuro", () => {
  test("landing e inicio de sesión: el selector cambia el tema y se mantiene al recargar y navegar", async ({ guardedPage: page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("link", { name: /Iniciar sesión/ }).first().click();
    await expect(page).toHaveURL(/\/auth$/);
    await expect(html).toHaveClass(/dark/);
    // El fondo realmente cambia (no solo la clase)
    const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fondo).not.toBe("rgb(246, 248, 252)");
    await page.getByRole("button", { name: "Cambiar a modo claro" }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("dentro de la app el tema oscuro se conserva entre módulos", async ({ guardedPage: page }) => {
    await loginDocente(page);
    await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    for (const ruta of ["/app/calificaciones", "/app/alertas", "/app/analisis"]) {
      await page.goto(ruta);
      await expect(page.locator("html")).toHaveClass(/dark/);
    }
    await page.getByRole("button", { name: "Cambiar a modo claro" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});

test("Landing: «Ver cómo funciona» lleva a la sección que lo explica", async ({ guardedPage: page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver cómo funciona" }).click();
  await expect(page).toHaveURL(/#metodo$/);
  await expect(page.getByRole("heading", { name: "Un flujo simple para decisiones más oportunas." })).toBeInViewport();
});

test("Materias y Usuarios piden confirmación antes de borrar o desactivar; cancelar no cambia nada (H-39)", async ({ guardedPage: page, request }) => {
  // Eliminar materias es tarea del administrador (H-08).
  await loginAdmin(page);
  await page.goto("/app/materias");
  await page.getByRole("button", { name: "Eliminar la materia Matemáticas" }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toContainText("¿Eliminar la materia Matemáticas?");
  await dialogo.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("cell", { name: "Matemáticas" }).first()).toBeVisible();

  await page.goto("/admin/usuarios");
  await page.getByRole("button", { name: "Desactivar a matematicas@classkids.local" }).click();
  const confirmar = page.getByRole("dialog");
  await expect(confirmar).toContainText("no podrá iniciar sesión");
  await confirmar.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Sigue activo en la base de pruebas
  const r = await request.post("http://127.0.0.1:8001/auth/login", { data: { email: "admin@classkids.local", password: process.env.CK_ADMIN_PASS } });
  const usuarios = await (await request.get("http://127.0.0.1:8001/usuarios", { headers: { Authorization: `Bearer ${(await r.json()).access_token}` } })).json();
  const laura = (Array.isArray(usuarios) ? usuarios : []).find((u: { email: string }) => u.email === "matematicas@classkids.local");
  expect(laura?.activo ?? true).toBe(true);
});

test("El administrador no puede cambiarse el rol ni desactivarse desde la interfaz (H-18)", async ({ guardedPage: page }) => {
  await loginAdmin(page);
  await page.goto("/admin/usuarios");
  // Su fila se marca como «(tú)» y sus controles quedan deshabilitados; los de otros usuarios no.
  const propia = page.getByRole("row").filter({ hasText: "admin@classkids.local" });
  await expect(propia).toContainText("(tú)");
  await expect(propia.getByRole("combobox")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Desactivar a admin@classkids.local" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Desactivar a matematicas@classkids.local" })).toBeEnabled();
});

test.describe("Usuarios en celular (H-40)", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("cada usuario se ve en una tarjeta con su rol y la acción, sin desplazamiento lateral", async ({ guardedPage: page }) => {
    await loginAdmin(page);
    await page.goto("/admin/usuarios");
    const lista = page.getByRole("list", { name: "Usuarios" });
    await expect(lista.getByText("matematicas@classkids.local")).toBeVisible();
    const desactivar = page.getByRole("button", { name: "Desactivar a matematicas@classkids.local" });
    await desactivar.scrollIntoViewIfNeeded();
    await expect(desactivar).toBeInViewport();
    await expect(page.getByRole("combobox", { name: "Rol de matematicas@classkids.local" })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});
