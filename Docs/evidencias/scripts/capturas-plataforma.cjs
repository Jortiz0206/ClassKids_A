// Evidencias VIGENTES de toda la plataforma — SOLO entorno de pruebas.
// Frontend http://localhost:8081 → backend http://127.0.0.1:8001 → base classkids_test (puerto 5433).
//
// Uso (desde la raíz, con el entorno de pruebas levantado; ver e2e/README.md):
//   CK_DOCENTE_PASS=... CK_ADMIN_PASS=... TEMA=light node Docs/evidencias/scripts/capturas-plataforma.cjs
//   CK_DOCENTE_PASS=... CK_ADMIN_PASS=... TEMA=dark  node Docs/evidencias/scripts/capturas-plataforma.cjs
//   python Docs/evidencias/scripts/rotular-capturas.py Docs/evidencias/capturas-v3/vigente
// SOLO_LANDING=1: solo la landing (completa, portada, flujo), el video y el Dashboard del docente (no escribe nada en la base);
//   el índice de esas carpetas se combina con el existente.
//
// Salida: Docs/evidencias/capturas-v3/vigente/<carpeta>/AAAA-MM-DD_<vista>_<dispositivo>_<tema>.png
//   carpetas: landing, dashboard, login, modulos/<modulo>, video.
// Salvaguardas: cualquier petición al backend real (:8000) detiene el script. Única escritura:
// el mensaje de éxito de Calificaciones cambia la entrega de un estudiante en classkids_test y
// la restaura enseguida (se comprueba por la API). Los diálogos de borrar o desactivar se
// capturan y se cancelan: no se borra ni se desactiva nada.
const { chromium, devices } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const TEMA = process.env.TEMA === "dark" ? "dark" : "light";
const TEMA_ES = TEMA === "dark" ? "oscuro" : "claro";
const SOLO_LANDING = !!process.env.SOLO_LANDING;
const FECHA = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Bogota" }); // AAAA-MM-DD
const OUT = path.join(__dirname, "..", "capturas-v3", "vigente");
const B = "http://localhost:8081";
const API = "http://127.0.0.1:8001";
fs.mkdirSync(OUT, { recursive: true });
const indice = {};

async function sesion(rol) {
  const email = rol === "admin" ? "admin@classkids.local" : rol === "matematicas" ? "matematicas@classkids.local" : "docente@classkids.local";
  const password = rol === "admin" ? process.env.CK_ADMIN_PASS : process.env.CK_DOCENTE_PASS;
  if (!password) throw new Error("Defina CK_DOCENTE_PASS y CK_ADMIN_PASS (contraseñas demo de la base de pruebas).");
  const r = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error(`Login de prueba falló (${r.status})`);
  return r.json();
}

async function contexto(browser, { movil = false, s = null } = {}) {
  const ctx = await browser.newContext(movil
    ? { ...devices["iPhone 13"], locale: "es-CO", timezoneId: "America/Bogota" }
    : { viewport: { width: 1366, height: 860 }, locale: "es-CO", timezoneId: "America/Bogota" });
  await ctx.addInitScript((t) => localStorage.setItem("classkids-tema", t), TEMA);
  if (s) await ctx.addInitScript(([t, u]) => { localStorage.setItem("classkids_token", t); localStorage.setItem("classkids_user", u); }, [s.access_token, JSON.stringify(s.user)]);
  const page = await ctx.newPage();
  page.on("request", (q) => { if (q.url().includes(":8000")) { console.error("Petición al backend REAL:", q.url()); process.exit(2); } });
  return { ctx, page, movil };
}

async function esperar(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForFunction(() => !document.querySelector('[role="status"][aria-live]') && !/Cargando|Calculando/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(700);
}

async function foto(c, carpeta, vista, descripcion, { completa = false, elemento = null } = {}) {
  const { page, movil } = c;
  const dispositivo = movil ? "celular" : "escritorio";
  const archivo = `${FECHA}_${vista}_${dispositivo}_${TEMA_ES}.png`;
  const dir = path.join(OUT, carpeta);
  fs.mkdirSync(dir, { recursive: true });
  // Comprueba que la página realmente está en el tema pedido.
  const temaReal = await page.evaluate(() => (document.documentElement.classList.contains("dark") ? "oscuro" : "claro"));
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (elemento && SOLO_LANDING && carpeta === "landing") {
    // Recorte sobre la página entera con el desplazamiento arriba: así la cabecera fija no queda
    // superpuesta en medio de una sección más alta que la pantalla.
    await elemento.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const caja = await elemento.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; });
    await page.screenshot({ path: path.join(dir, archivo), fullPage: true, clip: caja });
  } else if (elemento) {
    await elemento.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await elemento.screenshot({ path: path.join(dir, archivo) });
  } else if (completa && !movil) {
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: 1366, height: Math.min(Math.max(alto, 860), 9000) });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, archivo) });
    await page.setViewportSize({ width: 1366, height: 860 });
  } else {
    await page.screenshot({ path: path.join(dir, archivo), fullPage: completa });
  }
  (indice[carpeta] ||= []).push({ archivo, vista, modulo: carpeta, descripcion, dispositivo: movil ? "Celular 390 × 844" : "Escritorio 1366 px", tema: `Modo ${TEMA_ES}`, temaVerificado: temaReal === TEMA_ES, desborde, fecha: FECHA });
  console.log(temaReal === TEMA_ES ? "ok" : "TEMA DISTINTO", `${carpeta}/${archivo}`, desborde > 0 ? `desborde ${desborde}px` : "");
}

const ir = async (c, ruta) => { await c.page.goto(B + ruta); await esperar(c.page); };

async function abrirActividad1(page) {
  await page.getByRole("combobox").first().click(); await page.getByRole("option", { name: "Grado 1A", exact: true }).click();
  await page.getByRole("combobox").nth(1).click(); await page.getByRole("option", { name: /Taller de Sumas y Restas/ }).click();
  await page.getByLabel("Calificación de Isabella Díaz").waitFor(); await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch();
  const doc = await sesion("docente");
  const adm = await sesion("admin");
  const mate = await sesion("matematicas");
  let c;

  if (!SOLO_LANDING) {
  // ===== Público: escritorio =====
  c = await contexto(browser);
  await ir(c, "/legal/privacidad"); await foto(c, "landing", "politica-privacidad", "Política de privacidad");
  await ir(c, "/auth"); await foto(c, "login", "inicio-sesion", "Inicio de sesión");
  await c.page.fill("#email", "docente@classkids.local"); await c.page.fill("#password", "clave-incorrecta");
  await c.page.getByRole("button", { name: /Iniciar sesión/ }).click(); await c.page.getByRole("alert").first().waitFor(); await c.page.waitForTimeout(500);
  await foto(c, "login", "error-credenciales", "Mensaje de error: credenciales incorrectas");
  await ir(c, "/auth"); await c.page.getByRole("button", { name: "¿Olvidaste tu contraseña?" }).click(); await c.page.waitForTimeout(400);
  await foto(c, "login", "recuperar-contrasena", "Formulario de recuperación de contraseña");
  await ir(c, "/no-existe"); await foto(c, "login", "pagina-404", "Ruta inexistente");
  await c.ctx.close();

  // ===== Público: celular =====
  c = await contexto(browser, { movil: true });
  await ir(c, "/auth"); await foto(c, "login", "inicio-sesion", "Inicio de sesión");
  await c.page.fill("#email", "docente@classkids.local"); await c.page.fill("#password", "clave-incorrecta");
  await c.page.getByRole("button", { name: /Iniciar sesión/ }).click(); await c.page.getByRole("alert").first().waitFor(); await c.page.waitForTimeout(500);
  await foto(c, "login", "error-credenciales", "Mensaje de error: credenciales incorrectas");
  await c.ctx.close();

  // ===== Docente: escritorio =====
  c = await contexto(browser, { s: doc });
  // Estado de carga real: se retrasa 4 s la respuesta de /alertas (no se cambia su contenido).
  await c.page.route("**/127.0.0.1:8001/alertas", async (r) => { await new Promise((x) => setTimeout(x, 4000)); await r.continue().catch(() => {}); });
  await c.page.goto(B + "/app"); await c.page.waitForTimeout(1500);
  await foto(c, "dashboard", "estado-carga", "Estado de carga del Dashboard");
  await c.page.waitForTimeout(5000); await esperar(c.page); await c.page.unroute("**/127.0.0.1:8001/alertas");
  await ir(c, "/app"); await foto(c, "dashboard", "panel-docente", "Dashboard del docente", { completa: true });
  await ir(c, "/app/estudiantes"); await foto(c, "modulos/estudiantes", "lista", "Lista de estudiantes de los grupos del docente (página 1)");
  await c.page.getByText("Mateo Rodríguez").first().click(); await c.page.waitForTimeout(1000);
  await foto(c, "modulos/estudiantes", "detalle-observaciones", "Detalle del estudiante y observaciones");
  await c.page.keyboard.press("Escape");
  await c.page.getByRole("button", { name: /Nuevo Estudiante/ }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/estudiantes", "formulario-nuevo", "Formulario de nuevo estudiante");
  await c.page.keyboard.press("Escape");
  await c.page.getByPlaceholder("Buscar estudiante...").fill("zzz sin coincidencias"); await c.page.waitForTimeout(400);
  await foto(c, "modulos/estudiantes", "busqueda-sin-resultados", "Búsqueda sin resultados");
  await ir(c, "/app/grupos"); await foto(c, "modulos/grupos", "lista", "Grupos", { completa: true });
  await ir(c, "/app/actividades"); await foto(c, "modulos/actividades", "lista", "Actividades");
  await c.page.getByRole("button", { name: /Nueva Actividad/ }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/actividades", "formulario-nueva", "Formulario de nueva actividad");
  await c.page.keyboard.press("Escape");
  await ir(c, "/app/calificaciones"); await foto(c, "modulos/calificaciones", "sin-seleccion", "Calificaciones antes de elegir grupo (estado vacío)");
  await abrirActividad1(c.page); await foto(c, "modulos/calificaciones", "tabla-actividad", "Calificaciones de Grado 1A · Taller de Sumas y Restas", { completa: true });
  await c.page.getByLabel("Calificación de Mariana Acosta").fill("3.8"); await c.page.waitForTimeout(300);
  await foto(c, "modulos/calificaciones", "fila-editada-equivalencia", "Fila editada sin guardar con su equivalencia");
  // Mensaje de éxito real: cambia la entrega de Lucas Hernández, guarda y la restaura.
  await ir(c, "/app/calificaciones"); await abrirActividad1(c.page);
  const sw = c.page.getByLabel("Entregado: Lucas Hernández");
  const original = await sw.getAttribute("aria-checked");
  await sw.click(); await c.page.getByRole("button", { name: "Guardar cambios (1)" }).click();
  await c.page.getByText(/Calificaciones guardadas correctamente/).first().waitFor(); await c.page.waitForTimeout(300);
  await foto(c, "modulos/calificaciones", "guardado-exito", "Mensaje de éxito al guardar");
  await c.page.waitForTimeout(800);
  if ((await c.page.getByLabel("Entregado: Lucas Hernández").getAttribute("aria-checked")) !== original) {
    await c.page.getByLabel("Entregado: Lucas Hernández").click(); await c.page.getByRole("button", { name: "Guardar cambios (1)" }).click();
    await c.page.getByText(/Calificaciones guardadas correctamente/).first().waitFor();
  }
  const cal = await (await fetch(`${API}/calificaciones?actividad_id=1`, { headers: { Authorization: `Bearer ${doc.access_token}` } })).json();
  console.log("Restauración comprobada: entregado de Lucas Hernández =", cal.filter((x) => x.estudiante_id === 4).map((x) => x.entregado));
  await ir(c, "/app/analisis"); await foto(c, "modulos/analisis", "rendimiento", "Análisis de rendimiento", { completa: true });
  await ir(c, "/app/alertas"); await foto(c, "modulos/alertas", "lista", "Alertas tempranas", { completa: true });
  await c.page.getByText("Santiago Guerrero").first().click(); await c.page.waitForTimeout(600);
  await foto(c, "modulos/alertas", "detalle", "Detalle de una alerta");
  await c.page.keyboard.press("Escape");
  // Error de conexión: se corta la petición /alertas para mostrar el estado de error de la interfaz.
  await c.page.route("**/127.0.0.1:8001/alertas", (r) => r.abort());
  await c.page.goto(B + "/app/alertas"); await c.page.waitForTimeout(2500);
  await foto(c, "modulos/alertas", "error-conexion", "Estado de error de conexión (petición cortada a propósito)");
  await c.page.unroute("**/127.0.0.1:8001/alertas");
  // El docente solo consulta sus materias (H-08); las acciones de catálogo se capturan con el administrador.
  await ir(c, "/app/materias"); await foto(c, "modulos/materias", "mis-materias-docente", "Materias asignadas al docente (solo consulta)");
  await c.page.getByRole("tab", { name: "Vista por Grupos" }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/materias", "mis-asignaciones-docente", "Asignaciones del docente por grupo");
  await c.ctx.close();

  // ===== Docente de una sola materia (Matemáticas en 7 grupos): permisos por asignación =====
  c = await contexto(browser, { s: mate });
  await ir(c, "/app"); await foto(c, "dashboard", "panel-docente-una-materia", "Dashboard de un docente con una materia: solo sus grupos, sus notas y sus alertas", { completa: true });
  await ir(c, "/app/analisis"); await foto(c, "modulos/analisis", "rendimiento-docente-una-materia", "Análisis del docente de Matemáticas: solo su materia y sus grupos", { completa: true });
  await c.ctx.close();

  // ===== Docente: celular =====
  c = await contexto(browser, { movil: true, s: doc });
  await ir(c, "/app"); await foto(c, "dashboard", "panel-docente", "Dashboard con navegación inferior");
  await ir(c, "/app/estudiantes"); await foto(c, "modulos/estudiantes", "lista", "Estudiantes en tarjetas");
  await c.page.getByText("Mateo Rodríguez").first().click(); await c.page.waitForTimeout(900);
  await foto(c, "modulos/estudiantes", "detalle-observaciones", "Detalle del estudiante");
  await c.page.keyboard.press("Escape");
  await ir(c, "/app/grupos"); await foto(c, "modulos/grupos", "lista", "Grupos");
  await ir(c, "/app/actividades"); await foto(c, "modulos/actividades", "lista", "Actividades");
  await ir(c, "/app/calificaciones"); await abrirActividad1(c.page);
  await c.page.getByLabel("Calificación de Mariana Acosta").fill("3.8"); await c.page.waitForTimeout(400);
  await c.page.getByLabel("Calificación de Mariana Acosta").scrollIntoViewIfNeeded();
  await foto(c, "modulos/calificaciones", "tabla-actividad", "Calificaciones con barra de guardado");
  await ir(c, "/app/analisis"); await foto(c, "modulos/analisis", "rendimiento", "Análisis");
  await ir(c, "/app/alertas"); await foto(c, "modulos/alertas", "lista", "Alertas");
  await ir(c, "/app/materias"); await foto(c, "modulos/materias", "mis-materias-docente", "Materias asignadas al docente");
  await ir(c, "/app"); await c.page.getByRole("button", { name: "Más" }).click(); await c.page.waitForTimeout(600);
  await foto(c, "dashboard", "menu-mas-docente", "Menú «Más» del docente (sin módulos de administración)");
  await c.ctx.close();

  // ===== Administrador: escritorio =====
  c = await contexto(browser, { s: adm });
  await ir(c, "/admin"); await foto(c, "modulos/usuarios", "panel-administracion", "Panel de administración");
  await ir(c, "/admin/usuarios"); await foto(c, "modulos/usuarios", "usuarios-roles", "Usuarios y roles");
  await c.page.getByRole("button", { name: /Invitar docente/ }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/usuarios", "invitar-docente", "Formulario de invitación");
  await c.page.keyboard.press("Escape");
  await c.page.getByRole("button", { name: "Desactivar a matematicas@classkids.local" }).click(); await c.page.waitForTimeout(400);
  await foto(c, "modulos/usuarios", "confirmar-desactivar", "Confirmación antes de desactivar (se canceló)");
  await c.page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
  await ir(c, "/admin/datos"); await foto(c, "modulos/usuarios", "datos-globales", "Datos globales");
  // Visión general del administrador en los módulos académicos y acciones de catálogo (H-08).
  await ir(c, "/app"); await foto(c, "dashboard", "panel-administrador-general", "Dashboard del administrador: visión general del colegio", { completa: true });
  await ir(c, "/app/grupos");
  await c.page.getByRole("button", { name: /Nuevo Grupo/ }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/grupos", "formulario-nuevo", "Formulario de nuevo grupo (administrador)");
  await c.page.keyboard.press("Escape");
  await ir(c, "/app/materias"); await foto(c, "modulos/materias", "catalogo", "Catálogo de materias (administrador)");
  await c.page.getByRole("button", { name: "Eliminar la materia Matemáticas" }).click(); await c.page.waitForTimeout(400);
  await foto(c, "modulos/materias", "confirmar-eliminar", "Confirmación antes de eliminar (se canceló)");
  await c.page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
  await c.page.getByRole("tab", { name: "Vista por Grupos" }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/materias", "vista-por-grupos", "Materias asignadas en cada grupo, con su docente");
  await c.page.getByRole("button", { name: /Vincular a Grupo/ }).click(); await c.page.waitForTimeout(500);
  await foto(c, "modulos/materias", "formulario-vincular", "Formulario para vincular una materia a un grupo");
  await c.page.keyboard.press("Escape");
  await ir(c, "/app/analisis");
  await c.page.getByRole("combobox", { name: "Materia" }).click(); await c.page.getByRole("option", { name: "Matemáticas", exact: true }).click();
  await c.page.waitForTimeout(1200);
  await foto(c, "modulos/analisis", "filtro-por-materia", "Análisis filtrado por una materia (Matemáticas), sin mezclar otras", { completa: true });
  await c.ctx.close();

  // ===== Administrador: celular =====
  c = await contexto(browser, { movil: true, s: adm });
  await ir(c, "/admin"); await foto(c, "modulos/usuarios", "panel-administracion", "Panel de administración con barra inferior");
  await ir(c, "/admin/usuarios"); await foto(c, "modulos/usuarios", "usuarios-roles", "Usuarios");
  await ir(c, "/app"); await c.page.getByRole("button", { name: "Más" }).click(); await c.page.waitForTimeout(600);
  await foto(c, "modulos/usuarios", "menu-mas-administrador", "Menú «Más» del administrador (incluye Usuarios)");
  await c.ctx.close();
  } // fin de !SOLO_LANDING

  // ===== Landing y video (público) =====
  for (const movil of [false, true]) {
    c = await contexto(browser, { movil });
    await ir(c, "/");
    const alto = await c.page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < alto; y += 500) { await c.page.evaluate((yy) => window.scrollTo(0, yy), y); await c.page.waitForTimeout(60); }
    await c.page.evaluate(() => window.scrollTo(0, 0)); await c.page.waitForTimeout(500);
    await foto(c, "landing", "pagina-completa", "Landing completa", { completa: true });
    await foto(c, "landing", "portada", "Portada: mensaje, acciones y panel real integrado");
    if (!SOLO_LANDING) {
      await foto(c, "landing", "funcionalidades", "Franja de funcionalidades", { elemento: c.page.getByRole("list", { name: "Funciones principales" }) });
      if (!movil) await foto(c, "landing", "panel-en-portada", "Panel real integrado en la portada", { elemento: c.page.locator("#titulo-portada").locator("xpath=ancestor::section[1]").locator("figure").first() });
      await foto(c, "landing", "presentacion-modulos", "Presentación de los módulos reales", { elemento: c.page.locator("#plataforma") });
    }
    await foto(c, "landing", "flujo-acompanamiento", "Flujo de acompañamiento con pantallas reales en el celular", { elemento: c.page.locator("#metodo") });
    // Video: se reproduce de verdad con «Ver video» y se captura en reproducción, con sus controles.
    await c.page.getByRole("button", { name: "Ver video" }).click();
    await c.page.waitForFunction(() => { const v = document.querySelector("video"); return v && v.currentTime > 6; }, null, { timeout: 30000 });
    await c.page.locator("video").hover(); await c.page.waitForTimeout(300);
    const t = await c.page.evaluate(() => { const v = document.querySelector("video"); return { tiempo: v.currentTime.toFixed(1), pausado: v.paused, silenciado: v.muted, volumen: v.volume, bytesAudio: v.webkitAudioDecodedByteCount ?? null }; });
    console.log("video", JSON.stringify(t));
    await foto(c, "video", "reproduciendo", `Video del recorrido con música, en reproducción (segundo ${t.tiempo}), con sus controles de audio`, { elemento: c.page.locator("#recorrido") });
    await c.ctx.close();
  }

  if (SOLO_LANDING) {
    for (const movil of [false, true]) {
      c = await contexto(browser, { movil, s: doc });
      await ir(c, "/app"); await foto(c, "dashboard", "panel-docente", movil ? "Dashboard con navegación inferior" : "Dashboard del docente", { completa: !movil });
      await c.ctx.close();
    }
  }

  for (const [carpeta, lista] of Object.entries(indice)) {
    const destino = path.join(OUT, carpeta, `indice-${TEMA_ES}.json`);
    let final = lista;
    if (SOLO_LANDING && fs.existsSync(destino)) {
      // Conserva las vistas que no se volvieron a tomar; las retomadas reemplazan a las anteriores.
      const nuevas = new Set(lista.map((i) => `${i.vista}|${i.dispositivo}`));
      final = JSON.parse(fs.readFileSync(destino, "utf-8")).filter((i) => !nuevas.has(`${i.vista}|${i.dispositivo}`)).concat(lista);
    }
    fs.writeFileSync(destino, JSON.stringify(final, null, 2));
  }
  await browser.close();
  const todas = Object.values(indice).flat();
  const mal = todas.filter((i) => !i.temaVerificado || i.desborde > 0);
  console.log(`${todas.length} capturas en ${OUT}; con problemas de tema o desborde: ${mal.length}`);
})().catch((e) => { console.error("ERROR", e.message); process.exit(1); });
