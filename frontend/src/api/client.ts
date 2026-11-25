const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// FastAPI devuelve `detail` como texto en los errores propios (401, 403, 404, 409...)
// y como una LISTA de objetos en los errores de validación de Pydantic (422), por ejemplo:
//   {"detail": [{"loc": ["body", "nota"], "msg": "Input should be a valid number", ...}]}
// Antes se pasaba la lista directamente a `new Error()` y la interfaz mostraba
// "[object Object]" (hallazgo H-24). Esta función convierte ambos formatos en texto legible.
export function formatApiErrorDetail(detail: unknown): string | null {
  if (detail === null || detail === undefined || detail === '') return null;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const mensajes = detail.map((item) => {
      if (typeof item === 'string') return item;
      const entry = item as { loc?: unknown[]; msg?: string };
      const campo = Array.isArray(entry.loc)
        ? entry.loc.filter((parte) => parte !== 'body').join('.')
        : '';
      const msg = entry.msg ?? JSON.stringify(item);
      return campo ? `${campo}: ${msg}` : msg;
    });
    return mensajes.join('; ');
  }
  if (typeof detail === 'object') return JSON.stringify(detail);
  return String(detail);
}

/** Clave con la que el inicio de sesión muestra por qué se cerró la sesión (H-09). */
export const CLAVE_SESION_CERRADA = 'classkids_sesion_cerrada';

/** Mensaje genérico que se arma cuando la respuesta no trae `detail` (por ejemplo, si su cuerpo
 *  no se alcanzó a leer porque la página ya estaba navegando). */
const esMotivoGenerico = (motivo: string) => /^Error \d{3}:/.test(motivo);

function cerrarSesionLocal(motivo: string) {
  localStorage.removeItem('classkids_token');
  localStorage.removeItem('classkids_user');
  // Varias peticiones pueden recibir el 401 a la vez y terminar en cualquier orden. Se guarda el
  // primer motivo, pero el motivo de la API («Tu rol cambió», «Tu cuenta ya no está activa»)
  // reemplaza a uno genérico («Error 401: …»); nunca al revés.
  const actual = sessionStorage.getItem(CLAVE_SESION_CERRADA);
  if (!actual || (esMotivoGenerico(actual) && !esMotivoGenerico(motivo))) {
    sessionStorage.setItem(CLAVE_SESION_CERRADA, motivo);
  }
  if (!window.location.pathname.startsWith('/auth')) window.location.assign('/auth');
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("classkids_token");
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje = formatApiErrorDetail(errorData.detail) || `Error ${response.status}: ${response.statusText}`;
    // H-09: si la API rechaza un token que se envió (cuenta desactivada, rol cambiado o sesión
    // vencida), se cierra la sesión local y se vuelve al inicio de sesión con el motivo.
    if (response.status === 401 && token && !endpoint.startsWith('/auth/')) {
      cerrarSesionLocal(mensaje);
    }
    throw new Error(mensaje);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),

  post: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, {
      method: 'DELETE',
    }),
};