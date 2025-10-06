"use client";
import { useState, useMemo, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Search, Sparkles, ChevronDown } from "lucide-react";
import { Planet, PlanetarySystem } from "@/types/planet";
import { useI18n } from "@/lib/i18n";

/** Componente genérico de grupo de filtro (dropbox) */
const FilterGroup = ({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium bg-muted/40 hover:bg-muted transition-colors"
        >
          <span>{title}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
};

interface SidebarProps {
  systems: PlanetarySystem[];
  selectedSystem: PlanetarySystem | null;
  onSelectSystem: (system: PlanetarySystem) => void;
  onSelectPlanet: (system: PlanetarySystem, planet: Planet) => void;
  selectedPlanet: Planet | null;
  /** Opcional: se fornecido, disparamos busca remota */
  onSearch?: (q: string) => void;
}

export const Sidebar = ({
  systems,
  selectedSystem,
  onSelectSystem,
  onSelectPlanet,
  selectedPlanet,
  onSearch,
}: SidebarProps) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<string>("");

  // refs dos itens para scrollIntoView
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollItemIntoView = (id: string) => {
    const el = itemRefs.current[id];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  // Opções de estrela: usamos o próprio id da estrela (não há name na API)
  const uniqueStars = useMemo(() => {
    return [t("sidebar.all"), ...Array.from(new Set(systems.map((s) => s.id)))];
  }, [systems, t]);

  // Filtro local: busca por id da estrela ou nome/id do planeta.
  const filteredSystems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return systems
      .filter((system) => {
        const label = `Star ${system.id}`.toLowerCase();
        const matchesSearch =
          !q ||
          label.includes(q) ||
          system.planets.some((p) => (p.name ?? `planet-${p.id}`).toLowerCase().includes(q) || p.id.toLowerCase().includes(q));

        const matchesStar = starFilter === "" || (starFilter == "KOI") ? system.id.startsWith("K") : system.id.startsWith("T");
        return matchesSearch && matchesStar;
      })
      .map((system) => ({ ...system }));
  }, [systems, searchQuery, starFilter, t]);

  const totalPlanets = filteredSystems.reduce((sum, sys) => sum + sys.planets.length, 0);

  return (
    <aside className="w-64 h-screen min-h-0 border-r border-border bg-card/50 backdrop-blur">
      {/* Scroll principal da sidebar */}
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Cabeçalho */}
          <div>
            <h2 className="text-lg font-semibold">{t("sidebar.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {filteredSystems.length} {t("sidebar.systems")} • {totalPlanets} {t("sidebar.planets")}
            </p>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("sidebar.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearch) onSearch(searchQuery);
              }}
              className="pl-9"
            />
          </div>

          {/* Filtro por estrela */}
          <FilterGroup title={t("sidebar.mission.title")}>
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant={starFilter === "TESS" ? "default" : "outline"}
                onClick={() => setStarFilter(starFilter === "TESS" ? "" : "TESS")}
                className="text-xs w-full justify-start"
              >TESS</Button>
              <Button
                size="sm"
                variant={starFilter === "KOI" ? "default" : "outline"}
                onClick={() => setStarFilter(starFilter === "KOI" ? "" : "KOI")}
                className="text-xs w-full justify-start"
              >KOI</Button>
            </div>
          </FilterGroup>

          {/* Lista de sistemas com mais respiro no final */}
          <ScrollArea className="h-[52vh] pr-2 mb-12" onWheelCapture={(e) => e.stopPropagation()}>
            <div className="space-y-2 pb-24">
              {filteredSystems.map((system) => {
                const isSelected = selectedSystem?.id === system.id;
                return (
                  <div
                    key={system.id}
                    ref={(el) => (itemRefs.current[system.id] = el)}
                    className={`rounded-lg border transition-colors overflow-hidden ${isSelected ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-accent"
                      }`}
                  >
                    <div
                      className="p-3 cursor-pointer w-full"
                      onClick={() => {
                        onSelectSystem(system);
                        scrollItemIntoView(system.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-sm">{`Star ${system.id}`}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {system.planets.length} {t("sidebar.planets_short")}
                      </p>
                    </div>

                    {/* Planetas */}
                    <div className="px-3 pb-3 flex flex-col gap-1">
                      {system.planets.map((planet) => {
                        const isSel = selectedPlanet?.id === planet.id;
                        return (
                          <button
                            key={planet.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlanet(system, planet);
                            }}
                            className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${isSel ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                              }`}
                          >
                            {/* Indicador neutro (não usamos color do modelo) */}
                            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-foreground/60" />
                            <span className="flex-1 text-left truncate">{planet.name ?? `Planet ${planet.id}`}</span>
                            {/* Badge útil com campos da API */}
                            {typeof planet.orbital_period_days === "number" && (
                              <Badge variant={isSel ? "secondary" : "outline"} className="text-[10px] px-1 py-0">
                                {planet.orbital_period_days.toFixed(1)} d
                              </Badge>
                            )}
                            {typeof planet.radius_earth === "number" && (
                              <Badge variant={isSel ? "secondary" : "outline"} className="text-[10px] px-1 py-0">
                                {planet.radius_earth.toPrecision(2)} R⊕
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="vertical" className="bg-transparent [&>div]:bg-primary/40 hover:[&>div]:bg-primary/60" />
          </ScrollArea>
        </div>
      </ScrollArea>
    </aside>
  );
};
