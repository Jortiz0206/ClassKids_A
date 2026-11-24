import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Mensaje legible de un error capturado (`catch`), o el texto por defecto si no tiene uno. */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  return error instanceof Error && error.message ? error.message : porDefecto;
}
