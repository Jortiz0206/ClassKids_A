import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, formatApiErrorDetail, CLAVE_SESION_CERRADA } from "@/api/client";

// H-24: los errores de validación (422) deben mostrarse como texto legible.

describe("formatApiErrorDetail", () => {
  it("convierte la lista de errores de Pydantic (422) en texto con el campo", () => {
    const detail = [{ type: "float_parsing", loc: ["body", "nota"], msg: "Input should be a valid number" }];
    expect(formatApiErrorDetail(detail)).toBe("nota: Input should be a valid number");
  });

  it("une varios errores de validación", () => {
    const detail = [
      { loc: ["body", "nota"], msg: "Input should be a valid number" },
      { loc: ["body", "estudiante_id"], msg: "Field required" },
    ];
    expect(formatApiErrorDetail(detail)).toBe("nota: Input should be a valid number; estudiante_id: Field required");
  });

  it("conserva los mensajes de texto del backend (401, 403, 404, 409)", () => {
    expect(formatApiErrorDetail("El usuario ya existe")).toBe("El usuario ya existe");
  });

  it("devuelve null si no hay detalle", () => {
    expect(formatApiErrorDetail(undefined)).toBeNull();
    expect(formatApiErrorDetail("")).toBeNull();
  });
});

describe("apiFetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  const mockFetch = (status: number, body: unknown) =>
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status, statusText: "Error", json: () => Promise.resolve(body),
    }));

  it("un 422 produce un Error legible y nunca «[object Object]»", async () => {
    mockFetch(422, { detail: [{ loc: ["body", "nota"], msg: "Input should be a valid number" }] });
    await expect(apiFetch("/calificaciones")).rejects.toThrow("nota: Input should be a valid number");
    mockFetch(422, { detail: [{ loc: ["body", "nota"], msg: "x" }] });
    await expect(apiFetch("/calificaciones")).rejects.not.toThrow("[object Object]");
  });

  it("un 409 conserva el mensaje del backend", async () => {
    mockFetch(409, { detail: "La asignación ya existe" });
    await expect(apiFetch("/asignaciones")).rejects.toThrow("La asignación ya existe");
  });

  it("sin detalle usa el código HTTP", async () => {
    mockFetch(500, {});
    await expect(apiFetch("/grupos")).rejects.toThrow("Error 500: Error");
  });
});

describe("H-09: sesión rechazada por la API", () => {
  it("si la API responde 401 a un token enviado, se cierra la sesión local y se guarda el motivo", async () => {
    localStorage.setItem("classkids_token", "token-viejo");
    localStorage.setItem("classkids_user", "{}");
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 401, statusText: "Unauthorized",
      json: async () => ({ detail: "Tu cuenta ya no está activa. Inicia sesión de nuevo." }),
    }) as unknown as typeof fetch;
    const asignar = vi.fn();
    Object.defineProperty(window, "location", { value: { pathname: "/app", assign: asignar }, writable: true });
    await expect(apiFetch("/grupos")).rejects.toThrow("Tu cuenta ya no está activa");
    expect(localStorage.getItem("classkids_token")).toBeNull();
    expect(sessionStorage.getItem(CLAVE_SESION_CERRADA)).toContain("no está activa");
    expect(asignar).toHaveBeenCalledWith("/auth");
  });

  it("un 401 del inicio de sesión (credenciales incorrectas) no cierra nada ni redirige", async () => {
    localStorage.removeItem("classkids_token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 401, statusText: "Unauthorized", json: async () => ({ detail: "Correo o contraseña incorrectos" }),
    }) as unknown as typeof fetch;
    const asignar = vi.fn();
    Object.defineProperty(window, "location", { value: { pathname: "/auth", assign: asignar }, writable: true });
    await expect(apiFetch("/auth/login", { method: "POST" })).rejects.toThrow("Correo o contraseña incorrectos");
    expect(asignar).not.toHaveBeenCalled();
  });
});

describe("H-09: varias peticiones rechazadas a la vez", () => {
  it("se conserva el primer motivo y no lo reemplaza uno genérico", async () => {
    sessionStorage.clear();
    localStorage.setItem("classkids_token", "token-viejo");
    Object.defineProperty(window, "location", { value: { pathname: "/app", assign: vi.fn() }, writable: true });
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized", json: async () => ({ detail: "Tu rol cambió. Inicia sesión de nuevo." }) })
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized", json: async () => { throw new Error("abortada"); } }) as unknown as typeof fetch;
    localStorage.setItem("classkids_token", "token-viejo");
    await expect(apiFetch("/grupos")).rejects.toThrow("Tu rol cambió");
    localStorage.setItem("classkids_token", "token-viejo");
    await expect(apiFetch("/alertas")).rejects.toThrow("Error 401");
    expect(sessionStorage.getItem(CLAVE_SESION_CERRADA)).toBe("Tu rol cambió. Inicia sesión de nuevo.");
  });

  it("si el genérico llega primero, el motivo de la API lo reemplaza", async () => {
    sessionStorage.clear();
    Object.defineProperty(window, "location", { value: { pathname: "/app", assign: vi.fn() }, writable: true });
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized", json: async () => { throw new Error("abortada"); } })
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized", json: async () => ({ detail: "Tu cuenta ya no está activa. Inicia sesión de nuevo." }) })
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized", json: async () => ({ detail: "Tu rol cambió. Inicia sesión de nuevo." }) }) as unknown as typeof fetch;
    localStorage.setItem("classkids_token", "token-viejo");
    await expect(apiFetch("/alertas")).rejects.toThrow("Error 401");
    expect(sessionStorage.getItem(CLAVE_SESION_CERRADA)).toBe("Error 401: Unauthorized");
    localStorage.setItem("classkids_token", "token-viejo");
    await expect(apiFetch("/grupos")).rejects.toThrow("no está activa");
    expect(sessionStorage.getItem(CLAVE_SESION_CERRADA)).toBe("Tu cuenta ya no está activa. Inicia sesión de nuevo.");
    // Un segundo motivo específico no reemplaza al primero.
    localStorage.setItem("classkids_token", "token-viejo");
    await expect(apiFetch("/materias")).rejects.toThrow("Tu rol cambió");
    expect(sessionStorage.getItem(CLAVE_SESION_CERRADA)).toBe("Tu cuenta ya no está activa. Inicia sesión de nuevo.");
  });
});
