// Recorrido de navegación de solo lectura usado para las capturas de Docs/evidencias/capturas (20/11/2026).
// Uso: node capturas.cjs <ruta a node_modules/@playwright/test> <carpeta de salida>
// Requiere frontend (8080), backend (8000) y base de datos con los datos demo. No guarda datos;
// el inicio de sesión actualiza last_sign_in_at de las cuentas demo. Las contraseñas demo están en
// backend/CREDENCIALES_LOCALES.md (no versionado).
const { chromium } = require(process.argv[2]);
const OUT = process.argv[3];
const B = 'http://localhost:8080';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 820 }, locale: 'es-CO' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('dialog', d => d.dismiss());
  const shot = async (name, full = false) => { await page.waitForTimeout(1200); await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full }); console.log('ok', name); };
  const closeDialog = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(400); };

  await page.goto(B + '/'); await shot('01_landing');
  await page.goto(B + '/auth'); await shot('02_login');
  await page.getByText('¿Olvidaste tu contraseña?').click(); await shot('03_recuperar');
  await page.getByText('Volver al inicio de sesión').click();

  // Docente
  await page.fill('#email', 'docente@classkids.local');
  await page.fill('#password', process.env.CK_DOCENTE_PASS);
  await page.getByRole('button', { name: /Iniciar sesión/ }).click();
  await page.waitForURL('**/app'); await shot('04_dashboard_docente');
  await page.goto(B + '/app/grupos'); await shot('05_grupos');
  await page.getByRole('button', { name: /Nuevo Grupo/ }).click(); await shot('06_grupo_nuevo'); await closeDialog();
  await page.goto(B + '/app/estudiantes'); await shot('07_estudiantes');
  await page.getByRole('button', { name: /Nuevo Estudiante/ }).click(); await shot('08_estudiante_nuevo'); await closeDialog();
  await page.getByText('Mateo Rodríguez').first().click(); await shot('09_estudiante_detalle'); await closeDialog();
  await page.goto(B + '/app/materias'); await shot('10_materias');
  await page.getByRole('tab', { name: /Vista por Grupos/ }).click(); await shot('11_asignaciones');
  await page.goto(B + '/app/actividades'); await page.getByText('Taller de Sumas y Restas').first().waitFor({ timeout: 60000 }); await shot('12_actividades');
  await page.getByRole('button', { name: /Nueva Actividad/ }).click(); await shot('13_actividad_nueva'); await closeDialog();
  await page.goto(B + '/app/calificaciones'); await shot('14_calificaciones_vacio');
  await page.getByRole('combobox').first().click(); await page.getByRole('option', { name: 'Grado 1A' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('combobox').nth(1).click(); await page.getByRole('option').first().click();
  await shot('15_calificaciones_tabla');
  await page.goto(B + '/app/analisis'); await shot('16_analisis', true);
  await page.goto(B + '/app/alertas'); await shot('17_alertas');
  await page.locator('div.cursor-pointer').first().click(); await shot('18_alerta_detalle'); await closeDialog();

  // Móvil
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '/app'); await shot('19_dashboard_movil');
  await page.setViewportSize({ width: 1366, height: 820 });

  // Cerrar sesión y entrar como admin
  await page.getByText('Cerrar sesión').click(); await page.waitForTimeout(800);
  await page.goto(B + '/auth');
  await page.fill('#email', 'admin@classkids.local');
  await page.fill('#password', process.env.CK_ADMIN_PASS);
  await page.getByRole('button', { name: /Iniciar sesión/ }).click();
  await page.waitForURL('**/app');
  await page.goto(B + '/admin'); await shot('20_admin_resumen');
  await page.goto(B + '/admin/usuarios'); await shot('21_admin_usuarios');
  await page.getByRole('button', { name: /Invitar docente/ }).click(); await shot('22_admin_invitar'); await closeDialog();
  await page.goto(B + '/admin/datos'); await shot('23_admin_datos');
  await page.goto(B + '/legal/privacidad'); await shot('24_legal');
  await browser.close();
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
