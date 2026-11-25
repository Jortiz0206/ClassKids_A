// Recorrido de la DEMOSTRACIÓN de ClassKids, en el navegador.
// Se ejecuta SOLO contra el entorno de demostración:
//   frontend  http://localhost:8082   (npm run demo → VITE_API_URL=http://127.0.0.1:8002)
//   backend   http://127.0.0.1:8002   (backend/.env.demo → classkids_demo, puerto 5434)
// Las pruebas que crean registros los eliminan al terminar. Ver Docs/demo/guia-demostracion.md.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8082",
    viewport: { width: 1366, height: 820 },
    locale: "es-CO",
    timezoneId: "America/Bogota",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
