// Capturas de las pantallas corregidas, tomadas en el ENTORNO DE PRUEBAS (8081 → 8001 → classkids_test).
// Uso: CK_DOCENTE_PASS=... CK_ADMIN_PASS=... node capturas-pruebas.cjs <ruta a node_modules/@playwright/test> <carpeta de salida>
const { chromium } = require(process.argv[2]);
const OUT = process.argv[3];
const B = 'http://localhost:8081';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 820 }, locale: 'es-CO', timezoneId: 'America/Bogota' });
  const page = await ctx.newPage();
  const real = [];
  page.on('request', r => { if (r.url().includes(':8000')) real.push(r.url()); });
  const shot = async (n) => { await page.waitForTimeout(1000); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('ok', n); };
  const login = async (email, pass) => { await page.goto(B + '/auth'); await page.fill('#email', email); await page.fill('#password', pass); await page.getByRole('button', { name: /Iniciar sesión/ }).click(); await page.waitForURL('**/app'); };

  await login('docente@classkids.local', process.env.CK_DOCENTE_PASS);
  await page.getByText('Alertas Tempranas').waitFor(); await shot('04_dashboard_docente');
  await page.goto(B + '/app/estudiantes'); await page.getByText('Mateo Rodríguez').first().waitFor(); await shot('07_estudiantes');
  await page.getByRole('combobox').first().click(); await page.getByRole('option', { name: 'Grado 1A', exact: true }).click(); await shot('07b_estudiantes_filtro_grupo');
  await page.getByText('Mateo Rodríguez').first().click(); await page.getByRole('button', { name: /Editar/ }).click(); await shot('09b_estudiante_editar');
  await page.keyboard.press('Escape');
  await page.goto(B + '/app/actividades'); await page.getByText('Taller de Sumas y Restas').first().waitFor({ timeout: 60000 }); await shot('12_actividades');
  await page.goto(B + '/app/calificaciones');
  await page.getByRole('combobox').first().click(); await page.getByRole('option', { name: 'Grado 1A', exact: true }).click();
  await page.getByRole('combobox').nth(1).click(); await page.getByRole('option', { name: /Taller de Sumas y Restas/ }).click();
  await page.getByLabel('Calificación de Isabella Díaz').waitFor(); await shot('15_calificaciones_tabla');
  await page.getByText('Cerrar sesión').click();
  await login('admin@classkids.local', process.env.CK_ADMIN_PASS);
  await page.goto(B + '/admin/datos'); await page.getByRole('columnheader', { name: 'Año lectivo' }).waitFor(); await shot('23_admin_datos');
  await browser.close();
  if (real.length) { console.error('ERROR: peticiones al backend real', real); process.exit(1); }
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
