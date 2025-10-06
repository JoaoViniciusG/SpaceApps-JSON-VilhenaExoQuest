import { Button } from "./ui/button";
import { Plus, Telescope, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Planet, Star } from "@/types/planet";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
  stars?: Star[];
  onAddPlanet?: (planet: Omit<Planet, "id">) => void;
  onAddStar?: (star: Omit<Star, "id">) => void;
}


export const Header = ({ stars = [], onAddPlanet = () => {}, onAddStar = () => {} }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/$/, "");
  const isAbout = pathname === "/about";
  const isHome = pathname === "" || pathname === "/";
  const isExplorer = pathname === "/explorer" || pathname.startsWith("/explorer");

  // hide header on home to avoid duplication with the hero CTA
  if (isHome) return null;
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 h-16 overflow-hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Telescope className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary">{t("app.title")}</h1>
            <p className="text-sm text-muted-foreground hidden md:block">{t("app.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isAbout || isExplorer) && <LanguageToggle />}
          <Button variant="outline" size="icon" asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
