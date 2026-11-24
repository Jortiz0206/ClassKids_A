import { test, expect } from "./fixtures";

// Landing «Aprender, Crecer y Avanzar»: enlaces, módulos reales, video real,
// pantallas reales del flujo, temas y celular. No escribe en la base.

test("Landing: el menú y el pie llevan a cada sección, y los accesos van al inicio de sesión", async ({ guardedPage: page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Detecta a tiempo quién necesita apoyo en tu aula.");

  const secciones: [string, string, string][] = [
    ["Propósito", "#proposito", "Las señales ya están en las notas. ClassKids las hace visibles a tiempo."],
    ["Módulos", "#plataforma", "Explora la plataforma."],
    ["Recorrido", "#recorrido", "Conoce cómo funciona ClassKids"],
  ];
  for (const nav of ["Secciones", "Producto"]) {
    for (const [enlace, ancla, titulo] of secciones) {
      await page.getByRole("navigation", { name: nav, exact: true }).first().getByRole("link", { name: enlace }).click();
      await expect(page).toHaveURL(new RegExp(`${ancla}$`));
      await expect(page.getByRole("heading", { name: titulo })).toBeInViewport();
    }
  }

  // Acciones de la portada: «Conoce ClassKids» lleva al video y «Explorar módulos» a los módulos.
  await page.goto("/");
  await expect(page.getByText("Aprender · Crecer · Avanzar").first()).toBeVisible();
  await page.getByRole("link", { name: /Conoce ClassKids/ }).click();
  await expect(page).toHaveURL(/#recorrido$/);
  await page.getByRole("link", { name: /Explorar módulos/ }).click();
  await expect(page).toHaveURL(/#plataforma$/);

  // Todos los accesos a la plataforma apuntan a /auth (sin sesión) y el correo es un mailto.
  const accesos = page.getByRole("link", { name: /Iniciar sesión/ });
  expect(await accesos.count()).toBeGreaterThanOrEqual(3);
  for (const href of await accesos.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) expect(href).toBe("/auth");
  await expect(page.getByRole("link", { name: "contacto@classkids.edu.co" }).first()).toHaveAttribute("href", "mailto:contacto@classkids.edu.co");

  // Enlaces legales del pie
  const legal = page.getByRole("navigation", { name: "Información legal" });
  for (const [texto, ruta] of [["Términos y condiciones", "/legal/terminos"], ["Política de privacidad", "/legal/privacidad"], ["Política de cookies", "/legal/cookies"], ["Protección de datos", "/legal/proteccion-datos"]]) {
    await expect(legal.getByRole("link", { name: texto })).toHaveAttribute("href", ruta);
  }
  await legal.getByRole("link", { name: "Política de privacidad" }).click();
  await expect(page).toHaveURL(/\/legal\/privacidad$/);
});

test("Landing: la plataforma presenta los ocho módulos reales con capturas que cargan", async ({ guardedPage: page }) => {
  await page.goto("/#plataforma");
  const seccion = page.getByRole("region", { name: "Explora la plataforma." });
  for (const nombre of ["Calificaciones", "Análisis", "Estudiantes", "Alertas", "Grupos", "Actividades", "Materias", "Usuarios y administración"]) {
    await expect(seccion.getByText(nombre, { exact: true }).first()).toBeVisible();
  }
  // Cada captura visible cargó de verdad (desplazándose para activar las diferidas).
  const imagenes = seccion.locator("img:visible");
  const total = await imagenes.count();
  expect(total).toBeGreaterThanOrEqual(8);
  for (let i = 0; i < total; i++) {
    await imagenes.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => imagenes.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});

test("Landing: el recorrido en video es real, no se reproduce solo y su música se controla", async ({ guardedPage: page }) => {
  await page.goto("/#recorrido");
  await expect(page.getByRole("heading", { name: "Conoce cómo funciona ClassKids" })).toBeVisible();
  const video = page.locator("video");
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute("src", /recorrido-classkids-v3\.webm$/);
  const info = await video.evaluate(async (v: HTMLVideoElement) => {
    if (v.readyState < 1) await new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }));
    return { ancho: v.videoWidth, alto: v.videoHeight, duracion: v.duration, pausado: v.paused, autoplay: v.autoplay, volumen: v.volume };
  });
  expect(info).toMatchObject({ ancho: 1280, alto: 720, pausado: true, autoplay: false, volumen: 0.4 });
  expect(info.duracion).toBeGreaterThan(60);
  // «Ver video» lo reproduce de verdad, con su pista de música.
  await page.getByRole("button", { name: "Ver video" }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(1.5);
  expect(await video.evaluate((v: HTMLVideoElement & { webkitAudioDecodedByteCount?: number }) => v.webkitAudioDecodedByteCount ?? 1)).toBeGreaterThan(0);
  // Controles accesibles de la música: silenciar, volver a activar y ajustar el volumen.
  const musica = page.getByRole("group", { name: "Música del video" });
  await musica.getByRole("button", { name: "Silenciar la música" }).click();
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  await expect(musica.getByRole("button", { name: "Activar la música" })).toHaveAttribute("aria-pressed", "false");
  await musica.getByRole("button", { name: "Activar la música" }).click();
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
  await musica.getByRole("slider", { name: "Volumen de la música" }).fill("20");
  expect(await video.evaluate((v: HTMLVideoElement) => v.volume)).toBeCloseTo(0.2);
});

test("Landing: el flujo se cuenta con pantallas reales del celular, sin cifras ni gráficas propias", async ({ guardedPage: page }) => {
  await page.goto("/#metodo");
  const seccion = page.getByRole("region", { name: "Un flujo simple para decisiones más oportunas." });
  const pantallas = seccion.locator("img:visible");
  await expect(pantallas).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await pantallas.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => pantallas.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(seccion.getByRole("img", { name: /Promedio por grupo:/ })).toHaveCount(0);
  await expect(seccion).toContainText("datos ficticios de demostración");
});

test("Landing: en modo oscuro se muestran las capturas oscuras", async ({ guardedPage: page }) => {
  await page.goto("/");
  const visible = () => page.locator("figure img:visible").first().getAttribute("src");
  expect(await visible()).toMatch(/dashboard-claro/);
  await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await visible()).toMatch(/dashboard-oscuro/);
});

test.describe("Landing en celular", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("sin desplazamiento lateral y con las acciones principales visibles", async ({ guardedPage: page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await expect(page.getByRole("link", { name: /Conoce ClassKids/ })).toBeInViewport();
    await expect(page.getByRole("link", { name: /Iniciar sesión/ }).first()).toBeInViewport();
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBe(0);
  });

  test("el video se puede reproducir en el celular", async ({ guardedPage: page }) => {
    await page.goto("/#recorrido");
    await page.getByRole("button", { name: "Ver video" }).click();
    await expect.poll(() => page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.5);
  });
});

test("Inicio de sesión: sin patrones de puntos ni retícula en ningún tema", async ({ guardedPage: page }) => {
  for (const tema of ["light", "dark"]) {
    await page.addInitScript((t) => localStorage.setItem("classkids-tema", t), tema);
    await page.goto("/auth");
    await expect(page.getByRole("heading", { name: "Inicia sesión" })).toBeVisible();
    const conPatron = await page.evaluate(() => [...document.querySelectorAll("*")].some((el) =>
      [getComputedStyle(el), getComputedStyle(el, "::before"), getComputedStyle(el, "::after")].some((s) => /gradient/.test(s.backgroundImage) && /\d+px \d+px/.test(s.backgroundSize))));
    expect(conPatron).toBe(false);
  }
});
