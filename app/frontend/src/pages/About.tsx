import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Telescope, Satellite, Globe, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useI18n } from "@/lib/i18n";

const About = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      {/* NOTE: Header removed here because a global Header component is sticky; padding added to main */}

      {/* Content */}
  <main className="container mx-auto px-6 py-12 max-w-5xl pt-24">
        <div className="space-y-12">
          {/* What are Exoplanets */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">{t("about.what_title")}</h2>
            </div>
            
            <Card className="p-6 bg-card/50 backdrop-blur border-border">
              <p className="text-lg text-muted-foreground leading-relaxed">{t("about.what_text")}</p>
            </Card>
          </section>

          {/* Discovery Methods */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">{t("about.methods_title")}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 backdrop-blur border-border space-y-3">
                <h3 className="text-xl font-semibold text-primary">{t("about.method_transit.title")}</h3>
                <p className="text-muted-foreground">{t("about.method_transit.text")}</p>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur border-border space-y-3">
                <h3 className="text-xl font-semibold text-primary">{t("about.method_radial.title")}</h3>
                <p className="text-muted-foreground">{t("about.method_radial.text")}</p>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur border-border space-y-3">
                <h3 className="text-xl font-semibold text-primary">{t("about.method_direct.title")}</h3>
                <p className="text-muted-foreground">{t("about.method_direct.text")}</p>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur border-border space-y-3">
                <h3 className="text-xl font-semibold text-primary">{t("about.method_micro.title")}</h3>
                <p className="text-muted-foreground">{t("about.method_micro.text")}</p>
              </Card>
            </div>
          </section>

          {/* Missions */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Satellite className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">{t("about.missions_title")}</h2>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 bg-card/50 backdrop-blur border-border">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-semibold text-primary">{t("about.mission_kepler.title")}</h3>
                    <span className="text-sm text-muted-foreground">{t("about.mission_kepler.period")}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{t("about.mission_kepler.text")}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_kepler.badge1")}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_kepler.badge2")}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur border-border">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-semibold text-primary">{t("about.mission_tess.title")}</h3>
                    <span className="text-sm text-muted-foreground">{t("about.mission_tess.period")}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{t("about.mission_tess.text")}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_tess.badge1")}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_tess.badge2")}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_tess.badge3")}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur border-border">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-semibold text-primary">{t("about.mission_archive.title")}</h3>
                    <span className="text-sm text-muted-foreground">{t("about.mission_archive.period")}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{t("about.mission_archive.text")}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_archive.badge1")}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_archive.badge2")}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{t("about.mission_archive.badge3")}</span>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <div className="flex justify-center pt-6">
            <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => navigate("/explorer")}> 
              <Telescope className="h-5 w-5" />
              {t("about.cta_explore")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
