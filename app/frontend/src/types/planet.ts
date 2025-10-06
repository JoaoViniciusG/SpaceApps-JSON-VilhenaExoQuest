/**
 * Modelos alinhados 1:1 com o contrato da API
 * ApiResponse { page, stars[] }
 * Star { id, mass_solar, radius_solar, effective_tempk, metallicity_feh, age_gyr, planets[] }
 * Planet { id, name|null, probability, radius_earth, equilibrium_tempk, orbital_period_days, semi_major_axis, eccentricity, inclination_deg }
 *
 * ⚠️ Importante:
 * - Removidos campos de UI/catálogo (color, size, distance, speed, catalog, discovery*, isCandidate, isFalsePositive, etc.).
 * - Se seus componentes precisarem de atributos visuais, derive-os em tempo de renderização a partir dos campos da API
 *   (ex.: usar radius_earth para escala, semi_major_axis para "distância" no canvas, etc.), sem adicioná-los ao modelo.
 */

// =====================
// Resposta da API (paginaçao)
// =====================
export interface ApiResponse {
  page: number;
  stars: Star[];
}

// =====================
// Entidades da API
// =====================
export interface Planet {
  id: string;
  /** Nome pode vir nulo na API */
  name: string | null;
  probability: number | null;
  radius_earth: number | null;
  equilibrium_tempk: number | null;
  orbital_period_days: number | null;
  semi_major_axis: number | null;
  eccentricity: number | null;
  inclination_deg: number | null;
}

export interface Star {
  id: string;
  mass_solar: number | null;
  radius_solar: number | null;
  effective_tempk: number | null;
  metallicity_feh: number | null;
  age_gyr: number | null;
  planets: Planet[];
}

// =====================
// Agrupador usado pela UI (opcional)
// =====================
/**
 * "PlanetarySystem" não existe na API, mas é útil para a UI.
 * Ele apenas reagrupa os campos da API SEM adicionar nada novo.
 * Por convenção, id === star.id
 */
export interface PlanetarySystem {
  id: string; // mesmo que Star.id
  star: Omit<Star, "planets">; // dados da estrela (sem duplicar a lista de planetas)
  planets: Planet[]; // os planetas dessa estrela
}

// =====================
// Tipos antigos (removidos)
// =====================
/**
 * Se você ainda tiver referências aos tipos antigos (color, size, catalog, discovery*, etc.),
 * remova-as. Caso queira detectar usos remanescentes durante a migração, você pode criar
 * aliases temporários com campos "never" para causar erro de compilação, ex.:
 *
 * export interface _Deprecated_Planet {
 *   color?: never;
 *   size?: never;
 *   distance?: never;
 *   speed?: never;
 *   isCandidate?: never;
 *   isFalsePositive?: never;
 *   radiusEarth?: never;
 *   orbitalPeriodDays?: never;
 *   equilibriumTempK?: never;
 *   discoveryMethod?: never;
 *   discoveryYear?: never;
 * }
 *
 * export interface _Deprecated_Star {
 *   name?: never;
 *   color?: never;
 *   size?: never;
 *   quant_planets?: never;
 * }
 *
 * export interface _Deprecated_PlanetarySystem {
 *   name?: never;
 *   catalog?: never;
 *   isConfirmed?: never;
 *   quantPlanets?: never;
 * }
 */
