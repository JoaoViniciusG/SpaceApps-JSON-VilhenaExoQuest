"use client";
import { Planet, PlanetarySystem } from "@/types/planet";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Ruler, Thermometer, Clock, Satellite } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PlanetDetailsProps {
  planet: Planet | null;
  system: PlanetarySystem | null;
}

export const PlanetDetails = ({ planet, system }: PlanetDetailsProps) => {
  const { t } = useI18n();

  if (!planet || !system) {
    return (
      <div className="absolute top-6 right-6 w-80">
        <Card className="p-6 bg-card/95 backdrop-blur border-border">
          <p className="text-center text-muted-foreground">{t("details.select_prompt")}</p>
        </Card>
      </div>
    );
  }

  const title = planet.name ?? `Planet ${planet.id}`;

  return (
    <div className="absolute top-6 right-6 w-80">
      <Card className="p-6 bg-card/95 backdrop-blur border-border">
        <div className="space-y-5">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {typeof planet.probability === "number" && (
                <Badge variant="outline" className="ml-4, width: 50px">
                  P = {formatProb(planet.probability)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("details.orbiting")} {`Star ${system.id}`}
            </p>
          </div>

          {/* Physical Properties (API) */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {isNum(planet.radius_earth) && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Ruler className="w-3 h-3" />
                    <span>{t("details.physical.radius")}</span>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">{fmt(planet.radius_earth)} R⊕</p>
                </div>
              )}

              {isNum(planet.equilibrium_tempk) && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Thermometer className="w-3 h-3" />
                    <span>{t("details.physical.temperature")}</span>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">{fmt(planet.equilibrium_tempk)} K</p>
                </div>
              )}
            </div>
          </div>

          {/* Orbital Properties (API) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">{t("details.orbital.title")}</h3>
            <div className="grid grid-cols-2 gap-4">
              {isNum(planet.orbital_period_days) && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{t("details.orbital.period")}</span>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {fmt(planet.orbital_period_days)} {t("details.orbital.days_short") ?? "d"}
                  </p>
                </div>
              )}

              {isNum(planet.semi_major_axis) && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Satellite className="w-3 h-3" />
                    <span>{t("details.orbital.distance")}</span>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{fmt(planet.semi_major_axis)} AU</p>
                </div>
              )}

              {isNum(planet.eccentricity) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("details.orbital.eccentricity")}</p>
                  <p className="text-sm font-semibold tabular-nums">{fmt(planet.eccentricity)}</p>
                </div>
              )}

              {isNum(planet.inclination_deg) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("details.orbital.inclination")}</p>
                  <p className="text-sm font-semibold tabular-nums">{fmt(planet.inclination_deg)}°</p>
                </div>
              )}
            </div>
          </div>

          {/* Star metadata (API) – estilização pareada em 2 colunas */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("details.star.title") ?? "Propriedades da Estrela"}
            </h3>

            <StarStatsGrid
              items={[
                isNum(system.star.effective_tempk)
                  ? { label: t("details.star.teff") ?? "T_eff", value: fmt(system.star.effective_tempk), unit: "K" }
                  : null,
                isNum(system.star.mass_solar)
                  ? { label: t("details.star.mass") ?? "Mass", value: fmt(system.star.mass_solar), unit: "M☉" }
                  : null,
                isNum(system.star.radius_solar)
                  ? { label: t("details.star.radius") ?? "Radius", value: fmt(system.star.radius_solar), unit: "R☉" }
                  : null,
                isNum(system.star.metallicity_feh)
                  ? { label: t("details.star.metallicity") ?? "[Fe/H]", value: fmt(system.star.metallicity_feh) }
                  : null,
                isNum(system.star.age_gyr)
                  ? { label: t("details.star.age") ?? "Age", value: fmt(system.star.age_gyr), unit: "Gyr" }
                  : null,
              ].filter(Boolean) as StatItem[]}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ---------- helpers ---------- */

type StatItem = { label: string; value: string; unit?: string };

function StarStatsGrid({ items }: { items: StatItem[] }) {
  // Render em 2 colunas, cada célula com label pequeno à esquerda e valor destacado à direita
  return (
    <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
      {items.map((it, i) => (
        <div key={i} className="flex items-baseline justify-between">
          <span className="text-muted-foreground">{it.label}</span>
          <span className="text-[13px] font-semibold tabular-nums">
            {it.unit ? `${it.value} ${it.unit}` : it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function isNum(n: unknown): n is number {
  return typeof n === "number" && isFinite(n);
}

function fmt(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toFixed(0);
  if (abs >= 10) return n.toFixed(1);
  if (abs >= 1) return n.toFixed(2);
  return n.toPrecision(2);
}

function formatProb(p: number) {
  if (p > 1) return p.toFixed(2);
  return `${(p * 100).toFixed(0)}%`;
}
