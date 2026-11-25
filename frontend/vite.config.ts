import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// Modo «demo» (`pnpm demo` / `npm run demo`): frontend en el puerto 8082 conectado al backend
// de demostración (puerto 8002, base classkids_demo). VITE_API_URL, si se define, tiene prioridad.
export default defineConfig(({ mode }) => ({
  ...(mode === "demo" && !process.env.VITE_API_URL
    ? { define: { "import.meta.env.VITE_API_URL": JSON.stringify("http://127.0.0.1:8002") } }
    : {}),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
