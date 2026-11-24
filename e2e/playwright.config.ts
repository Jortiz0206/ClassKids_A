// Pruebas de interfaz (extremo a extremo) de ClassKids.
// Se ejecutan SOLO contra el entorno aislado:
//   frontend de pruebas  http://localhost:8081  (VITE_API_URL=http://127.0.0.1:8001)
//   backend de pruebas   http://127.0.0.1:8001  (DATABASE_URL → classkids_test, puerto 5433)
// Ver e2e/README.md para levantar el entorno.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8081",
    viewport: { width: 1366, height: 820 },
    locale: "es-CO",
    timezoneId: "America/Bogota",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
