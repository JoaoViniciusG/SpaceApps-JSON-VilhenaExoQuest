import React from "react";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n";

type Size = "sm" | "default" | "lg" | "icon";

export const LanguageToggle: React.FC<{ className?: string; size?: Size }> = ({ className = "", size = "sm" }) => {
  const { lang, toggleLang, t } = useI18n();

  return (
    <Button size={size as any} variant="outline" className={className} onClick={toggleLang}>
      {t(`lang.${lang}`)}
    </Button>
  );
};

export default LanguageToggle;
