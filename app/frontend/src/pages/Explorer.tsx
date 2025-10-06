"use client";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PlanetCanvas } from "@/components/PlanetCanvas";
import { Controls } from "@/components/Controls";
import { PlanetDetails } from "@/components/PlanetDetails";
// ⚠️ Removemos o uso do mock local e passamos a consumir a API
// import { planetarySystems } from "@/data/planetarySystems";
import { Planet, PlanetarySystem } from "@/types/planet";
import { getStars, searchStars, fetchStars } from "@/lib/stars";

// =====================
// Tipos da API (padronizados)
// =====================
export type ApiResponse = {
  page: number;
  stars: Star[];
};

export type Star = {
  id: string;
  mass_solar: number | null;
  radius_solar: number | null;
  effective_tempk: number | null;
  metallicity_feh: number | null;
  age_gyr: number | null;
  planets: ApiPlanet[];
};

export type ApiPlanet = {
  id: string;
  name: string | null;
  probability: number | null;
  radius_earth: number | null;
  equilibrium_tempk: number | null;
  orbital_period_days: number | null;
  semi_major_axis: number | null;
  eccentricity: number | null;
  inclination_deg: number | null;
};

// =====================
// Adaptadores para o modelo UI atual
// (sem adicionar campos fora do contrato da API)
// =====================
function mapApiPlanetToUI(p: ApiPlanet): Planet {
  return {
    id: p.id,
    name: p.name ?? `Planet ${p.id}`,
    probability: p.probability ?? null,
    radius_earth: p.radius_earth ?? null,
    equilibrium_tempk: p.equilibrium_tempk ?? null,
    orbital_period_days: p.orbital_period_days ?? null,
    semi_major_axis: p.semi_major_axis ?? null,
    eccentricity: p.eccentricity ?? null,
    inclination_deg: p.inclination_deg ?? null,
  } as Planet;
}

function mapStarToSystem(star: Star): PlanetarySystem {
  return {
    id: star.id,
    // Não temos "name" na API; usamos um rótulo derivado do id
    name: `Star ${star.id}`,
    // Mantenha apenas os campos previstos — se seus componentes esperam mais, ajuste-os para serem opcionais
    star: {
      id: star.id,
      mass_solar: star.mass_solar,
      radius_solar: star.radius_solar,
      effective_tempk: star.effective_tempk,
      metallicity_feh: star.metallicity_feh,
      age_gyr: star.age_gyr,
      planets: [], // preenchido logo abaixo
    },
    planets: star.planets.map(mapApiPlanetToUI),
  } as unknown as PlanetarySystem;
}

// =====================
// Explorer (consumindo API)
// =====================
const Explorer = () => {
  const [page, setPage] = useState(1);
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSystem, setSelectedSystem] = useState<PlanetarySystem | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Carrega uma página de estrelas da API
  const loadPage = async (pageToLoad: number) => {
    setLoading(true);
    setError(null);
    try {
      // Suporte a diferentes helpers, caso o projeto exponha um ou outro
      let resp: ApiResponse | null = null;
      if (typeof fetchStars === "function") {
        // @ts-ignore - assinatura prevista: fetchStars(page: number)
        resp = await fetchStars(pageToLoad);
      }
      if (!resp && typeof getStars === "function") {
        // @ts-ignore - assinatura alternativa: getStars({ page })
        resp = await getStars({ page: pageToLoad });
      }
      if (!resp) throw new Error("Nenhum cliente de API disponível (fetchStars/getStars)");

      setPage(resp.page);
      setStars(resp.stars ?? []);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar estrelas");
    } finally {
      setLoading(false);
    }
  };

  // Busca por nome/id utilizando a API quando houver necessidade
  const runSearch = async (q: string) => {
    if (!q || !q.trim()) return loadPage(1);
    setLoading(true);
    setError(null);
    try {
      if (typeof searchStars !== "function") {
        // fallback simples: filtra client-side a lista atual
        const filtered = stars.filter((s) => s.id.toLowerCase().includes(q.toLowerCase()));
        setStars(filtered);
        return;
      }
      // @ts-ignore - assinatura prevista: searchStars(query: string)
      const resp: ApiResponse = await searchStars(q.trim());
      setPage(resp.page);
      setStars(resp.stars ?? []);
    } catch (e: any) {
      setError(e?.message || "Falha na busca");
    } finally {
      setLoading(false);
    }
  };

  // Carrega a primeira página ao montar
  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Converte as estrelas da API para o formato esperado pelos componentes atuais
  const systemsFromApi: PlanetarySystem[] = useMemo(() => {
    return (stars ?? []).map(mapStarToSystem);
  }, [stars]);

  // Garante um sistema selecionado quando chegarem dados
  useEffect(() => {
    if (!selectedSystem && systemsFromApi.length > 0) {
      setSelectedSystem(systemsFromApi[0]);
      setSelectedPlanet(null);
    }
    // Se a lista mudar e o sistema atual não existir mais (ex.: nova busca), reseta
    if (
      selectedSystem &&
      systemsFromApi.length > 0 &&
      !systemsFromApi.some((s) => s.id === selectedSystem.id)
    ) {
      setSelectedSystem(systemsFromApi[0]);
      setSelectedPlanet(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemsFromApi]);

  const handleReset = () => {
    setSpeed(1.0);
    setIsPaused(false);
  };

  const handleSelectPlanet = (planet: Planet) => {
    if (selectedPlanet?.id === planet.id) {
      setSelectedPlanet(null);
    } else {
      setSelectedPlanet(planet);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          // Agora a lista vem da API
          systems={systemsFromApi}
          selectedSystem={selectedSystem}
          selectedPlanet={selectedPlanet}
          onSelectSystem={(system) => {
            setSelectedSystem(system);
            setSelectedPlanet(null);
          }}
          onSelectPlanet={(system, planet) => {
            setSelectedSystem(system);
            handleSelectPlanet(planet);
          }}
          // Se o seu Sidebar tiver um input de busca que chama esta prop, exponha-a aqui
          onSearch={runSearch}
        />

        <main className="flex-1 relative">
          <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
            {/* Exemplo mínimo de busca opcional. Remova se o Sidebar já cobre isso. */}
            {/* <input
              placeholder="Buscar estrela (id)"
              className="input input-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch((e.target as HTMLInputElement).value);
              }}
            /> */}
          </div>

          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60">
              <div className="rounded-2xl px-4 py-2 shadow-sm border">Carregando…</div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 right-4 z-30 text-sm rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/30">
              {error}
            </div>
          )}

          <PlanetCanvas
            system={selectedSystem}
            animationSpeed={speed}
            showOrbits={showOrbits}
            showLabels={showLabels}
            isPaused={isPaused}
            onSelectPlanet={handleSelectPlanet}
            selectedPlanet={selectedPlanet}
          />

          <PlanetDetails planet={selectedPlanet} system={selectedSystem} />

          <Controls
            isPaused={isPaused}
            speed={speed}
            showOrbits={showOrbits}
            showLabels={showLabels}
            onTogglePause={() => setIsPaused(!isPaused)}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onToggleOrbits={() => setShowOrbits(!showOrbits)}
            onToggleLabels={() => setShowLabels(!showLabels)}
          />
        </main>
      </div>
    </div>
  );
};

export default Explorer;
