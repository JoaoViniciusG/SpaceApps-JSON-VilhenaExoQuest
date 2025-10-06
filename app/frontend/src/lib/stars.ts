// lib/stars.ts
// ÚNICO lugar para buscar estrelas e pesquisa de estrelas.
//
// Pode usar NEXT_PUBLIC_API_BASE (Next.js) ou VITE_API_BASE (Vite).
// Também aceita window.__API_BASE__ (override em runtime).

const API_BASE = (() => {
  // 1) Override em runtime (útil p/ testes)
  if (typeof window !== "undefined" && (window as any).__API_BASE__) {
    return (window as any).__API_BASE__ as string;
  }

  // 2) Next.js (variáveis públicas)
  if (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_BASE) {
    return (process as any).env.NEXT_PUBLIC_API_BASE as string;
  }

  // 3) Vite
  try {
    // @ts-ignore - import.meta existe no Vite
    const viteBase = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE;
    if (viteBase) return viteBase as string;
  } catch {}

  // 4) Fallback (ajuste aqui para seu túnel ngrok real)
  return "https://neoma-uninternalized-irretraceably.ngrok-free.dev";
})() as string;

// ===== Tipos (alinhados ao contrato da API) =====
export type Planet = {
  id: string | number;
  name: string | null;
  probability: number | null;
  radius_earth: number | null;
  equilibrium_tempk: number | null;
  orbital_period_days: number | null;
  semi_major_axis: number | null;
  eccentricity: number | null;
  inclination_deg: number | null;
};

export type Star = {
  id: string | number;
  mass_solar: number | null;
  radius_solar: number | null;
  effective_tempk: number | null;
  metallicity_feh: number | null;
  age_gyr: number | null;
  planets: Planet[];
};

export type ApiResponse = {
  page: number;
  stars: Star[];
};

// ===== Util interno para requisições =====
class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchOpts = {
  signal?: AbortSignal;
  timeoutMs?: number; // default 12s
};

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function fetchJSON<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { signal, timeoutMs = 12_000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const url = joinUrl(API_BASE, path);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // 👇 pula a landing de aviso do ngrok
        "ngrok-skip-browser-warning": "true",
      },
      signal: signal ?? controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(`Falha na API (${res.status}) em ${url}: ${text.slice(0, 200)}`, res.status);
    }

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) return (await res.json()) as T;

    const raw = await res.text();
    try { return JSON.parse(raw) as T; } catch {
      throw new ApiError(`Resposta não-JSON em ${url}. content-type="${ct || "desconhecido"}". Início: ${raw.slice(0, 200)}`, 422);
    }
  } finally {
    clearTimeout(timer);
  }
}


// ===== Endpoints públicos =====

/**
 * Lista estrelas por página.
 * @param page Página (1..n)
 */
export function getStars(page: number, opts?: FetchOpts): Promise<ApiResponse> {
  const p = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  return fetchJSON<ApiResponse>(`/stars?page=${p}`, opts);
}

/**
 * Pesquisa estrelas pelo termo `search` + paginação.
 * @param search termo de busca (string vazia volta a lista como /stars)
 * @param page Página (1..n)
 */
export function searchStars(
  search: string,
  page: number = 1,
  opts?: FetchOpts
): Promise<ApiResponse> {
  const p = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const q = encodeURIComponent(search ?? "");
  const path = q ? `/stars/search?search=${q}&page=${p}` : `/stars?page=${p}`;
  return fetchJSON<ApiResponse>(path, opts);
}

/** Conveniência: junta busca e paginação num único wrapper. */
export function fetchStars({
  search = "",
  page = 1,
  signal,
  timeoutMs,
}: {
  search?: string;
  page?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
} = {}): Promise<ApiResponse> {
  return search
    ? searchStars(search, page, { signal, timeoutMs })
    : getStars(page, { signal, timeoutMs });
}
