// Graba la IMAGEN del recorrido en video: uso real de la app en el entorno de pruebas
// (frontend 8081 → API 8001 → base classkids_test), con los datos de demostración.
//
// Interacciones reales (v3, después de H-08; nota de 0.0 a 5.0 desde la etapa de demostración): landing, acceso del docente con sus asignaciones e
// indicadores por materia, ficha de un estudiante, una nota escrita SIN guardar, filtro por materia,
// detalle de una alerta, acceso del administrador con su visión general, Materias, Usuarios y tema.
// Salvaguardas: cualquier petición al backend real (:8000) o cualquier escritura en la API de
// pruebas distinta del inicio de sesión detiene el script. No se guarda nada.
//
// Uso (desde la raíz):  CK_DOCENTE_PASS=... CK_ADMIN_PASS=... node Docs/evidencias/scripts/grabar-recorrido.cjs
// Deja la grabación sin sonido en <temporal>/classkids-recorrido/ e imprime el segundo en que
// empieza la portada. Después:  python Docs/evidencias/scripts/montar-recorrido.py <grabación> <inicio>
const { chromium } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const B = "http://localhost:8081";
const TMP = path.join(os.tmpdir(), "classkids-recorrido");
const PLANTICA = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "..", "..", "..", "frontend", "src", "assets", "mascota-classkids.png")).toString("base64");
const LEMA = "Aprender · Crecer · Avanzar";

(async () => {
  const password = process.env.CK_DOCENTE_PASS;
  const claveAdmin = process.env.CK_ADMIN_PASS;
  if (!password || !claveAdmin) throw new Error("Defina CK_DOCENTE_PASS y CK_ADMIN_PASS (contraseñas demo de la base de pruebas).");
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const browser = await chromium.launch();

  // Calentamiento sin grabar: el servidor de desarrollo compila cada pantalla la primera vez
  // que se abre; así el video no muestra esperas que no ocurren en uso normal.
  {
    const r = await fetch("http://127.0.0.1:8001/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "docente@classkids.local", password }) });
    if (!r.ok) throw new Error(`Login de prueba falló (${r.status})`);
    const s = await r.json();
    const previo = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await previo.addInitScript(([t, u]) => { localStorage.setItem("classkids_token", t); localStorage.setItem("classkids_user", u); }, [s.access_token, JSON.stringify(s.user)]);
    const p = await previo.newPage();
    for (const ruta of ["/auth", "/app", "/app/estudiantes", "/app/calificaciones", "/app/analisis", "/app/alertas", "/app/grupos", "/app/actividades", "/app/materias"]) {
      await p.goto(B + ruta); await p.waitForLoadState("networkidle").catch(() => {});
    }
    await previo.close();
  }

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: TMP, size: { width: 1280, height: 720 } },
    locale: "es-CO",
    timezoneId: "America/Bogota",
  });
  await ctx.addInitScript(([plantica, lema]) => {
    if (!sessionStorage.getItem("__tema")) { localStorage.setItem("classkids-tema", "light"); sessionStorage.setItem("__tema", "1"); }
    const estilo = () => {
      if (document.getElementById("__estilo")) return;
      const s = document.createElement("style");
      s.id = "__estilo";
      s.textContent = `
        #__cursor{position:fixed;z-index:100001;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(18,128,92,.28);border:2px solid #12805C;pointer-events:none;transition:transform .15s}
        #__cursor.clic{transform:scale(.7);background:rgba(18,128,92,.5)}
        #__rotulo{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99999;display:flex;align-items:center;gap:14px;background:rgba(29,43,69,.95);color:#fff;padding:12px 24px 12px 14px;border-radius:18px;font-family:'DM Sans',sans-serif;box-shadow:0 18px 40px -16px rgba(0,0,0,.5);min-width:500px;transition:opacity .3s}
        #__rotulo img{width:40px;height:40px;border-radius:12px;background:#DDF4EA;padding:3px}
        #__rotulo b{display:block;font:700 19px 'Bricolage Grotesque','DM Sans',sans-serif}
        #__rotulo span{display:block;font-size:14.5px;opacity:.85;margin-top:2px}
        #__portada{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;text-align:center;color:#1D2B45;font-family:'DM Sans',sans-serif;
          background:radial-gradient(60% 70% at 15% 20%,#DDF4EA 0,transparent 70%),radial-gradient(55% 60% at 85% 25%,#E4E9FF 0,transparent 70%),radial-gradient(60% 60% at 60% 95%,#DDEFFF 0,transparent 70%),#F7FAFC;transition:opacity .5s}
        #__portada img{width:132px;height:132px;border-radius:32px;background:#DDF4EA;padding:10px;box-shadow:0 24px 50px -24px rgba(29,43,69,.45)}
        #__portada .marca{font:700 64px 'Bricolage Grotesque','DM Sans',sans-serif;letter-spacing:-.02em;margin-top:22px}
        #__portada .lema{display:inline-block;margin-top:10px;background:#DDF4EA;color:#0E6B4C;font-weight:600;font-size:18px;padding:7px 18px;border-radius:999px}
        #__portada .detalle{font-size:22px;margin-top:22px;color:#46546B}`;
      document.head.appendChild(s);
    };
    window.__portada = (detalle) => {
      estilo();
      let el = document.getElementById("__portada");
      if (!detalle) { if (el) { el.style.opacity = "0"; setTimeout(() => el.remove(), 600); } return; }
      if (!el) { el = document.createElement("div"); el.id = "__portada"; document.body.appendChild(el); }
      el.innerHTML = `<div><img src="${plantica}" alt=""><div class="marca">ClassKids</div><div class="lema">${lema}</div><div class="detalle">${detalle}</div></div>`;
    };
    window.__rotulo = (titulo, detalle) => {
      estilo();
      let el = document.getElementById("__rotulo");
      if (!el) { el = document.createElement("div"); el.id = "__rotulo"; document.body.appendChild(el); }
      el.innerHTML = `<img src="${plantica}" alt=""><div><b>${titulo}</b><span>${detalle}</span></div>`;
    };
    // Cursor visible para que se entiendan los clics (la grabación no muestra el puntero).
    document.addEventListener("DOMContentLoaded", () => {
      estilo();
      const c = document.createElement("div"); c.id = "__cursor"; c.style.left = "-40px"; c.style.top = "-40px"; document.body.appendChild(c);
      addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
      addEventListener("mousedown", () => c.classList.add("clic"), true);
      addEventListener("mouseup", () => c.classList.remove("clic"), true);
      if (sessionStorage.getItem("__intro") !== "fin") window.__portada("Recorrido por la plataforma");
    });
  }, [PLANTICA, LEMA]);

  const page = await ctx.newPage();
  const t0 = Date.now();
  page.on("request", (q) => {
    if (q.url().includes(":8000")) { console.error("Petición al backend REAL:", q.url()); process.exit(2); }
    if (q.url().includes(":8001") && !["GET", "OPTIONS"].includes(q.method()) && !q.url().includes("/auth/login")) { console.error("Escritura no permitida:", q.method(), q.url()); process.exit(3); }
  });
  const pausa = (ms) => page.waitForTimeout(ms);
  const esperar = async () => {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForFunction(() => !/Cargando|Calculando/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  };
  const rotulo = (t, d) => page.evaluate(([a, b]) => window.__rotulo(a, b), [t, d]);
  const bajar = async (y) => { await page.evaluate((v) => window.scrollTo({ top: v, behavior: "smooth" }), y); await pausa(1300); };
  let raton = { x: 640, y: 360 };
  const mover = async (loc) => {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await page.mouse.move(x, y, { steps: Math.max(8, Math.round(Math.hypot(x - raton.x, y - raton.y) / 25)) });
    raton = { x, y };
  };
  const clic = async (loc, espera = 350) => { await mover(loc); await pausa(espera); await loc.click(); };
  // Aparta el cursor para que no tape lo que se acaba de escribir.
  const apartar = async () => { const x = raton.x + 150, y = raton.y + 90; await page.mouse.move(x, y, { steps: 10 }); raton = { x, y }; };
  const menu = (nombre) => page.getByRole("complementary", { name: "Menú principal" }).getByRole("link", { name: new RegExp(`^${nombre}`) }).first();
  const ir = async (nombre, titulo, detalle) => {
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await clic(menu(nombre), 250);
    await rotulo(titulo, detalle);
    await esperar();
  };

  // 1. Portada y landing (página pública real)
  await page.goto(B + "/");
  await page.locator("#__portada").waitFor();
  const inicio = (Date.now() - t0) / 1000;
  await esperar(); await pausa(3000);
  await page.evaluate(() => { sessionStorage.setItem("__intro", "fin"); window.__portada(null); });
  await pausa(900);
  await rotulo("Página de inicio", "ClassKids acompaña a los docentes en el seguimiento de cada estudiante");
  await pausa(2600);
  await page.evaluate(() => document.getElementById("metodo")?.scrollIntoView({ behavior: "smooth", block: "start" })); await pausa(1800);
  await rotulo("Un flujo simple", "Calificación, alerta y seguimiento, con pantallas reales de la aplicación");
  await pausa(2600);
  await page.evaluate(() => { document.getElementById("__rotulo")?.remove(); window.scrollTo({ top: 0, behavior: "smooth" }); }); await pausa(1200);

  // 2. Acceso del docente (cuenta de demostración)
  const entrar = async (email, clave, titulo, detalle) => {
    await rotulo(titulo, detalle);
    await clic(page.locator("#email"));
    await page.locator("#email").pressSequentially(email, { delay: 40 });
    await clic(page.locator("#password"), 200);
    await page.locator("#password").pressSequentially(clave, { delay: 50 });
    await pausa(350);
    await clic(page.getByRole("button", { name: /Iniciar sesión/ }));
    await page.waitForURL(/\/app/); await esperar();
  };
  await clic(page.getByRole("link", { name: /Iniciar sesión/ }).first()); await esperar(); await pausa(600);
  await entrar("docente@classkids.local", password, "Inicio de sesión del docente", "Cada docente entra con su cuenta y ve solo sus asignaciones");

  // 3. Dashboard del docente: sus asignaciones e indicadores por materia
  await rotulo("Dashboard del docente", "Solo sus grupos, sus estudiantes, sus actividades y sus alertas");
  await pausa(2800);
  await page.getByRole("heading", { name: "Mis asignaciones" }).evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "start" })); await pausa(1300);
  await rotulo("Mis asignaciones", "El promedio de cada materia en cada grupo, sin mezclar materias");
  await pausa(3400); await bajar(0); await pausa(400);

  // 4. Estudiantes de sus grupos y ficha
  await ir("Estudiantes", "Estudiantes de sus grupos", "Búsqueda, estado y tendencia de cada estudiante");
  await pausa(900);
  await clic(page.getByPlaceholder("Buscar estudiante..."));
  await page.getByPlaceholder("Buscar estudiante...").pressSequentially("Mateo", { delay: 90 });
  await apartar(); await pausa(1000);
  await clic(page.getByText("Mateo Rodríguez").first());
  await rotulo("Ficha del estudiante", "Promedio, alertas y observaciones de seguimiento");
  await pausa(3000);
  await page.keyboard.press("Escape"); await pausa(500);

  // 5. Calificaciones dentro de su asignación (nota escrita sin guardar)
  await ir("Calificaciones", "Calificaciones", "Solo grupos y actividades de sus materias; la nota se escribe de 0.0 a 5.0");
  await pausa(700);
  await clic(page.getByRole("combobox").first()); await pausa(500);
  await clic(page.getByRole("option", { name: "Grado 1A", exact: true }), 200); await pausa(500);
  await clic(page.getByRole("combobox").nth(1)); await pausa(500);
  await clic(page.getByRole("option", { name: /Taller de Sumas y Restas/ }), 200);
  const nota = page.getByLabel("Calificación de Mariana Acosta");
  await nota.waitFor(); await pausa(800);
  await nota.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "smooth" })); await pausa(800);
  await clic(nota);
  await nota.pressSequentially("3.8", { delay: 220 });
  await apartar();
  await rotulo("Nota de 0.0 a 5.0", "3.8 equivale a 76 % y a 15.2 sobre 20 (este cambio no se guarda)");
  await pausa(3000);

  // 6. Análisis con filtro por materia
  await ir("Análisis", "Análisis", "Indicadores de sus asignaciones, con las referencias 3.0 y 3.5");
  await pausa(1800);
  await clic(page.getByRole("combobox", { name: "Materia" })); await pausa(500);
  await clic(page.getByRole("option", { name: "Matemáticas", exact: true }), 200);
  await rotulo("Indicadores por materia", "El docente puede leer cada materia por separado");
  await pausa(3200);

  // 7. Alertas de su ámbito
  await ir("Alertas", "Alertas tempranas", "Solo las alertas de sus estudiantes; un promedio inferior a 3.0 crea una alerta");
  await pausa(1600);
  await clic(page.getByText("Santiago Guerrero").first());
  await rotulo("Detalle de la alerta", "El docente revisa el caso, lo marca en revisión o lo resuelve");
  await pausa(3000);
  await page.keyboard.press("Escape"); await pausa(500);

  // 7b. Grupos y actividades de sus asignaciones
  await ir("Grupos", "Sus grupos", "Solo los grupos donde tiene materias asignadas");
  await pausa(2400);
  await ir("Actividades", "Sus actividades", "Tareas, exámenes y proyectos de sus materias, con el avance de entregas");
  await pausa(2400);

  // 8. Materias: el docente solo consulta
  await ir("Materias", "Sus materias", "El docente consulta sus materias; el catálogo lo gestiona el administrador");
  await pausa(2600);

  // 9. Acceso del administrador: visión general
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await clic(page.getByText("Cerrar sesión")); await page.waitForURL(/\/auth/); await esperar(); await pausa(500);
  await entrar("admin@classkids.local", claveAdmin, "Inicio de sesión del administrador", "El administrador conserva la visión general del colegio");
  await rotulo("Dashboard del administrador", "Todos los grupos, estudiantes, actividades y alertas");
  await pausa(3200); await bajar(380); await pausa(1200); await bajar(0);
  await ir("Materias", "Gestión de materias", "Solo el administrador crea materias y asigna docentes a cada grupo");
  await pausa(1500);
  await clic(page.getByRole("tab", { name: "Vista por Grupos" })); await pausa(2400);
  await clic(page.getByRole("complementary", { name: "Menú principal" }).getByRole("link", { name: /Panel admin/ }));
  await esperar();
  await rotulo("Panel de administración", "Métricas globales, usuarios y datos de toda la plataforma");
  await pausa(2600);
  await clic(page.getByRole("link", { name: /^Usuarios/ }).first()); await esperar();
  await rotulo("Usuarios", "Invitar, cambiar roles y desactivar; nadie puede quitarse su propio rol");
  await pausa(3000);

  // 10. Modo oscuro
  await rotulo("Modo claro y oscuro", "La preferencia se conserva al navegar y al volver");
  await clic(page.getByRole("button", { name: /modo oscuro/i }).first());
  await pausa(2400);

  // 11. Cierre
  await page.evaluate(() => { document.getElementById("__rotulo")?.remove(); window.__portada("Detecta a tiempo quién necesita apoyo en tu aula."); });
  await pausa(3600);

  const video = page.video();
  await ctx.close();
  const origen = await video.path();
  await browser.close();
  console.log(JSON.stringify({ grabacion: origen, inicio: Number(inicio.toFixed(2)) }));
})().catch((e) => { console.error(e); process.exit(1); });
