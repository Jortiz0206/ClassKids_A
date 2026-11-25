// Capturas REALES de la aplicación para la landing (frontend/src/assets/producto/).
// SOLO entorno de pruebas: frontend http://localhost:8081 → API http://127.0.0.1:8001 → base classkids_test.
// No escribe nada en la base: solo navega y abre selectores.
//
// Uso (desde la raíz, con el entorno de pruebas levantado):
//   CK_DOCENTE_PASS=... CK_ADMIN_PASS=... node Docs/evidencias/scripts/capturas-producto-landing.cjs
//   python Docs/evidencias/scripts/optimizar-producto-landing.py   (PNG → WebP)
// Solo las vistas de celular de la sección «Un flujo simple…»:  SOLO_MOVIL=1 CK_DOCENTE_PASS=... node ...
const { chromium, devices } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const B = "http://localhost:8081";
const API = "http://127.0.0.1:8001";
const OUT = path.join(__dirname, "..", "..", "..", "frontend", "src", "assets", "producto", "_png");
fs.mkdirSync(OUT, { recursive: true });

async function esperar(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForFunction(() => !/Cargando|Calculando/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(900);
}

(async () => {
  const password = process.env.CK_DOCENTE_PASS;
  if (!password) throw new Error("Defina CK_DOCENTE_PASS (contraseña demo de la base de pruebas).");
  const r = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "docente@classkids.local", password }) });
  if (!r.ok) throw new Error(`Login de prueba falló (${r.status})`);
  const s = await r.json();
  if (!process.env.CK_ADMIN_PASS) throw new Error("Defina CK_ADMIN_PASS para la captura de administración.");
  const ra = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@classkids.local", password: process.env.CK_ADMIN_PASS }) });
  if (!ra.ok) throw new Error(`Login de administrador falló (${ra.status})`);
  const sa = await ra.json();
  const browser = await chromium.launch();

  // Vistas de celular (iPhone 13) para la composición del flujo en la landing. Solo lectura:
  // la nota de Mariana Acosta se escribe para mostrar la equivalencia, pero NO se guarda.
  for (const tema of ["light", "dark"]) {
    const sufijo = tema === "dark" ? "oscuro" : "claro";
    const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "es-CO", timezoneId: "America/Bogota" });
    await ctx.addInitScript(([t, tok, u]) => {
      localStorage.setItem("classkids-tema", t);
      localStorage.setItem("classkids_token", tok);
      localStorage.setItem("classkids_user", u);
    }, [tema, s.access_token, JSON.stringify(s.user)]);
    const page = await ctx.newPage();
    page.on("request", (q) => { if (q.url().includes(":8000")) { console.error("Petición al backend REAL:", q.url()); process.exit(2); } });
    page.on("request", (q) => { if (q.method() !== "GET" && q.method() !== "OPTIONS" && q.url().includes(":8001") && !q.url().includes("/auth/")) { console.error("Escritura no permitida:", q.method(), q.url()); process.exit(3); } });
    const foto = (nombre) => page.screenshot({ path: path.join(OUT, `movil-${nombre}-${sufijo}.png`) });
    await page.goto(B + "/app/calificaciones"); await esperar(page);
    await page.getByRole("combobox").first().click(); await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
    await page.getByRole("combobox").nth(1).click(); await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
    await page.getByLabel("Calificación de Mariana Acosta").fill("3.8"); await page.waitForTimeout(400);
    await page.getByLabel("Calificación de Mariana Acosta").evaluate((el) => { el.blur(); el.scrollIntoView({ block: "center" }); }); await page.waitForTimeout(500);
    await foto("calificaciones");
    await page.goto(B + "/app/alertas"); await esperar(page);
    await page.getByText("Santiago Guerrero").first().click(); await page.waitForTimeout(900);
    await foto("alerta");
    await page.goto(B + "/app/estudiantes"); await esperar(page);
    await page.getByText("Mateo Rodríguez").first().click(); await page.waitForTimeout(1000);
    await foto("estudiante");
    console.log(sufijo, "celular, tema verificado:", (await page.evaluate(() => document.documentElement.classList.contains("dark"))) === (tema === "dark"));
    await ctx.close();
  }
  if (process.env.SOLO_MOVIL) { await browser.close(); return; }

  for (const tema of ["light", "dark"]) {
    const sufijo = tema === "dark" ? "oscuro" : "claro";
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-CO", timezoneId: "America/Bogota" });
    await ctx.addInitScript(([t, tok, u]) => {
      localStorage.setItem("classkids-tema", t);
      localStorage.setItem("classkids_token", tok);
      localStorage.setItem("classkids_user", u);
    }, [tema, s.access_token, JSON.stringify(s.user)]);
    const page = await ctx.newPage();
    page.on("request", (q) => { if (q.url().includes(":8000")) { console.error("Petición al backend REAL:", q.url()); process.exit(2); } });
    const ir = async (ruta) => { await page.goto(B + ruta); await esperar(page); };
    // Pantalla completa (con menú) para la portada; solo el contenido principal para los módulos.
    const completa = async (nombre) => page.screenshot({ path: path.join(OUT, `${nombre}-${sufijo}.png`) });
    const contenido = async (nombre) => {
      const caja = await page.locator("main").boundingBox();
      await page.screenshot({ path: path.join(OUT, `${nombre}-${sufijo}.png`), clip: { x: caja.x + 20, y: 0, width: caja.width - 20, height: 900 } });
    };

    await ir("/app"); await completa("dashboard");
    await ir("/app/estudiantes"); await contenido("estudiantes");
    await ir("/app/grupos"); await contenido("grupos");
    await ir("/app/actividades"); await contenido("actividades");
    await ir("/app/calificaciones");
    await page.getByRole("combobox").first().click(); await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
    await page.getByRole("combobox").nth(1).click(); await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
    await page.getByLabel("Calificación de Isabella Díaz").waitFor(); await page.evaluate(() => document.activeElement?.blur()); await page.waitForTimeout(600);
    await contenido("calificaciones");
    await ir("/app/analisis"); await contenido("analisis");
    await ir("/app/alertas"); await contenido("alertas");
    await ir("/app/materias"); await contenido("materias");
    // Administración (solo lectura): otra sesión, la del administrador de la base de pruebas.
    await page.evaluate(([tok, u]) => { localStorage.setItem("classkids_token", tok); localStorage.setItem("classkids_user", u); }, [sa.access_token, JSON.stringify(sa.user)]);
    await ctx.addInitScript(([tok, u]) => { localStorage.setItem("classkids_token", tok); localStorage.setItem("classkids_user", u); }, [sa.access_token, JSON.stringify(sa.user)]);
    await ir("/admin/usuarios"); await contenido("usuarios");
    const enOscuro = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    console.log(sufijo, "tema verificado:", enOscuro === (tema === "dark"));
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
