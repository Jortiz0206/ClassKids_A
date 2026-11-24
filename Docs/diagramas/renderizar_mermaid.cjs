// Convierte a PNG los bloques Mermaid del modelo relacional verificado
// (../referencia-tecnica/modelo-relacional.md) y de uml-y-modelo-relacional.md, para incluirlos
// en el documento Word (build_docx.py omite los bloques Mermaid y solo inserta imágenes).
// El modelo relacional se exporta además a PDF.
// Uso (desde la raíz del repositorio): node Docs/diagramas/renderizar_mermaid.cjs
// Requiere conexión para cargar Mermaid 10.9.1 desde cdn.jsdelivr.net.
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const leer = (archivo) => [...fs.readFileSync(archivo, "utf8").matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].map((m) => m[1].replace(/\r/g, ""));
const bloques = [...leer(path.join(DIR, "..", "referencia-tecnica", "modelo-relacional.md")), ...leer(path.join(DIR, "uml-y-modelo-relacional.md"))];
const nombres = ["modelo-relacional", "clases-backend", "clases-frontend", "componentes", "despliegue"];
if (bloques.length !== nombres.length) throw new Error(`Se esperaban ${nombres.length} bloques y hay ${bloques.length}`);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
    <style>body{margin:0;background:#fff;font-family:Segoe UI,Arial,sans-serif}#d{display:inline-block;padding:24px}</style>
    </head><body><div id="d"></div></body></html>`);
  await page.waitForFunction(() => window.mermaid);
  await page.evaluate(() => window.mermaid.initialize({
    startOnLoad: false, theme: "base", securityLevel: "strict",
    themeVariables: { primaryColor: "#DDF4EA", primaryBorderColor: "#17775A", primaryTextColor: "#1D2B45", lineColor: "#4A5672", fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "15px" },
  }));
  for (let i = 0; i < bloques.length; i++) {
    const svg = await page.evaluate(async ([codigo, id]) => (await window.mermaid.render(id, codigo)).svg, [bloques[i], `g${i}`]);
    await page.evaluate((s) => { document.getElementById("d").innerHTML = s; }, svg);
    const caja = await page.locator("#d").boundingBox();
    await page.setViewportSize({ width: Math.ceil(Math.max(800, caja.width)), height: Math.ceil(Math.max(600, caja.height)) });
    await page.locator("#d").screenshot({ path: path.join(DIR, `${nombres[i]}.png`) });
    if (nombres[i] === "modelo-relacional") {
      // PDF del modelo relacional (una página del tamaño del diagrama).
      await page.pdf({ path: path.join(DIR, "modelo-relacional.pdf"), width: `${Math.ceil(caja.width) + 2}px`, height: `${Math.ceil(caja.height) + 2}px`, printBackground: true, pageRanges: "1" });
    }
    console.log("ok", `${nombres[i]}.png`);
  }
  await browser.close();
})().catch((e) => { console.error("ERROR", e.message); process.exit(1); });
