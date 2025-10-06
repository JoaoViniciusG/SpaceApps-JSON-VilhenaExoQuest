import { z } from "zod";

const hexColor = z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Hex color inválido");

export const StarBase = z.object({
  id: z.string(),
  name: z.string(),
  spectral_type: z.string().optional(),
  mass_solar: z.number().nullable().optional(),
  radius_solar: z.number().nullable().optional(),
  teff_k: z.number().nullable().optional(),
  metallicity_feh: z.number().nullable().optional(),
  age_gyr: z.number().nullable().optional(),
  distance_pc: z.number().nullable().optional(),
  ra_deg: z.number().nullable().optional(),
  dec_deg: z.number().nullable().optional(),
  color: z.string().optional(),
  quant_planets: z.number().int().nonnegative().optional()
});
export type StarBase = z.infer<typeof StarBase>;

export const PlanetBase = z.object({
  id: z.string(),
  star_id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  size: z.number().optional(),
  distance: z.number().optional(),
  speed: z.number().optional(),
  mass_earth: z.number().nullable().optional(),
  radius_earth: z.number().nullable().optional(),
  equilibrium_temp_k: z.number().nullable().optional(),
  orbital_period_days: z.number().nullable().optional(),
  semi_major_axis_au: z.number().nullable().optional(),
  eccentricity: z.number().nullable().optional(),
  inclination_deg: z.number().nullable().optional(),
  discovery_method: z.string().optional(),
  discovery_year: z.number().optional()
});
export type PlanetBase = z.infer<typeof PlanetBase>;

export const RegistryBase = z.object({
  version: z.literal("1.0"),
  stars: z.array(StarBase),
  planets: z.array(PlanetBase)
});
export type RegistryBase = z.infer<typeof RegistryBase>;
