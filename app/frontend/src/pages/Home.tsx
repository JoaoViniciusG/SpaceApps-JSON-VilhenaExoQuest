import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Telescope, BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [amountStars, setAmountStars] = useState<number | null>(null);
  const [amountExoplanets, setAmountExoplanets] = useState<number | null>(null);

  useEffect(() => {
  (async () => {
    try {
      const res = await fetch("https://neoma-uninternalized-irretraceably.ngrok-free.dev/getInfos", {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setAmountStars(typeof data.amountStars === "number" ? data.amountStars : null);
      setAmountExoplanets(typeof data.amountExoplanets === "number" ? data.amountExoplanets : null);
    } catch (err) {
      console.error("Failed to load infos:", err);
    }
  })();
}, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Telescope className="h-20 w-20 text-primary animate-pulse" />
            <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">{t("home.title")}</h1>
          <p className="text-xl md:text-2xl text-primary font-semibold">{t("home.subtitle")}</p>
        </div>

        {/* Description */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">{t("home.welcome")}</p>
          <p className="text-base text-muted-foreground">{t("home.details")}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button size="lg" className="gap-2 text-lg px-8 py-6 min-w-[280px]" onClick={() => navigate("/explorer")}> 
            <Telescope className="h-5 w-5" />
            {t("home.cta_explore")}
          </Button>
          
          <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 min-w-[280px]" onClick={() => navigate("/about")}> 
            <BookOpen className="h-5 w-5" />
            {t("home.cta_about")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 pt-12 max-w-2xl mx-auto">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">3</p>
            <p className="text-sm text-muted-foreground">{t("home.stats.missions")}</p>
          </div>

          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">100+</p>
            <p className="text-sm text-muted-foreground">{t("home.stats.systems")}</p>
          </div>

          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">
              {amountStars !== null ? amountStars.toLocaleString() : "—"}
            </p>
            <p className="text-sm text-muted-foreground">{t("home.stats.stars")}</p>
          </div>

          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">
              {amountExoplanets !== null ? amountExoplanets.toLocaleString() : "—"}
            </p>
            <p className="text-sm text-muted-foreground">{t("home.stats.exoplanets")}</p>
          </div>
        </div>
        <div className="fixed top-4 right-6 md:right-8 lg:right-12 z-50">
          <LanguageToggle size="lg" className="text-lg px-3 py-1 shadow-md" />
        </div>
      </div>

      {/* CSS for animated starfield */}
      <style>{`
        .stars-small, .stars-medium, .stars-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }
        
        .stars-small {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 90px 10px, white, transparent);
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 3s infinite;
        }
        
        .stars-medium {
          background-image: 
            radial-gradient(3px 3px at 100px 120px, white, transparent),
            radial-gradient(2px 2px at 170px 80px, white, transparent);
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: twinkle 4s infinite;
        }
        
        .stars-large {
          background-image: 
            radial-gradient(4px 4px at 250px 150px, white, transparent),
            radial-gradient(3px 3px at 350px 200px, white, transparent);
          background-repeat: repeat;
          background-size: 400px 400px;
          animation: twinkle 5s infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Home;
