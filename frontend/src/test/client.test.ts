import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, formatApiErrorDetail } from "@/api/client";

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
