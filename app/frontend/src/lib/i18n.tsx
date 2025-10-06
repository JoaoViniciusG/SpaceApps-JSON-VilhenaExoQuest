import React, { createContext, useContext, useMemo, useState } from "react";

export type Lang = "pt" | "en";

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
};

const translations: Record<Lang, Record<string, string>> = {
  pt: {
    "app.title": "VILHENA EXOQUEST",
    "app.subtitle": "do portal da Amazônia para novos mundos",
    "home.title": "VILHENA EXOQUEST",
    "home.subtitle": "do portal da Amazônia para novos mundos",
    "header.home": "Início",
    "header.start_exploration": "Começar a Exploração",
    "header.add_exoplanet": "Adicionar Exoplaneta",
    "home.welcome": "Bem-vindo ao Vilhena Exoquest, uma plataforma interativa para visualização de sistemas planetários confirmados e candidatos descobertos pelas missões espaciais mais importantes da humanidade.",
    "home.details": "Explore em 3D os exoplanetas das missões K2, TESS e dados do NASA Exoplanet Archive. Visualize órbitas, propriedades físicas e informações detalhadas de cada descoberta.",
    "home.cta_explore": "Ver Estrelas e Exoplanetas",
    "home.cta_about": "Aprender Sobre Exoplanetas",
    "home.stats.missions": "Missões Espaciais",
    "home.stats.stars": "Estrelas",
    "home.stats.exoplanets": "Exoplanetas",
    "about.what_title": "O que são Exoplanetas?",
    "about.what_text": "Exoplanetas são planetas que orbitam estrelas além do nosso Sol. Desde a primeira detecção confirmada em 1992, já descobrimos milhares desses mundos distantes, cada um com características únicas.",
    "about.methods_title": "Métodos de Descoberta",
    "about.method_transit.title": "Método de Trânsito",
    "about.method_transit.text": "Detecta a diminuição no brilho de uma estrela quando um planeta passa na frente dela. É o método mais produtivo, usado pelas missões Kepler e TESS.",
    "about.cta_explore": "Começar a Exploração",
    "about.method_radial.title": "Velocidade Radial",
    "about.method_radial.text": "Mede o \"bambolear\" da estrela causado pela atração gravitacional do planeta. Foi o método da primeira descoberta confirmada.",
    "about.method_direct.title": "Imagem Direta",
    "about.method_direct.text": "Captura a luz refletida ou emitida pelo próprio planeta. Muito difícil, mas permite estudar a atmosfera do exoplaneta.",
    "about.method_micro.title": "Microlente Gravitacional",
    "about.method_micro.text": "Usa o efeito de lente gravitacional quando um sistema planetário passa na frente de uma estrela de fundo, amplificando sua luz.",
    "about.missions_title": "Principais Missões",
    "about.mission_kepler.title": "Missão Kepler / K2",
    "about.mission_kepler.period": "2009-2018",
    "about.mission_kepler.text": "O telescópio espacial Kepler revolucionou nossa compreensão dos exoplanetas, descobrindo mais de 2,600 planetas confirmados. A missão K2 (segunda fase) continuou as observações em diferentes regiões do céu, adicionando centenas de descobertas ao catálogo.",
    "about.mission_kepler.badge1": "2,600+ planetas confirmados",
    "about.mission_kepler.badge2": "Método de Trânsito",
    "about.mission_tess.title": "TESS (Transiting Exoplanet Survey Satellite)",
    "about.mission_tess.period": "2018-Presente",
    "about.mission_tess.text": "Lançado em 2018, TESS está mapeando o céu inteiro em busca de exoplanetas ao redor das estrelas mais brilhantes e próximas. Seus alvos são ideais para estudos de acompanhamento detalhados, incluindo análise atmosférica.",
    "about.mission_tess.badge1": "400+ planetas confirmados",
    "about.mission_tess.badge2": "Missão Ativa",
    "about.mission_tess.badge3": "Céu Completo",
    "about.mission_archive.title": "NASA Exoplanet Archive",
    "about.mission_archive.period": "Banco de Dados",
    "about.mission_archive.text": "O Arquivo de Exoplanetas da NASA é o repositório oficial de dados confirmados sobre exoplanetas de todas as missões e telescópios terrestres. Mantém informações detalhadas sobre propriedades físicas, orbitais e métodos de descoberta.",
    "about.mission_archive.badge1": "5,000+ exoplanetas",
    "about.mission_archive.badge2": "Dados Científicos",
    "about.mission_archive.badge3": "Acesso Público",
    "lang.pt": "PT",
    "lang.en": "EN",
    // Sidebar / Explorer
    "sidebar.title": "Sistemas Planetários",
    "sidebar.systems": "sistemas",
    "sidebar.planets": "exoplanetas",
    "sidebar.search_placeholder": "Buscar sistema ou planeta...",
    "sidebar.catalog.title": "Catálogo",
    "sidebar.mission.title": "Missão",
    "sidebar.status.title": "Status",
    "sidebar.year.title": "Ano de Descoberta",
    "sidebar.method.title": "Método de Descoberta",
    "sidebar.all": "Todos",
    "sidebar.status.confirmed": "Confirmados",
    "sidebar.status.candidate": "Candidatos",
    "sidebar.planets_short": "planetas",
    // Badges / labels
    "badge.confirmed": "Confirmado",
    "badge.candidate": "Candidato",
    "badge.false_positive": "Falso Positivo",
    // Planet details
    "details.select_prompt": "Selecione um planeta para ver os detalhes",
    "details.orbiting": "Orbitando",
    "details.physical.mass": "Massa",
    "details.physical.radius": "Raio",
    "details.physical.temperature": "Temperatura",
    "details.orbital.title": "Propriedades Orbitais",
    "details.orbital.period": "Período Orbital",
    "details.orbital.distance": "Distância",
    "details.orbital.days_short": "dias",
    "details.orbital.eccentricity": "Excentricidade",
    "details.orbital.inclination": "Inclinação",
    "details.discovery.title": "Método de Descoberta",
    "details.discovery.discovered_in": "Descoberto em {year}",
    "details.star.title": "Propriedades da Estrela",
    "details.star.teff": "T_eff",
    "details.star.mass": "Massa",
    "details.star.radius": "Raio",
    "details.star.metallicity": "[Fe/H]",
    "details.star.age": "Idade",


  },
  en: {
    "app.title": "VILHENA EXOQUEST",
    "app.subtitle": "from the Amazon portal to new worlds",
    "home.title": "VILHENA EXOQUEST",
    "home.subtitle": "from the Amazon portal to new worlds",
    "header.home": "Home",
    "header.start_exploration": "Start Exploration",
    "header.add_exoplanet": "Add Exoplanet",
    "home.welcome": "Welcome to Vilhena Exoquest, an interactive platform to view confirmed and candidate planetary systems discovered by humanity's most important space missions.",
    "home.details": "Explore exoplanets in 3D from the K2 and TESS missions and the NASA Exoplanet Archive. Visualize orbits, physical properties and detailed information about each discovery.",
    "home.cta_explore": "View Stars & Exoplanets",
    "home.cta_about": "Learn About Exoplanets",
    "home.stats.missions": "Space Missions",
    "home.stats.stars": "Stars",
    "home.stats.exoplanets": "Exoplanets",
    "about.what_title": "What are Exoplanets?",
    "about.what_text": "Exoplanets are planets that orbit stars beyond our Sun. Since the first confirmed detection in 1992, we've discovered thousands of these distant worlds, each with unique characteristics.",
    "about.methods_title": "Discovery Methods",
    "about.method_transit.title": "Transit Method",
    "about.method_transit.text": "Detects the dip in a star's brightness when a planet passes in front of it. It's the most productive method, used by the Kepler and TESS missions.",
    "about.cta_explore": "Start Exploration",
    "about.method_radial.title": "Radial Velocity",
    "about.method_radial.text": "Measures the star's wobble caused by the planet's gravitational pull. It was the method behind the first confirmed detections.",
    "about.method_direct.title": "Direct Imaging",
    "about.method_direct.text": "Captures reflected or emitted light from the planet itself. Very challenging, but enables atmospheric studies.",
    "about.method_micro.title": "Gravitational Microlensing",
    "about.method_micro.text": "Uses gravitational lensing when a planetary system passes in front of a background star, magnifying its light.",
    "about.missions_title": "Key Missions",
    "about.mission_kepler.title": "Kepler / K2 Mission",
    "about.mission_kepler.period": "2009-2018",
    "about.mission_kepler.text": "The Kepler space telescope revolutionized our understanding of exoplanets, discovering more than 2,600 confirmed planets. The K2 mission (second phase) continued observations in different sky regions, adding hundreds of discoveries to the catalog.",
    "about.mission_kepler.badge1": "2,600+ confirmed planets",
    "about.mission_kepler.badge2": "Transit Method",
    "about.mission_tess.title": "TESS (Transiting Exoplanet Survey Satellite)",
    "about.mission_tess.period": "2018-Present",
    "about.mission_tess.text": "Launched in 2018, TESS is mapping the entire sky searching for exoplanets around the brightest and nearest stars. Its targets are ideal for follow-up studies, including atmospheric characterization.",
    "about.mission_tess.badge1": "400+ confirmed planets",
    "about.mission_tess.badge2": "Active Mission",
    "about.mission_tess.badge3": "Full Sky",
    "about.mission_archive.title": "NASA Exoplanet Archive",
    "about.mission_archive.period": "Database",
    "about.mission_archive.text": "The NASA Exoplanet Archive is the official repository of confirmed exoplanet data from all missions and ground telescopes. It maintains detailed information about physical, orbital properties and discovery methods.",
    "about.mission_archive.badge1": "5,000+ exoplanets",
    "about.mission_archive.badge2": "Scientific Data",
    "about.mission_archive.badge3": "Public Access",
    "lang.pt": "PT",
    "lang.en": "EN",
    // Sidebar / Explorer
    "sidebar.title": "Planetary Systems",
    "sidebar.systems": "systems",
    "sidebar.planets": "exoplanets",
    "sidebar.search_placeholder": "Search system or planet...",
    "sidebar.catalog.title": "Catalog",
    "sidebar.mission.title": "Mission",
    "sidebar.status.title": "Status",
    "sidebar.year.title": "Discovery Year",
    "sidebar.method.title": "Discovery Method",
    "sidebar.all": "All",
    "sidebar.status.confirmed": "Confirmed",
    "sidebar.status.candidate": "Candidate",
    "sidebar.planets_short": "planets",
    // Badges / labels
    "badge.confirmed": "Confirmed",
    "badge.candidate": "Candidate",
    "badge.false_positive": "False Positive",
    // Planet details
    "details.select_prompt": "Select a planet to view details",
    "details.orbiting": "Orbiting",
    "details.physical.mass": "Mass",
    "details.physical.radius": "Radius",
    "details.physical.temperature": "Temperature",
    "details.orbital.title": "Orbital Properties",
    "details.orbital.period": "Orbital Period",
    "details.orbital.distance": "Distance",
    "details.orbital.eccentricity": "Eccentricity",
    "details.orbital.inclination": "Inclination",
    "details.discovery.title": "Discovery Method",
    "details.discovery.discovered_in": "Discovered in {year}",
    "details.star.title": "Star Properties",
    "details.star.teff": "T_eff",
    "details.star.mass": "Mass",
    "details.star.radius": "Radius",
    "details.star.metallicity": "[Fe/H]",
    "details.star.age": "Age",

  },
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored === "en") return "en"; // only honor explicit english preference
    } catch (e) {
      /* ignore */
    }
    return "pt"; // default to Portuguese
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch (e) { }
  };

  const toggleLang = () => setLang(lang === "pt" ? "en" : "pt");

  const t = (key: string) => {
    return translations[lang][key] ?? translations["pt"][key] ?? key;
  };

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

export default I18nContext;
