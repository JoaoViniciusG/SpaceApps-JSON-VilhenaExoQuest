import registryRaw from "@/data/registry.json";
import { RegistryBase } from "@/types/schema";
import type { PlanetarySystem, Planet, Star } from "@/types/planet";

/**
 * Adapta registry.json para o **contrato da API** e para o wrapper PlanetarySystem usado na UI.
 *
 * API alvo:
 * Star { id, mass_solar, radius_solar, effective_tempk, metallicity_feh, age_gyr, planets[] }
 * Planet { id, name|null, probability, radius_earth, equilibrium_tempk, orbital_period_days, semi_major_axis, eccentricity, inclination_deg }
 * PlanetarySystem { id: star.id, star: Omit<Star, 'planets'>, planets }
 */

export function loadPlanetarySystems(): PlanetarySystem[] {
  const parse = RegistryBase.safeParse(registryRaw);
  if (!parse.success) {
    console.error("registry.json inválido:", parse.error.flatten());
    throw new Error("Falha ao validar registry.json");
  }
  const reg = parse.data;

  // Agrupa planetas por estrela
  const planetsByStar = new Map<string, any[]>();
  for (const p of reg.planets) {
    const arr = planetsByStar.get(p.star_id) ?? [];
    arr.push(p);
    planetsByStar.set(p.star_id, arr);
  }

  const systems: PlanetarySystem[] = [];

  for (const starRaw of reg.stars) {
    const planetsRaw = planetsByStar.get(starRaw.id) ?? [];

    // Mapeia planetas para o modelo da API
    const planets: Planet[] = planetsRaw.map((p): Planet => ({
      id: p.id,
      name: p.name ?? null,
      probability: p.probability ?? null,
      radius_earth: p.radius_earth ?? null,
      equilibrium_tempk: p.equilibrium_temp_k ?? null,
      orbital_period_days: p.orbital_period_days ?? null,
      semi_major_axis: p.semi_major_axis_au ?? null,
      eccentricity: p.eccentricity ?? null,
      inclination_deg: p.inclination_deg ?? null,
    }));

    // A maioria dos catálogos públicos não possui todos os campos estelares; definimos null quando ausentes
    const star: Omit<Star, "planets"> = {
      id: starRaw.id,
      mass_solar: starRaw.mass_solar ?? null,
      radius_solar: starRaw.radius_solar ?? null,
      effective_tempk: starRaw.teff_k ?? null,
      metallicity_feh: starRaw.metallicity_feh ?? null,
      age_gyr: starRaw.age_gyr ?? null,
    };

    systems.push({ id: starRaw.id, star, planets });
  }

  return systems;
}

/**
 * Caso precise diretamente das estrelas no formato da API (sem o wrapper PlanetarySystem).
 */
export function loadStarsAsApi(): Star[] {
  const systems = loadPlanetarySystems();
  return systems.map((s) => ({ ...s.star, planets: s.planets }));
}
