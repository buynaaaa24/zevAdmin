"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ensureClientAuthorized,
  PERMISSION_DENIED_MN,
  withClientAdminAuth,
} from "@/lib/adminClientAuth";
import { getApiBaseUrl, joinBackendRequestUrl } from "@/lib/api";
import {
  Briefcase,
  Building2,
  ClipboardList,
  Home,
  LayoutGrid,
  Megaphone,
  Newspaper,
  Phone,
  Trash2,
} from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import {
  DangerMini,
  EditorAlerts,
  EditorBody,
  EditorSection,
  EditorSurface,
  EditorTabRail,
  EditorTabSelect,
  GhostButton,
  PrimarySave,
  scInput,
  scTextarea,
} from "./editorUi";

type StatItem = { value: string; label: string };

type HomeState = {
  hero: {
    slideImages: string[];
    badge: string;
    titleLine1: string;
    titleAccent: string;
    titleLine2: string;
    desc: string;
    btn1: string;
    btn2: string;
    stats: { value: string; label: string }[];
    slideLabel: string;
  };
};

type AboutState = {
  main: {
    sectionLabel: string;
    h2Line1: string;
    h2Accent: string;
    p1: string;
    p2: string;
    imageUrl: string;
    imageBuildingName: string;
    imageBuildingSubtitle: string;
    yearsBadgeValue: string;
    yearsLabel: string;
    stats: StatItem[];
    partners: { name: string; src: string; width: number; height: number }[];
  };
};

type FooterState = {
  partners: {
    partnersLabel: string;
    items: { name: string; src: string; width: number; height: number }[];
  };
  brand: { desc: string };
};

type ContactState = {
  hero: { badge: string; h2Accent: string; intro: string };
  items: { title: string; value: string }[];
  agent: {
    initials: string;
    name: string;
    role: string;
    telHref: string;
    telLabel: string;
  };
  formTitle: string;
  formLabels: { name: string; email: string; message: string };
};
type ServicesState = {
  header: { badge: string; h2Line1: string; h2Accent: string; intro: string };
  features: { title: string; desc: string; image?: string; accent?: string }[];
  banner: { value: string; suffix: string; label: string }[];
};
type PropertiesPageState = {
  header: {
    badge: string;
    titleLine1: string;
    titleAccent: string;
    intro: string;
  };
  categories: string[];
  items: {
    id: number;
    name: string;
    image: string;
    category: string;
    videoUrl?: string;
    redirectUrl?: string;
  }[];
  cta: { href: string; label: string };
};
type SalesPageState = { header: { eyebrow: string; title: string; intro: string } };
type JobsPageState = { header: { title: string; intro: string } };
type TeamPageState = {
  header: { eyebrow: string; h2Line1: string; h2Accent: string; intro: string };
  members: {
    name: string;
    role: string;
    initials: string;
    color: string;
    phone: string;
    email: string;
    bio: string;
    projects: number;
  }[];
  cta: { title: string; subtitle: string; buttonLabel: string; buttonHref: string };
};
type ParkEaseState = {
  hero: { eyebrow: string; title1: string; desc: string; cta1: string; cta2: string; image?: string; stats: { value: string; label: string }[] };
  how: { label: string; title: string[]; desc: string; steps: { title: string; desc: string }[] };
  payments: { label: string; title: string[]; desc: string; qpayTitle: string; qpayBadge: string; qpayDesc: string; stickerTitle: string; stickerBadge: string; stickerDesc: string; note: string; banks: { name: string; sub: string; image?: string }[] };
  features: { label: string; title: string; desc: string; items: { title: string; desc: string }[] };
  pricing: { label: string; title: string; desc: string; mostPopular: string; ctaBtn: string; note: string; quoteBtn: string; tiers: { name: string; slots: string; features: string[] }[] };
  free: { title: string; desc: string; cards: { label: string; sub: string }[] };
  cta: { title: string; desc: string; btn: string };
};
type PosEaseState = {
  hero: { title: string; titleAccent: string; desc: string; cta: string; secondary: string; image?: string };
  features: { title: string; desc: string; items: { title: string; desc: string; size: "small" | "medium" | "large"; image?: string }[] };
  hardware: { title: string; items: { name: string; desc: string; label: string; image?: string }[] };
  pricing: { title: string; tiers: { name: string; price: string; desc: string }[] };
};
type AmarHomeState = {
  hero: { title: string; titleAccent: string; desc: string; cta: string; image?: string };
  features: { title: string; desc: string; items: { title: string; desc: string; size: "small" | "medium" | "large"; image?: string }[] };
  hardware: { title: string; items: { name: string; desc: string; label: string; image?: string }[] };
  pricing: { title: string; tiers: { name: string; price: string; desc: string }[] };
};
type AjluudState = {
  header: { badge: string; titleLine1: string; titleAccent: string };
  items: {
    id: number;
    title: string;
    category: string;
    image: string;
    mobileImage?: string;
    showMobile?: boolean;
    videoUrl?: string;
    description?: string;
    link?: string;
  }[];
};

const EMPTY_PARKEASE: ParkEaseState = {
  hero: { eyebrow: "", title1: "", desc: "", cta1: "", cta2: "", stats: [] },
  how: { label: "", title: ["", ""], desc: "", steps: [] },
  payments: { label: "", title: ["", ""], desc: "", qpayTitle: "", qpayBadge: "", qpayDesc: "", stickerTitle: "", stickerBadge: "", stickerDesc: "", note: "", banks: [] },
  features: { label: "", title: "", desc: "", items: [] },
  pricing: { label: "", title: "", desc: "", mostPopular: "", ctaBtn: "", note: "", quoteBtn: "", tiers: [] },
  free: { title: "", desc: "", cards: [] },
  cta: { title: "", desc: "", btn: "" },
};
const EMPTY_POSEASE: PosEaseState = {
  hero: { title: "", titleAccent: "", desc: "", cta: "", secondary: "" },
  features: { title: "", desc: "", items: [] },
  hardware: { title: "", items: [] },
  pricing: { title: "", tiers: [] },
};
const EMPTY_AMARHOME: AmarHomeState = {
  hero: { title: "", titleAccent: "", desc: "", cta: "" },
  features: { title: "", desc: "", items: [] },
  hardware: { title: "", items: [] },
  pricing: { title: "", tiers: [] },
};
const EMPTY_AJLUUD: AjluudState = {
  header: { badge: "", titleLine1: "", titleAccent: "" },
  items: [],
};

const EMPTY_HOME: HomeState = {
  hero: {
    slideImages: [],
    badge: "",
    titleLine1: "",
    titleAccent: "",
    titleLine2: "",
    desc: "",
    btn1: "",
    btn2: "",
    stats: [],
    slideLabel: "",
  },
};
const EMPTY_ABOUT: AboutState = {
  main: {
    sectionLabel: "",
    h2Line1: "",
    h2Accent: "",
    p1: "",
    p2: "",
    imageUrl: "",
    imageBuildingName: "",
    imageBuildingSubtitle: "",
    yearsBadgeValue: "",
    yearsLabel: "",
    stats: [],
    partners: [],
  },
};
const EMPTY_FOOTER: FooterState = {
  partners: { partnersLabel: "", items: [] },
  brand: { desc: "" },
};
const EMPTY_CONTACT: ContactState = {
  hero: { badge: "", h2Accent: "", intro: "" },
  items: [],
  agent: { initials: "", name: "", role: "", telHref: "", telLabel: "" },
  formTitle: "",
  formLabels: { name: "", email: "", message: "" },
};
const EMPTY_SERVICES: ServicesState = {
  header: { badge: "", h2Line1: "", h2Accent: "", intro: "" },
  features: [],
  banner: [],
};
const EMPTY_PROPERTIES_PAGE: PropertiesPageState = {
  header: { badge: "", titleLine1: "", titleAccent: "", intro: "" },
  categories: [],
  items: [],
  cta: { href: "", label: "" },
};
const EMPTY_SALES_PAGE: SalesPageState = {
  header: { eyebrow: "", title: "", intro: "" },
};
const EMPTY_JOBS_PAGE: JobsPageState = {
  header: { title: "", intro: "" },
};
const EMPTY_TEAM_PAGE: TeamPageState = {
  header: { eyebrow: "", h2Line1: "", h2Accent: "", intro: "" },
  members: [],
  cta: { title: "", subtitle: "", buttonLabel: "", buttonHref: "" },
};

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}
function normalizeHome(v: unknown): HomeState {
  const root = asRecord(v);
  const hero = asRecord(root.hero);
  return {
    hero: {
      ...EMPTY_HOME.hero,
      ...hero,
      slideImages: Array.isArray(hero.slideImages) ? (hero.slideImages as string[]) : [],
      stats: Array.isArray(hero.stats) ? (hero.stats as StatItem[]) : [],
    },
  };
}
function normalizeAbout(v: unknown): AboutState {
  const root = asRecord(v);
  const main = asRecord(root.main);
  return {
    main: {
      ...EMPTY_ABOUT.main,
      ...main,
      stats: Array.isArray(main.stats) ? (main.stats as StatItem[]) : [],
      partners: Array.isArray(main.partners) ? (main.partners as { name: string; src: string; width: number; height: number }[]) : [],
    },
  };
}
function normalizeFooter(v: unknown): FooterState {
  const root = asRecord(v);
  const partners = asRecord(root.partners);
  const brand = asRecord(root.brand);
  return {
    partners: {
      ...EMPTY_FOOTER.partners,
      ...partners,
      items: Array.isArray(partners.items)
        ? (partners.items as { name: string; src: string; width: number; height: number }[])
        : [],
    },
    brand: { ...EMPTY_FOOTER.brand, ...brand },
  };
}
function normalizeContact(v: unknown): ContactState {
  const root = asRecord(v);
  return {
    hero: { ...EMPTY_CONTACT.hero, ...asRecord(root.hero) },
    items: Array.isArray(root.items) ? (root.items as { title: string; value: string }[]) : [],
    agent: { ...EMPTY_CONTACT.agent, ...asRecord(root.agent) },
    formTitle: typeof root.formTitle === "string" ? root.formTitle : "",
    formLabels: {
      name: "",
      email: "",
      message: "",
      ...asRecord(root.formLabels),
    } as { name: string; email: string; message: string },
  };
}
function normalizeServices(v: unknown): ServicesState {
  const root = asRecord(v);
  return {
    header: { ...EMPTY_SERVICES.header, ...asRecord(root.header) },
    features: Array.isArray(root.features)
      ? (root.features as { title: string; desc: string; image?: string; accent?: string }[])
      : [],
    banner: Array.isArray(root.banner)
      ? (root.banner as { value: string; suffix: string; label: string }[])
      : [],
  };
}
function normalizePropertiesPage(v: unknown): PropertiesPageState {
  const root = asRecord(v);
  return {
    header: { ...EMPTY_PROPERTIES_PAGE.header, ...asRecord(root.header) },
    categories: Array.isArray(root.categories) ? (root.categories as string[]) : [],
    items: Array.isArray(root.items)
      ? (root.items as PropertiesPageState["items"])
      : [],
    cta: { ...EMPTY_PROPERTIES_PAGE.cta, ...asRecord(root.cta) },
  };
}
function normalizeSalesPage(v: unknown): SalesPageState {
  const root = asRecord(v);
  return { header: { ...EMPTY_SALES_PAGE.header, ...asRecord(root.header) } };
}
function normalizeJobsPage(v: unknown): JobsPageState {
  const root = asRecord(v);
  return { header: { ...EMPTY_JOBS_PAGE.header, ...asRecord(root.header) } };
}
function normalizeTeamPage(v: unknown): TeamPageState {
  const root = asRecord(v);
  return {
    header: { ...EMPTY_TEAM_PAGE.header, ...asRecord(root.header) },
    members: Array.isArray(root.members)
      ? (root.members as TeamPageState["members"])
      : [],
    cta: { ...EMPTY_TEAM_PAGE.cta, ...asRecord(root.cta) },
  };
}
function normalizeParkEase(v: unknown): ParkEaseState {
  const root = asRecord(v);
  return {
    hero: {
      ...EMPTY_PARKEASE.hero,
      ...asRecord(root.hero),
      stats: Array.isArray(asRecord(root.hero).stats) ? (asRecord(root.hero).stats as any) : [],
    },
    how: {
      ...EMPTY_PARKEASE.how,
      ...asRecord(root.how),
      title: Array.isArray(asRecord(root.how).title) ? (asRecord(root.how).title as string[]) : ["", ""],
      steps: Array.isArray(asRecord(root.how).steps) ? (asRecord(root.how).steps as any) : [],
    },
    payments: {
      ...EMPTY_PARKEASE.payments,
      ...asRecord(root.payments),
      title: Array.isArray(asRecord(root.payments).title) ? (asRecord(root.payments).title as string[]) : ["", ""],
      banks: Array.isArray(asRecord(root.payments).banks) ? (asRecord(root.payments).banks as any) : [],
    },
    features: {
      ...EMPTY_PARKEASE.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items) ? (asRecord(root.features).items as any) : [],
    },
    pricing: {
      ...EMPTY_PARKEASE.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers) ? (asRecord(root.pricing).tiers as any) : [],
    },
    free: {
      ...EMPTY_PARKEASE.free,
      ...asRecord(root.free),
      cards: Array.isArray(asRecord(root.free).cards) ? (asRecord(root.free).cards as any) : [],
    },
    cta: { ...EMPTY_PARKEASE.cta, ...asRecord(root.cta) },
  };
}
function normalizePosEase(v: unknown): PosEaseState {
  const root = asRecord(v);
  return {
    hero: { ...EMPTY_POSEASE.hero, ...asRecord(root.hero) },
    features: {
      ...EMPTY_POSEASE.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items) ? (asRecord(root.features).items as any) : [],
    },
    hardware: {
      ...EMPTY_POSEASE.hardware,
      ...asRecord(root.hardware),
      items: Array.isArray(asRecord(root.hardware).items) ? (asRecord(root.hardware).items as any) : [],
    },
    pricing: {
      ...EMPTY_POSEASE.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers) ? (asRecord(root.pricing).tiers as any) : [],
    },
  };
}
function normalizeAmarHome(v: unknown): AmarHomeState {
  const root = asRecord(v);
  return {
    hero: { ...EMPTY_AMARHOME.hero, ...asRecord(root.hero) },
    features: {
      ...EMPTY_AMARHOME.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items) ? (asRecord(root.features).items as any) : [],
    },
    hardware: {
      ...EMPTY_AMARHOME.hardware,
      ...asRecord(root.hardware),
      items: Array.isArray(asRecord(root.hardware).items) ? (asRecord(root.hardware).items as any) : [],
    },
    pricing: {
      ...EMPTY_AMARHOME.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers) ? (asRecord(root.pricing).tiers as any) : [],
    },
  };
}
function normalizeAjluud(v: unknown): AjluudState {
  const root = asRecord(v);
  return {
    header: { ...EMPTY_AJLUUD.header, ...asRecord(root.header) },
    items: Array.isArray(root.items) ? (root.items as AjluudState["items"]) : [],
  };
}

async function fetchSections(pageId: string, lang: string, siteId: string): Promise<Record<string, unknown>> {
  const res = await fetch(
    joinBackendRequestUrl(getApiBaseUrl(), `/api/v1/admin/site-pages/${pageId}?lang=${lang}&siteId=${siteId}`),
    withClientAdminAuth(),
  );
  const gate = await ensureClientAuthorized(res);
  if (gate === "forbidden") throw new Error("FC_FORBIDDEN");
  if (gate !== "ok") return {};
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { data?: { sections?: unknown } };
  const s = json.data?.sections;
  return s && typeof s === "object" && !Array.isArray(s)
    ? (s as Record<string, unknown>)
    : {};
}

export function useTabs(siteId: string) {
  const { t } = useAdminLanguage();
  const tabs = [
    {
      id: "home" as const,
      label: t.siteContent.tabs.home.label,
      hint: t.siteContent.tabs.home.hint,
      icon: Home,
    },
    {
      id: "about" as const,
      label: t.siteContent.tabs.about.label,
      hint: t.siteContent.tabs.about.hint,
      icon: Building2,
    },
    {
      id: "services" as const,
      label: t.siteContent.tabs.services.label,
      hint: t.siteContent.tabs.services.hint,
      icon: Briefcase,
    },
    {
      id: "contact" as const,
      label: t.siteContent.tabs.contact.label,
      hint: t.siteContent.tabs.contact.hint,
      icon: Phone,
    },
    {
      id: "properties-page" as const,
      label: t.siteContent.tabs.propertiesPage.label,
      hint: t.siteContent.tabs.propertiesPage.hint,
      icon: Building2,
    },
    {
      id: "footer" as const,
      label: t.siteContent.tabs.footer.label,
      hint: t.siteContent.tabs.footer.hint,
      icon: LayoutGrid,
    },
    {
      id: "parkease" as const,
      label: "ParkEase",
      hint: "ParkEase автомат зогсоолын системийн агуулга",
      icon: Newspaper,
    },
    {
      id: "posease" as const,
      label: "PosEase",
      hint: "PosEase бүтээгдэхүүний нүүр хуудасны агуулга",
      icon: Newspaper,
    },
    {
      id: "amarhome" as const,
      label: "AmarHome",
      hint: "AmarHome бүтээгдэхүүний нүүр хуудасны агуулга",
      icon: Newspaper,
    },
    {
      id: "ajluud" as const,
      label: t.siteContent.tabs.ajluud.label,
      hint: t.siteContent.tabs.ajluud.hint,
      icon: ClipboardList,
    },
  ];

  if (siteId === "parkease") {
    return tabs.filter((t) => t.id === "parkease");
  }
  if (siteId === "posease") {
    return tabs.filter((t) => t.id === "posease" || t.id === "footer");
  }
  if (siteId === "amarhome") {
    return tabs.filter((t) => t.id === "amarhome" || t.id === "footer");
  }
  return tabs.filter((t) => t.id !== "parkease" && t.id !== "posease" && t.id !== "amarhome");}

type TabId = "home" | "about" | "services" | "contact" | "properties-page" | "sales-page" | "jobs-page" | "team" | "footer" | "parkease" | "posease" | "amarhome" | "ajluud";

export default function SiteContentPage() {
  const { lang, t } = useAdminLanguage();
  const params = useParams();
  const siteId = (params?.siteId as string) || "zevtabs";
  const TABS = useTabs(siteId);
  const [tab, setTab] = useState<TabId>(siteId === "parkease" ? "parkease" : siteId === "posease" ? "posease" : "home");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [home, setHome] = useState<HomeState>(EMPTY_HOME);
  const [about, setAbout] = useState<AboutState>(EMPTY_ABOUT);
  const [footer, setFooter] = useState<FooterState>(EMPTY_FOOTER);
  const [contact, setContact] = useState<ContactState>(EMPTY_CONTACT);
  const [services, setServices] = useState<ServicesState>(EMPTY_SERVICES);
  const [propertiesPage, setPropertiesPage] = useState<PropertiesPageState>(
    EMPTY_PROPERTIES_PAGE,
  );
  const [salesPage, setSalesPage] = useState<SalesPageState>(EMPTY_SALES_PAGE);
  const [jobsPage, setJobsPage] = useState<JobsPageState>(EMPTY_JOBS_PAGE);
  const [teamPage, setTeamPage] = useState<TeamPageState>(EMPTY_TEAM_PAGE);
  const [parkEase, setParkEase] = useState<ParkEaseState>(EMPTY_PARKEASE);
  const [posEase, setPosEase] = useState<PosEaseState>(EMPTY_POSEASE);
  const [amarHome, setAmarHome] = useState<AmarHomeState>(EMPTY_AMARHOME);
  const [ajluud, setAjluud] = useState<AjluudState>(EMPTY_AJLUUD);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [h, a, svc, c, pp, sp, jp, tm, f, pke, pe, ah, aj] = await Promise.all([
        fetchSections("home", lang, siteId),
        fetchSections("about", lang, siteId),
        fetchSections("services", lang, siteId),
        fetchSections("contact", lang, siteId),
        fetchSections("properties-page", lang, siteId),
        fetchSections("sales-page", lang, siteId),
        fetchSections("jobs-page", lang, siteId),
        fetchSections("team", lang, siteId),
        fetchSections("footer", lang, siteId),
        fetchSections("parkease", lang, siteId),
        fetchSections("posease", lang, siteId),
        fetchSections("amarhome", lang, siteId),
        fetchSections("ajluud", lang, siteId),
      ]);
      setHome(normalizeHome(h));
      setAbout(normalizeAbout(a));
      setServices(normalizeServices(svc));
      setContact(normalizeContact(c));
      setPropertiesPage(normalizePropertiesPage(pp));
      setSalesPage(normalizeSalesPage(sp));
      setJobsPage(normalizeJobsPage(jp));
      setTeamPage(normalizeTeamPage(tm));
      setFooter(normalizeFooter(f));
      setParkEase(normalizeParkEase(pke));
      setPosEase(normalizePosEase(pe));
      setAmarHome(normalizeAmarHome(ah));
      setAjluud(normalizeAjluud(aj));
    } catch (e) {
      if (e instanceof Error && e.message === "FC_FORBIDDEN") {
        setError(t.siteContent.common.forbidden);
      } else {
        setError(e instanceof Error ? e.message : t.siteContent.common.error);
      }
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const debouncedSave = useDebounce(
    async (pageId: TabId, sections: unknown) => {
      setError(null);
      setSaved(null);
      setSaving(true);

      try {
        const res = await fetch(
          joinBackendRequestUrl(getApiBaseUrl(), `/api/v1/admin/site-pages/${pageId}?lang=${lang}&siteId=${siteId}`),
          withClientAdminAuth({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sections }),
          }),
        );

        const gate = await ensureClientAuthorized(res);
        if (gate === "forbidden") {
          setError(PERMISSION_DENIED_MN);
          return;
        }
        if (gate !== "ok") return;
        if (!res.ok) throw new Error(await res.text());

        setSaved(t.siteContent.common.saveSuccess);
      } catch (e) {
        setError(e instanceof Error ? e.message : t.siteContent.common.error);
      } finally {
        setSaving(false);
      }
    },
    500,
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function save(pageId: (typeof TABS)[number]["id"]) {
    setError(null);
    setSaved(null);
    setSaving(true);
    const sections =
      pageId === "home"
        ? home
        : pageId === "about"
          ? about
          : pageId === "services"
            ? services
            : pageId === "contact"
              ? contact
              : pageId === "properties-page"
                ? propertiesPage
                : pageId === "parkease"
                  ? parkEase
                  : pageId === "posease"
                  ? posEase
                  : pageId === "amarhome"
                    ? amarHome
                    : pageId === "ajluud"
                      ? ajluud
                      : footer;
    try {
      const res = await fetch(
        joinBackendRequestUrl(getApiBaseUrl(), `/api/v1/admin/site-pages/${pageId}?lang=${lang}&siteId=${siteId}`),
        withClientAdminAuth({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        }),
      );
      const gate = await ensureClientAuthorized(res);
      if (gate === "forbidden") {
        setError(t.siteContent.common.forbidden);
        return;
      }
      if (gate !== "ok") return;
      if (!res.ok) throw new Error(await res.text());

      const rev = await fetch("/admin/api/revalidate-front", { method: "POST" });
      if (!rev.ok) {
        const t = await rev.text();
        console.warn("revalidate-front:", t);
      }

      setSaved(t.siteContent.common.revalidated);
      setTimeout(() => setSaved(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.siteContent.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] w-full max-w-none min-h-0 flex-col gap-4 overflow-hidden sm:h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-6.5rem)]">
      <EditorAlerts error={error} saved={saved} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:grid lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <aside className="hidden h-full min-h-0 lg:block lg:w-full lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-linear-to-b lg:from-slate-50 lg:to-white lg:p-4 lg:shadow-sm dark:lg:border-slate-800 dark:lg:from-slate-950 dark:lg:to-slate-900">
          <EditorTabRail
            tabs={TABS}
            active={tab}
            onSelect={(id) => setTab(id as TabId)}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          <EditorTabSelect
            tabs={TABS}
            active={tab}
            onSelect={(id) => setTab(id as TabId)}
          />

          <EditorSurface>
            <header className="shrink-0 border-b border-slate-200/80 pb-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                {t.siteContent.common.editingPage}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {TABS.find((t) => t.id === tab)?.label ?? ""}
              </h2>
              <p className="mt-1 w-full text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {TABS.find((t) => t.id === tab)?.hint}
              </p>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
              {loading ? (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t.common.loading}
                </p>
              ) : tab === "home" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "home-slides", label: t.siteContent.home.sections.slides },
                    { id: "home-hero", label: t.siteContent.home.sections.hero },
                    { id: "home-desc", label: t.siteContent.home.sections.desc },
                    { id: "home-stats", label: t.siteContent.home.sections.stats },
                  ]}
                >
                  <EditorSection
                    id="home-slides"
                    title={t.siteContent.home.fields.slideImages}
                    subtitle={t.siteContent.home.fields.heroSubtitle}
                  >
                    <div className="space-y-3">
                      {home.hero.slideImages.map((path, i) => (
                        <ImageUploadField
                          key={`slide-${i}`}
                          value={path}
                          onChange={(next) => {
                            const slideImages = [...home.hero.slideImages];
                            slideImages[i] = next;
                            setHome({
                              ...home,
                              hero: { ...home.hero, slideImages },
                            });
                          }}
                          showRemove
                          onRemove={() => {
                            const slideImages = home.hero.slideImages.filter(
                              (_, j) => j !== i,
                            );
                            setHome({
                              ...home,
                              hero: { ...home.hero, slideImages },
                            });
                          }}
                        />
                      ))}
                      <GhostButton
                        className="font-medium"
                        onClick={() =>
                          setHome({
                            ...home,
                            hero: {
                              ...home.hero,
                              slideImages: [...home.hero.slideImages, ""],
                            },
                          })
                        }
                      >
                        + {t.siteContent.home.fields.addSlide}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="home-hero"
                    title={t.siteContent.home.fields.heroTitle}
                    subtitle={t.siteContent.home.fields.heroSubtitle}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {(
                        [
                          ["badge", t.siteContent.home.fields.badge],
                          ["titleLine1", t.siteContent.home.fields.titleLine1],
                          ["titleAccent", t.siteContent.home.fields.titleAccent],
                          ["titleLine2", t.siteContent.home.fields.titleLine2],
                          ["btn1", t.siteContent.home.fields.btn1],
                          ["btn2", t.siteContent.home.fields.btn2],
                          ["slideLabel", t.siteContent.home.fields.slideLabel],
                        ] as const
                      ).map(([key, lab]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {lab}
                          </label>
                          <input
                            className={scInput}
                            value={home.hero[key] as string}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setHome({
                                ...home,
                                hero: { ...home.hero, [key]: newValue },
                              });
                              debouncedSave("home", {
                                ...home,
                                hero: { ...home.hero, [key]: newValue },
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </EditorSection>
                  <EditorSection id="home-desc" title={t.siteContent.home.sections.desc}>
                    <textarea
                      className={scTextarea("min-h-[100px]")}
                      value={home.hero.desc}
                      onChange={(e) =>
                        setHome({
                          ...home,
                          hero: { ...home.hero, desc: e.target.value },
                        })
                      }
                    />
                  </EditorSection>
                  <EditorSection
                    id="home-stats"
                    title={t.siteContent.home.sections.stats}
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      {home.hero.stats.map((row, i) => (
                        <div key={i} className="flex flex-wrap gap-2">
                          <input
                            className={`${scInput} max-w-[140px]`}
                            placeholder={t.siteContent.common.placeholder}
                            value={row.value}
                            onChange={(e) => {
                              const stats = [...home.hero.stats];
                              stats[i] = { ...stats[i], value: e.target.value };
                              setHome({
                                ...home,
                                hero: { ...home.hero, stats },
                              });
                            }}
                          />
                          <input
                            className={`${scInput} min-w-[200px] flex-1`}
                            placeholder={t.siteContent.common.label}
                            value={row.label}
                            onChange={(e) => {
                              const stats = [...home.hero.stats];
                              stats[i] = { ...stats[i], label: e.target.value };
                              setHome({
                                ...home,
                                hero: { ...home.hero, stats },
                              });
                            }}
                          />
                          <DangerMini
                            onClick={() => {
                              const stats = home.hero.stats.filter(
                                (_, j) => j !== i,
                              );
                              setHome({
                                ...home,
                                hero: { ...home.hero, stats },
                              });
                            }}
                          >
                            {t.siteContent.common.remove}
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setHome({
                            ...home,
                            hero: {
                              ...home.hero,
                              stats: [
                                ...home.hero.stats,
                                { value: "", label: "" },
                              ],
                            },
                          })
                        }
                      >
                        + {t.siteContent.common.addRow}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("home")}
                  >
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.home.label)}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "about" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "about-fields", label: t.siteContent.about.sections.fields },
                    { id: "about-copy", label: t.siteContent.about.sections.copy },
                    { id: "about-stats", label: t.siteContent.about.sections.stats },
                  ]}
                >
                  <EditorSection
                    id="about-fields"
                    title={t.siteContent.about.fields.title}
                    subtitle={t.siteContent.about.fields.subtitle}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {(
                        [
                          ["sectionLabel", t.siteContent.about.fields.sectionLabel],
                          ["h2Line1", t.siteContent.about.fields.h2Line1],
                          ["h2Accent", t.siteContent.about.fields.h2Accent],
                          ["imageBuildingName", t.siteContent.about.fields.imageBuildingName],
                          ["imageBuildingSubtitle", t.siteContent.about.fields.imageBuildingSubtitle],
                          ["yearsBadgeValue", t.siteContent.about.fields.yearsBadgeValue],
                          ["yearsLabel", t.siteContent.about.fields.yearsLabel],
                        ] as const
                      ).map(([key, lab]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {lab}
                          </label>
                          <input
                            className={scInput}
                            value={about.main[key] as string}
                            onChange={(e) =>
                              setAbout({
                                ...about,
                                main: { ...about.main, [key]: e.target.value },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection id="about-copy" title={t.siteContent.about.sections.copy}>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.about.sections.copy} 1
                        </label>
                        <textarea
                          className={scTextarea("min-h-[100px]")}
                          value={about.main.p1}
                          onChange={(e) =>
                            setAbout({
                              ...about,
                              main: { ...about.main, p1: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.about.sections.copy} 2
                        </label>
                        <textarea
                          className={scTextarea("min-h-[100px]")}
                          value={about.main.p2}
                          onChange={(e) =>
                            setAbout({
                              ...about,
                              main: { ...about.main, p2: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="about-stats"
                    title={t.siteContent.about.sections.stats}
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      {about.main.stats.map((row, i) => (
                        <div key={i} className="flex flex-wrap gap-2">
                          <input
                            className={`${scInput} max-w-[140px]`}
                            value={row.value}
                            onChange={(e) => {
                              const stats = [...about.main.stats];
                              stats[i] = { ...stats[i], value: e.target.value };
                              setAbout({
                                ...about,
                                main: { ...about.main, stats },
                              });
                            }}
                          />
                          <input
                            className={`${scInput} min-w-[200px] flex-1`}
                            value={row.label}
                            onChange={(e) => {
                              const stats = [...about.main.stats];
                              stats[i] = { ...stats[i], label: e.target.value };
                              setAbout({
                                ...about,
                                main: { ...about.main, stats },
                              });
                            }}
                          />
                          <DangerMini
                            onClick={() => {
                              const stats = about.main.stats.filter(
                                (_, j) => j !== i,
                              );
                              setAbout({
                                ...about,
                                main: { ...about.main, stats },
                              });
                            }}
                          >
                            Устгах
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setAbout({
                            ...about,
                            main: {
                              ...about.main,
                              stats: [
                                ...about.main.stats,
                                { value: "", label: "" },
                              ],
                            },
                          })
                        }
                      >
                        + {t.siteContent.common.addRow}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="about-partners"
                    title="Хамтрагч байгууллагууд"
                    subtitle="About хэсэгт харагдах гүйдэг логонууд"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      {about.main.partners.map((row, i) => (
                        <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <label className="text-xs text-zinc-500">Нэр</label>
                              <input
                                className={scInput}
                                value={row.name}
                                onChange={(e) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = { ...partners[i], name: e.target.value };
                                  setAbout({ ...about, main: { ...about.main, partners } });
                                }}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <ImageUploadField
                                previewFit="contain"
                                value={row.src}
                                onChange={(next) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = { ...partners[i], src: next };
                                  setAbout({ ...about, main: { ...about.main, partners } });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">Өргөн</label>
                              <input
                                type="number"
                                className={scInput}
                                value={row.width}
                                onChange={(e) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = { ...partners[i], width: Number(e.target.value) || 0 };
                                  setAbout({ ...about, main: { ...about.main, partners } });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">Өндөр</label>
                              <input
                                type="number"
                                className={scInput}
                                value={row.height}
                                onChange={(e) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = { ...partners[i], height: Number(e.target.value) || 0 };
                                  setAbout({ ...about, main: { ...about.main, partners } });
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <DangerMini
                              onClick={() => {
                                const partners = about.main.partners.filter((_, j) => j !== i);
                                setAbout({ ...about, main: { ...about.main, partners } });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setAbout({
                            ...about,
                            main: {
                              ...about.main,
                              partners: [
                                ...about.main.partners,
                                { name: "", src: "", width: 100, height: 36 },
                              ],
                            },
                          })
                        }
                      >
                        + Түнш нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("about")}
                  >
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.about.label)}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "services" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "svc-header", label: t.siteContent.services.sections.header },
                    { id: "svc-features", label: t.siteContent.services.sections.features },
                    { id: "svc-banner", label: t.siteContent.services.sections.banner },
                  ]}
                >
                  <EditorSection
                    id="svc-header"
                    title={t.siteContent.services.fields.title}
                    subtitle={t.siteContent.services.fields.subtitle}
                  >
                    <div className="grid gap-4 lg:grid-cols-3">
                      {(
                        [
                          ["badge", t.siteContent.services.fields.badge],
                          ["h2Line1", t.siteContent.services.fields.h2Line1],
                          ["h2Accent", t.siteContent.services.fields.h2Accent],
                        ] as const
                      ).map(([key, lab]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {lab}
                          </label>
                          <input
                            className={scInput}
                            value={services.header[key]}
                            onChange={(e) =>
                              setServices({
                                ...services,
                                header: {
                                  ...services.header,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {t.siteContent.services.fields.intro}
                      </label>
                      <textarea
                        className={scTextarea("min-h-[80px]")}
                        value={services.header.intro}
                        onChange={(e) =>
                          setServices({
                            ...services,
                            header: {
                              ...services.header,
                              intro: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="svc-features"
                    title={t.siteContent.services.sections.features}
                    subtitle="max 4"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      {services.features.map((f, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-200/90 bg-white/80 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-900/40"
                        >
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            #{i + 1}
                          </span>
                          <input
                            className={scInput}
                            placeholder={t.siteContent.common.title}
                            value={f.title}
                            onChange={(e) => {
                              const features = [...services.features];
                              features[i] = { ...features[i], title: e.target.value };
                              setServices({ ...services, features });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[72px]")}
                            placeholder={t.siteContent.common.description}
                            value={f.desc}
                            onChange={(e) => {
                              const features = [...services.features];
                              features[i] = { ...features[i], desc: e.target.value };
                              setServices({ ...services, features });
                            }}
                          />
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Зураг (Image)
                            </label>
                            <ImageUploadField
                              value={f.image ?? ""}
                              onChange={(next) => {
                                const features = [...services.features];
                                features[i] = { ...features[i], image: next };
                                setServices({ ...services, features });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Accent өнгө (e.g. rgb(99, 102, 241))
                            </label>
                            <div className="flex items-center gap-2 mt-1.5">
                              <input
                                type="color"
                                className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-900"
                                value={(() => {
                                  const c = f.accent ?? "";
                                  const m = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                                  if (m) {
                                    const hex = (n: number) => n.toString(16).padStart(2, "0");
                                    return `#${hex(+m[1])}${hex(+m[2])}${hex(+m[3])}`;
                                  }
                                  return c.startsWith("#") ? c : "#6366f1";
                                })()}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const r = parseInt(hex.slice(1, 3), 16);
                                  const g = parseInt(hex.slice(3, 5), 16);
                                  const b = parseInt(hex.slice(5, 7), 16);
                                  const features = [...services.features];
                                  features[i] = { ...features[i], accent: `rgb(${r}, ${g}, ${b})` };
                                  setServices({ ...services, features });
                                }}
                              />
                              <input
                                className={`${scInput} flex-1`}
                                placeholder="rgb(99, 102, 241)"
                                value={f.accent ?? ""}
                                onChange={(e) => {
                                  const features = [...services.features];
                                  features[i] = { ...features[i], accent: e.target.value };
                                  setServices({ ...services, features });
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <DangerMini
                              onClick={() =>
                                setServices({
                                  ...services,
                                  features: services.features.filter((_, j) => j !== i),
                                })
                              }
                            >
                              {t.siteContent.common.remove}
                            </DangerMini>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setServices({
                            ...services,
                            features: [
                              ...services.features,
                              { title: "", desc: "", image: "", accent: "" },
                            ],
                          })
                        }
                      >
                        + {t.siteContent.common.add}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="svc-banner"
                    title={t.siteContent.services.sections.banner}
                    subtitle={t.siteContent.services.fields.subtitle}
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      {services.banner.map((row, i) => (
                        <div key={i} className="flex flex-wrap gap-2">
                          <input
                            className={`${scInput} max-w-[100px]`}
                            placeholder={t.siteContent.common.placeholder}
                            value={row.value}
                            onChange={(e) => {
                              const banner = [...services.banner];
                              banner[i] = {
                                ...banner[i],
                                value: e.target.value,
                              };
                              setServices({ ...services, banner });
                            }}
                          />
                          <input
                            className={`${scInput} max-w-[80px]`}
                            placeholder="Suffix"
                            value={row.suffix}
                            onChange={(e) => {
                              const banner = [...services.banner];
                              banner[i] = {
                                ...banner[i],
                                suffix: e.target.value,
                              };
                              setServices({ ...services, banner });
                            }}
                          />
                          <input
                            className={`${scInput} min-w-[180px] flex-1`}
                            placeholder={t.siteContent.common.label}
                            value={row.label}
                            onChange={(e) => {
                              const banner = [...services.banner];
                              banner[i] = {
                                ...banner[i],
                                label: e.target.value,
                              };
                              setServices({ ...services, banner });
                            }}
                          />
                          <DangerMini
                            onClick={() =>
                              setServices({
                                ...services,
                                banner: services.banner.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                          >
                            {t.siteContent.common.remove}
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setServices({
                            ...services,
                            banner: [
                              ...services.banner,
                              { value: "", suffix: "", label: "" },
                            ],
                          })
                        }
                      >
                        + Баннер мөр нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("services")}
                  >
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.services.label)}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "contact" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "contact-hero", label: t.siteContent.contact.sections.hero },
                    { id: "contact-items", label: t.siteContent.contact.sections.items },
                    { id: "contact-agent", label: t.siteContent.contact.sections.agent },
                    { id: "contact-form", label: t.siteContent.contact.sections.form },
                  ]}
                >
                  <EditorSection
                    id="contact-hero"
                    title={t.siteContent.contact.fields.heroTitle}
                    subtitle={t.siteContent.contact.fields.heroSubtitle}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ["badge", t.siteContent.contact.fields.badge],
                          ["h2Accent", t.siteContent.contact.fields.h2Accent],
                        ] as const
                      ).map(([key, lab]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {lab}
                          </label>
                          <input
                            className={scInput}
                            value={contact.hero[key]}
                            onChange={(e) =>
                              setContact({
                                ...contact,
                                hero: {
                                  ...contact.hero,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {t.siteContent.contact.fields.intro}
                      </label>
                      <textarea
                        className={scTextarea("min-h-[80px]")}
                        value={contact.hero.intro}
                        onChange={(e) =>
                          setContact({
                            ...contact,
                            hero: { ...contact.hero, intro: e.target.value },
                          })
                        }
                      />
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="contact-items"
                    title={t.siteContent.contact.fields.infoItems}
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      {contact.items.map((row, i) => (
                        <div key={i} className="flex flex-wrap gap-2">
                          <input
                            className={`${scInput} max-w-[160px]`}
                            placeholder={t.siteContent.common.title}
                            value={row.title}
                            onChange={(e) => {
                              const items = [...contact.items];
                              items[i] = { ...items[i], title: e.target.value };
                              setContact({ ...contact, items });
                            }}
                          />
                          <input
                            className={`${scInput} min-w-[200px] flex-1`}
                            placeholder={t.siteContent.common.placeholder}
                            value={row.value}
                            onChange={(e) => {
                              const items = [...contact.items];
                              items[i] = { ...items[i], value: e.target.value };
                              setContact({ ...contact, items });
                            }}
                          />
                          <DangerMini
                            onClick={() =>
                              setContact({
                                ...contact,
                                items: contact.items.filter((_, j) => j !== i),
                              })
                            }
                          >
                            {t.siteContent.common.remove}
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setContact({
                            ...contact,
                            items: [...contact.items, { title: "", value: "" }],
                          })
                        }
                      >
                        + {t.siteContent.common.addRow}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="contact-agent"
                    title={t.siteContent.contact.fields.agentTitle}
                    defaultOpen={false}
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(
                        [
                          ["initials", t.siteContent.contact.fields.initials],
                          ["name", t.siteContent.contact.fields.name],
                          ["role", t.siteContent.contact.fields.role],
                          ["telHref", t.siteContent.contact.fields.telHref],
                          ["telLabel", t.siteContent.contact.fields.telLabel],
                        ] as const
                      ).map(([key, lab]) => (
                        <div
                          key={key}
                          className={
                            key === "role" ? "sm:col-span-2 lg:col-span-3" : ""
                          }
                        >
                          <label className="text-xs text-zinc-500">{lab}</label>
                          <input
                            className={scInput}
                            value={contact.agent[key]}
                            onChange={(e) =>
                              setContact({
                                ...contact,
                                agent: {
                                  ...contact.agent,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </EditorSection>
                  <EditorSection id="contact-form" title={t.siteContent.contact.fields.formTitle}>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-zinc-500">{t.siteContent.common.title}</label>
                        <input
                          className={scInput}
                          value={contact.formTitle}
                          onChange={(e) =>
                            setContact({ ...contact, formTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {(["name", "email", "message"] as const).map((key) => (
                          <div key={key}>
                            <label className="text-xs text-zinc-500 uppercase tracking-wide">
                              {key === "name" ? "Name Label" : key === "email" ? "Email Label" : "Message Label"}
                            </label>
                            <input
                              className={scInput}
                              value={contact.formLabels[key]}
                              onChange={(e) =>
                                setContact({
                                  ...contact,
                                  formLabels: {
                                    ...contact.formLabels,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </EditorSection>
                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("contact")}
                  >
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.contact.label)}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "properties-page" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "properties-header", label: t.siteContent.propertiesPage.sections.header },
                    { id: "properties-categories", label: t.siteContent.propertiesPage.sections.categories },
                    { id: "properties-items", label: t.siteContent.propertiesPage.sections.items },
                    { id: "properties-cta", label: t.siteContent.propertiesPage.sections.cta },
                  ]}
                >
                  <EditorSection
                    id="properties-header"
                    title={t.siteContent.propertiesPage.fields.headerTitle}
                    subtitle={t.siteContent.propertiesPage.fields.headerSubtitle}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.propertiesPage.fields.headerBadge}
                        </label>
                        <input
                          className={scInput}
                          value={propertiesPage.header.badge}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              header: {
                                ...propertiesPage.header,
                                badge: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.propertiesPage.fields.titleLine1}
                        </label>
                        <input
                          className={scInput}
                          value={propertiesPage.header.titleLine1}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              header: {
                                ...propertiesPage.header,
                                titleLine1: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.propertiesPage.fields.titleAccent}
                        </label>
                        <input
                          className={scInput}
                          value={propertiesPage.header.titleAccent}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              header: {
                                ...propertiesPage.header,
                                titleAccent: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.propertiesPage.fields.intro}
                        </label>
                        <textarea
                          className={scTextarea("min-h-[90px]")}
                          value={propertiesPage.header.intro}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              header: {
                                ...propertiesPage.header,
                                intro: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="properties-categories"
                    title={t.siteContent.propertiesPage.fields.categoriesTitle}
                    subtitle={t.siteContent.propertiesPage.fields.categoriesHint}
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      {propertiesPage.categories.map((row, i) => (
                        <div key={i} className="flex flex-wrap gap-2">
                          <input
                            className={`${scInput} min-w-[220px] flex-1`}
                            value={row}
                            onChange={(e) => {
                              const categories = [...propertiesPage.categories];
                              categories[i] = e.target.value;
                              setPropertiesPage({
                                ...propertiesPage,
                                categories,
                              });
                            }}
                          />
                          <DangerMini
                            onClick={() =>
                              setPropertiesPage({
                                ...propertiesPage,
                                categories: propertiesPage.categories.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                          >
                            {t.siteContent.common.remove}
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setPropertiesPage({
                            ...propertiesPage,
                            categories: [...propertiesPage.categories, ""],
                          })
                        }
                      >
                        + {t.siteContent.common.add}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="properties-items"
                    title={t.siteContent.propertiesPage.fields.itemsTitle}
                    subtitle="Properties list"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      {propertiesPage.items.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="rounded-xl border border-slate-200/90 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/40"
                        >
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <label className="text-xs text-zinc-500">
                                {t.siteContent.propertiesPage.fields.id}
                              </label>
                              <input
                                type="number"
                                className={scInput}
                                value={item.id}
                                onChange={(e) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = {
                                    ...items[i],
                                    id: Number(e.target.value) || 0,
                                  };
                                  setPropertiesPage({
                                    ...propertiesPage,
                                    items,
                                  });
                                }}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs text-zinc-500">
                                {t.siteContent.propertiesPage.fields.name}
                              </label>
                              <input
                                className={scInput}
                                value={item.name}
                                onChange={(e) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = {
                                    ...items[i],
                                    name: e.target.value,
                                  };
                                  setPropertiesPage({
                                    ...propertiesPage,
                                    items,
                                  });
                                }}
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                              <ImageUploadField
                                previewFit="cover"
                                value={item.image}
                                onChange={(next) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = { ...items[i], image: next };
                                  setPropertiesPage({
                                    ...propertiesPage,
                                    items,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">
                                {t.siteContent.propertiesPage.fields.category}
                              </label>
                              <input
                                className={scInput}
                                value={item.category}
                                onChange={(e) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = {
                                    ...items[i],
                                    category: e.target.value,
                                  };
                                  setPropertiesPage({
                                    ...propertiesPage,
                                    items,
                                  });
                                }}
                              />
                            </div>

                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-3">
                              <label className="text-xs text-zinc-500 font-semibold text-blue-600 dark:text-blue-400">
                                Video URL (.mp4)
                              </label>
                              <input
                                className={scInput}
                                placeholder="https://example.com/video.mp4"
                                value={item.videoUrl ?? ""}
                                onChange={(e) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = {
                                    ...items[i],
                                    videoUrl: e.target.value,
                                  };
                                  setPropertiesPage({
                                    ...propertiesPage,
                                    items,
                                  });
                                }}
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-xs text-zinc-500 font-semibold text-blue-600 dark:text-blue-400">
                                Redirect URL (Next Arrow)
                              </label>
                              <input
                                className={scInput}
                                placeholder="https://example.com/details"
                                value={item.redirectUrl ?? ""}
                                onChange={(e) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = {
                                    ...items[i],
                                    redirectUrl: e.target.value,
                                  };
                                  setPropertiesPage({
                                    ...propertiesPage,
                                    items,
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <DangerMini
                              onClick={() =>
                                setPropertiesPage({
                                  ...propertiesPage,
                                  items: propertiesPage.items.filter(
                                    (_, j) => j !== i,
                                  ),
                                })
                              }
                            >
                              {t.siteContent.common.remove}
                            </DangerMini>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setPropertiesPage({
                            ...propertiesPage,
                            items: [
                              ...propertiesPage.items,
                              {
                                id: Date.now(),
                                name: "",
                                image: "",
                                category: "",
                              },
                            ],
                          })
                        }
                      >
                        + {t.siteContent.common.add}
                      </GhostButton>
                    </div>
                  </EditorSection>
                  <EditorSection id="properties-cta" title={t.siteContent.propertiesPage.sections.cta}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.propertiesPage.fields.href}
                        </label>
                        <input
                          className={scInput}
                          value={propertiesPage.cta.href}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              cta: {
                                ...propertiesPage.cta,
                                href: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.siteContent.propertiesPage.fields.label}
                        </label>
                        <input
                          className={scInput}
                          value={propertiesPage.cta.label}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              cta: {
                                ...propertiesPage.cta,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("properties-page")}
                  >
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.propertiesPage.label)}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "parkease" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "pke-hero", label: "Hero хэсэг" },
                    { id: "pke-how", label: "Хэрхэн ажилладаг" },
                    { id: "pke-payments", label: "Төлбөр" },
                    { id: "pke-features", label: "Онцлогууд" },
                    { id: "pke-pricing", label: "Үнэ тариф" },
                    { id: "pke-free", label: "Үнэгүй жолооч" },
                    { id: "pke-cta", label: "Дуудлага" },
                  ]}
                >
                  <EditorSection id="pke-hero" title="Hero хэсэг">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Eyebrow (дээрх жижиг текст)</label>
                        <input className={scInput} value={parkEase.hero.eyebrow} onChange={e => setParkEase({ ...parkEase, hero: { ...parkEase.hero, eyebrow: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг (title1)</label>
                        <input className={scInput} value={parkEase.hero.title1} onChange={e => setParkEase({ ...parkEase, hero: { ...parkEase.hero, title1: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Үндсэн товч (cta1)</label>
                        <input className={scInput} value={parkEase.hero.cta1} onChange={e => setParkEase({ ...parkEase, hero: { ...parkEase.hero, cta1: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хоёрдогч товч (cta2)</label>
                        <input className={scInput} value={parkEase.hero.cta2} onChange={e => setParkEase({ ...parkEase, hero: { ...parkEase.hero, cta2: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <textarea className={scTextarea("min-h-[80px]")} value={parkEase.hero.desc} onChange={e => setParkEase({ ...parkEase, hero: { ...parkEase.hero, desc: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Hero зураг</label>
                        <ImageUploadField value={parkEase.hero.image || ""} onChange={next => setParkEase({ ...parkEase, hero: { ...parkEase.hero, image: next } })} />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Статистик</label>
                      {parkEase.hero.stats.map((stat, i) => (
                        <div key={i} className="flex gap-2">
                          <input className={`${scInput} w-24`} placeholder="Утга" value={stat.value} onChange={e => {
                            const stats = [...parkEase.hero.stats]; stats[i] = { ...stats[i], value: e.target.value };
                            setParkEase({ ...parkEase, hero: { ...parkEase.hero, stats } });
                          }} />
                          <input className={`${scInput} flex-1`} placeholder="Шошго" value={stat.label} onChange={e => {
                            const stats = [...parkEase.hero.stats]; stats[i] = { ...stats[i], label: e.target.value };
                            setParkEase({ ...parkEase, hero: { ...parkEase.hero, stats } });
                          }} />
                          <DangerMini onClick={() => setParkEase({ ...parkEase, hero: { ...parkEase.hero, stats: parkEase.hero.stats.filter((_, j) => j !== i) } })}>Устгах</DangerMini>
                        </div>
                      ))}
                      <GhostButton onClick={() => setParkEase({ ...parkEase, hero: { ...parkEase.hero, stats: [...parkEase.hero.stats, { value: "", label: "" }] } })}>+ Статистик нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pke-how" title="Хэрхэн ажилладаг">
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн шошго (label)</label>
                        <input className={scInput} value={parkEase.how.label} onChange={e => setParkEase({ ...parkEase, how: { ...parkEase.how, label: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <input className={scInput} value={parkEase.how.desc} onChange={e => setParkEase({ ...parkEase, how: { ...parkEase.how, desc: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг 1-р мөр</label>
                        <input className={scInput} value={parkEase.how.title[0] ?? ""} onChange={e => {
                          const title = [...parkEase.how.title]; title[0] = e.target.value;
                          setParkEase({ ...parkEase, how: { ...parkEase.how, title } });
                        }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг 2-р мөр</label>
                        <input className={scInput} value={parkEase.how.title[1] ?? ""} onChange={e => {
                          const title = [...parkEase.how.title]; title[1] = e.target.value;
                          setParkEase({ ...parkEase, how: { ...parkEase.how, title } });
                        }} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Алхамууд</label>
                      {parkEase.how.steps.map((step, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                          <div className="flex gap-3">
                            <input className={`${scInput} flex-1`} placeholder={`${i + 1}-р алхамын гарчиг`} value={step.title} onChange={e => {
                              const steps = [...parkEase.how.steps]; steps[i] = { ...steps[i], title: e.target.value };
                              setParkEase({ ...parkEase, how: { ...parkEase.how, steps } });
                            }} />
                            <DangerMini onClick={() => setParkEase({ ...parkEase, how: { ...parkEase.how, steps: parkEase.how.steps.filter((_, j) => j !== i) } })}>Устгах</DangerMini>
                          </div>
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={step.desc} onChange={e => {
                            const steps = [...parkEase.how.steps]; steps[i] = { ...steps[i], desc: e.target.value };
                            setParkEase({ ...parkEase, how: { ...parkEase.how, steps } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setParkEase({ ...parkEase, how: { ...parkEase.how, steps: [...parkEase.how.steps, { title: "", desc: "" }] } })}>+ Алхам нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pke-payments" title="Төлбөр">
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн шошго (label)</label>
                        <input className={scInput} value={parkEase.payments.label} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, label: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <input className={scInput} value={parkEase.payments.desc} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, desc: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг 1-р мөр</label>
                        <input className={scInput} value={parkEase.payments.title[0] ?? ""} onChange={e => {
                          const title = [...parkEase.payments.title]; title[0] = e.target.value;
                          setParkEase({ ...parkEase, payments: { ...parkEase.payments, title } });
                        }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг 2-р мөр</label>
                        <input className={scInput} value={parkEase.payments.title[1] ?? ""} onChange={e => {
                          const title = [...parkEase.payments.title]; title[1] = e.target.value;
                          setParkEase({ ...parkEase, payments: { ...parkEase.payments, title } });
                        }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">QPay гарчиг</label>
                        <input className={scInput} value={parkEase.payments.qpayTitle} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, qpayTitle: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">QPay шошго (badge)</label>
                        <input className={scInput} value={parkEase.payments.qpayBadge} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, qpayBadge: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">QPay тайлбар</label>
                        <textarea className={scTextarea("min-h-[60px]")} value={parkEase.payments.qpayDesc} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, qpayDesc: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Стикер QR гарчиг</label>
                        <input className={scInput} value={parkEase.payments.stickerTitle} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, stickerTitle: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Стикер QR шошго (badge)</label>
                        <input className={scInput} value={parkEase.payments.stickerBadge} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, stickerBadge: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Стикер QR тайлбар</label>
                        <textarea className={scTextarea("min-h-[60px]")} value={parkEase.payments.stickerDesc} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, stickerDesc: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тэмдэглэл (доод хэсэгт)</label>
                        <input className={scInput} value={parkEase.payments.note} onChange={e => setParkEase({ ...parkEase, payments: { ...parkEase.payments, note: e.target.value } })} />
                      </div>
                    </div>
                    <div className="space-y-3 mt-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Банкнуудын лого</label>
                      {parkEase.payments.banks.map((bank, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                          <div className="flex gap-2">
                            <input className={`${scInput} flex-1`} placeholder="Банкны нэр (жш: Khan Bank)" value={bank.name} onChange={e => {
                              const banks = [...parkEase.payments.banks]; banks[i] = { ...banks[i], name: e.target.value };
                              setParkEase({ ...parkEase, payments: { ...parkEase.payments, banks } });
                            }} />
                            <input className={`${scInput} flex-1`} placeholder="Дэд нэр (жш: Хаан Банк)" value={bank.sub} onChange={e => {
                              const banks = [...parkEase.payments.banks]; banks[i] = { ...banks[i], sub: e.target.value };
                              setParkEase({ ...parkEase, payments: { ...parkEase.payments, banks } });
                            }} />
                            <DangerMini onClick={() => setParkEase({ ...parkEase, payments: { ...parkEase.payments, banks: parkEase.payments.banks.filter((_, j) => j !== i) } })}>Устгах</DangerMini>
                          </div>
                          <ImageUploadField
                            value={bank.image ?? ""}
                            previewFit="contain"
                            onChange={next => {
                              const banks = [...parkEase.payments.banks]; banks[i] = { ...banks[i], image: next };
                              setParkEase({ ...parkEase, payments: { ...parkEase.payments, banks } });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton onClick={() => setParkEase({ ...parkEase, payments: { ...parkEase.payments, banks: [...parkEase.payments.banks, { name: "", sub: "", image: "" }] } })}>+ Банк нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pke-features" title="Онцлогууд">
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Шошго (label)</label>
                        <input className={scInput} value={parkEase.features.label} onChange={e => setParkEase({ ...parkEase, features: { ...parkEase.features, label: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн тайлбар</label>
                        <textarea className={scTextarea("min-h-[60px]")} value={parkEase.features.desc} onChange={e => setParkEase({ ...parkEase, features: { ...parkEase.features, desc: e.target.value } })} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {parkEase.features.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                          <div className="flex gap-3">
                            <input className={`${scInput} flex-1`} placeholder="Гарчиг" value={item.title} onChange={e => {
                              const items = [...parkEase.features.items]; items[i] = { ...items[i], title: e.target.value };
                              setParkEase({ ...parkEase, features: { ...parkEase.features, items } });
                            }} />
                            <DangerMini onClick={() => setParkEase({ ...parkEase, features: { ...parkEase.features, items: parkEase.features.items.filter((_, j) => j !== i) } })}>Устгах</DangerMini>
                          </div>
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={item.desc} onChange={e => {
                            const items = [...parkEase.features.items]; items[i] = { ...items[i], desc: e.target.value };
                            setParkEase({ ...parkEase, features: { ...parkEase.features, items } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setParkEase({ ...parkEase, features: { ...parkEase.features, items: [...parkEase.features.items, { title: "", desc: "" }] } })}>+ Онцлог нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pke-pricing" title="Үнэ тариф">
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Шошго (label)</label>
                        <input className={scInput} value={parkEase.pricing.label} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, label: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг</label>
                        <input className={scInput} value={parkEase.pricing.title} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <input className={scInput} value={parkEase.pricing.desc} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, desc: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хамгийн алдартай шошго</label>
                        <input className={scInput} placeholder="жш: Хамгийн алдартай" value={parkEase.pricing.mostPopular} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, mostPopular: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Товч текст</label>
                        <input className={scInput} placeholder="жш: Эхлэх →" value={parkEase.pricing.ctaBtn} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, ctaBtn: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тэмдэглэл (доод хэсэгт)</label>
                        <input className={scInput} value={parkEase.pricing.note} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, note: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Үнийн санал товч</label>
                        <input className={scInput} placeholder="жш: Үнийн санал авах →" value={parkEase.pricing.quoteBtn} onChange={e => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, quoteBtn: e.target.value } })} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {parkEase.pricing.tiers.map((tier, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-3">
                            <input className={scInput} placeholder="Багцын нэр" value={tier.name} onChange={e => {
                              const tiers = [...parkEase.pricing.tiers]; tiers[i] = { ...tiers[i], name: e.target.value };
                              setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, tiers } });
                            }} />
                            <input className={scInput} placeholder="Зогсоол (жш: 30 хүртэл)" value={tier.slots} onChange={e => {
                              const tiers = [...parkEase.pricing.tiers]; tiers[i] = { ...tiers[i], slots: e.target.value };
                              setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, tiers } });
                            }} />
                            <DangerMini onClick={() => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, tiers: parkEase.pricing.tiers.filter((_, j) => j !== i) } })}>Устгах</DangerMini>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-zinc-500">Боломжуудын жагсаалт (мөр бүр нэг боломж)</label>
                            <textarea
                              className={scTextarea("min-h-[80px]")}
                              value={tier.features.join("\n")}
                              onChange={e => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = { ...tiers[i], features: e.target.value.split("\n") };
                                setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, tiers } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <GhostButton onClick={() => setParkEase({ ...parkEase, pricing: { ...parkEase.pricing, tiers: [...parkEase.pricing.tiers, { name: "", slots: "", features: [] }] } })}>+ Багц нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pke-free" title="Үнэгүй жолооч">
                    <div className="grid gap-4 mb-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг</label>
                        <input className={scInput} value={parkEase.free.title} onChange={e => setParkEase({ ...parkEase, free: { ...parkEase.free, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <textarea className={scTextarea("min-h-[70px]")} value={parkEase.free.desc} onChange={e => setParkEase({ ...parkEase, free: { ...parkEase.free, desc: e.target.value } })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Картууд</label>
                      {parkEase.free.cards.map((card, i) => (
                        <div key={i} className="flex gap-2">
                          <input className={`${scInput} flex-1`} placeholder="Гарчиг" value={card.label} onChange={e => {
                            const cards = [...parkEase.free.cards]; cards[i] = { ...cards[i], label: e.target.value };
                            setParkEase({ ...parkEase, free: { ...parkEase.free, cards } });
                          }} />
                          <input className={`${scInput} flex-1`} placeholder="Дэд текст" value={card.sub} onChange={e => {
                            const cards = [...parkEase.free.cards]; cards[i] = { ...cards[i], sub: e.target.value };
                            setParkEase({ ...parkEase, free: { ...parkEase.free, cards } });
                          }} />
                          <DangerMini onClick={() => setParkEase({ ...parkEase, free: { ...parkEase.free, cards: parkEase.free.cards.filter((_, j) => j !== i) } })}>Устгах</DangerMini>
                        </div>
                      ))}
                      <GhostButton onClick={() => setParkEase({ ...parkEase, free: { ...parkEase.free, cards: [...parkEase.free.cards, { label: "", sub: "" }] } })}>+ Карт нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pke-cta" title="Дуудлага (CTA)">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг</label>
                        <input className={scInput} value={parkEase.cta.title} onChange={e => setParkEase({ ...parkEase, cta: { ...parkEase.cta, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Товчны текст</label>
                        <input className={scInput} value={parkEase.cta.btn} onChange={e => setParkEase({ ...parkEase, cta: { ...parkEase.cta, btn: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <textarea className={scTextarea("min-h-[70px]")} value={parkEase.cta.desc} onChange={e => setParkEase({ ...parkEase, cta: { ...parkEase.cta, desc: e.target.value } })} />
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave disabled={saving} onClick={() => void save("parkease")}>
                    {saving ? t.common.saving : "Хадгалах (ParkEase)"}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "posease" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "pe-hero", label: "Hero хэсэг" },
                    { id: "pe-features", label: "Боломжууд" },
                    { id: "pe-hardware", label: "Төхөөрөмжүүд" },
                    { id: "pe-pricing", label: "Үнэ тариф" },
                  ]}
                >
                  <EditorSection id="pe-hero" title="Hero хэсэг">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг</label>
                        <input className={scInput} value={posEase.hero.title} onChange={e => setPosEase({ ...posEase, hero: { ...posEase.hero, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг (онцлох)</label>
                        <input className={scInput} value={posEase.hero.titleAccent} onChange={e => setPosEase({ ...posEase, hero: { ...posEase.hero, titleAccent: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Үндсэн товч</label>
                        <input className={scInput} value={posEase.hero.cta} onChange={e => setPosEase({ ...posEase, hero: { ...posEase.hero, cta: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Туслах товч</label>
                        <input className={scInput} value={posEase.hero.secondary} onChange={e => setPosEase({ ...posEase, hero: { ...posEase.hero, secondary: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={posEase.hero.desc}
                          onChange={e => setPosEase({ ...posEase, hero: { ...posEase.hero, desc: e.target.value } })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Hero Image</label>
                        <ImageUploadField
                          value={posEase.hero.image || ""}
                          onChange={next => setPosEase({ ...posEase, hero: { ...posEase.hero, image: next } })}
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection id="pe-features" title="Боломжууд">
                    <div className="grid gap-4 mb-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн гарчиг</label>
                        <input className={scInput} value={posEase.features.title} onChange={e => setPosEase({ ...posEase, features: { ...posEase.features, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн тайлбар</label>
                        <textarea className={scTextarea("min-h-[60px]")} value={posEase.features.desc} onChange={e => setPosEase({ ...posEase, features: { ...posEase.features, desc: e.target.value } })} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {posEase.features.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-4">
                            <input className={scInput} placeholder="Гарчиг" value={item.title} onChange={e => {
                              const items = [...posEase.features.items]; items[i].title = e.target.value;
                              setPosEase({ ...posEase, features: { ...posEase.features, items } });
                            }} />
                            <select className={scInput} value={item.size} onChange={e => {
                              const items = [...posEase.features.items]; items[i].size = e.target.value as any;
                              setPosEase({ ...posEase, features: { ...posEase.features, items } });
                            }}>
                              <option value="small">Жижиг</option>
                              <option value="medium">Дунд</option>
                              <option value="large">Том</option>
                            </select>
                            <DangerMini onClick={() => {
                              const items = posEase.features.items.filter((_, j) => j !== i);
                              setPosEase({ ...posEase, features: { ...posEase.features, items } });
                            }}>Устгах</DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={next => {
                              const items = [...posEase.features.items]; items[i].image = next;
                              setPosEase({ ...posEase, features: { ...posEase.features, items } });
                            }}
                          />
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={item.desc} onChange={e => {
                            const items = [...posEase.features.items]; items[i].desc = e.target.value;
                            setPosEase({ ...posEase, features: { ...posEase.features, items } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setPosEase({ ...posEase, features: { ...posEase.features, items: [...posEase.features.items, { title: "", desc: "", size: "small" }] } })}>+ Боломж нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pe-hardware" title="Төхөөрөмжүүд">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн гарчиг</label>
                      <input className={scInput} value={posEase.hardware.title} onChange={e => setPosEase({ ...posEase, hardware: { ...posEase.hardware, title: e.target.value } })} />
                    </div>
                    <div className="space-y-4">
                      {posEase.hardware.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-4">
                            <input className={scInput} placeholder="Нэр" value={item.name} onChange={e => {
                              const items = [...posEase.hardware.items]; items[i].name = e.target.value;
                              setPosEase({ ...posEase, hardware: { ...posEase.hardware, items } });
                            }} />
                            <input className={scInput} placeholder="Төрөл (жишээ: Мобайл)" value={item.label} onChange={e => {
                              const items = [...posEase.hardware.items]; items[i].label = e.target.value;
                              setPosEase({ ...posEase, hardware: { ...posEase.hardware, items } });
                            }} />
                            <DangerMini onClick={() => {
                              const items = posEase.hardware.items.filter((_, j) => j !== i);
                              setPosEase({ ...posEase, hardware: { ...posEase.hardware, items } });
                            }}>Устгах</DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={next => {
                              const items = [...posEase.hardware.items]; items[i].image = next;
                              setPosEase({ ...posEase, hardware: { ...posEase.hardware, items } });
                            }}
                          />
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={item.desc} onChange={e => {
                            const items = [...posEase.hardware.items]; items[i].desc = e.target.value;
                            setPosEase({ ...posEase, hardware: { ...posEase.hardware, items } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setPosEase({ ...posEase, hardware: { ...posEase.hardware, items: [...posEase.hardware.items, { name: "", desc: "", label: "" }] } })}>+ Төхөөрөмж нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pe-pricing" title="Үнэ тариф">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн гарчиг</label>
                      <input className={scInput} value={posEase.pricing.title} onChange={e => setPosEase({ ...posEase, pricing: { ...posEase.pricing, title: e.target.value } })} />
                    </div>
                    <div className="space-y-4">
                      {posEase.pricing.tiers.map((tier, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-4">
                            <input className={scInput} placeholder="Багцын нэр" value={tier.name} onChange={e => {
                              const tiers = [...posEase.pricing.tiers]; tiers[i].name = e.target.value;
                              setPosEase({ ...posEase, pricing: { ...posEase.pricing, tiers } });
                            }} />
                            <input className={scInput} placeholder="Үнэ" value={tier.price} onChange={e => {
                              const tiers = [...posEase.pricing.tiers]; tiers[i].price = e.target.value;
                              setPosEase({ ...posEase, pricing: { ...posEase.pricing, tiers } });
                            }} />
                            <DangerMini onClick={() => {
                              const tiers = posEase.pricing.tiers.filter((_, j) => j !== i);
                              setPosEase({ ...posEase, pricing: { ...posEase.pricing, tiers } });
                            }}>Устгах</DangerMini>
                          </div>
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={tier.desc} onChange={e => {
                            const tiers = [...posEase.pricing.tiers]; tiers[i].desc = e.target.value;
                            setPosEase({ ...posEase, pricing: { ...posEase.pricing, tiers } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setPosEase({ ...posEase, pricing: { ...posEase.pricing, tiers: [...posEase.pricing.tiers, { name: "", price: "", desc: "" }] } })}>+ Багц нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("posease")}
                  >
                    {saving ? t.common.saving : "Хадгалах (PosEase)"}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "amarhome" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "ah-hero", label: "Hero хэсэг" },
                    { id: "ah-features", label: "Боломжууд" },
                    { id: "ah-hardware", label: "Төхөөрөмжүүд" },
                    { id: "ah-pricing", label: "Үнэ тариф" },
                  ]}
                >
                  <EditorSection id="ah-hero" title="Hero хэсэг">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг</label>
                        <input className={scInput} value={amarHome.hero.title} onChange={e => setAmarHome({ ...amarHome, hero: { ...amarHome.hero, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг (онцлох)</label>
                        <input className={scInput} value={amarHome.hero.titleAccent} onChange={e => setAmarHome({ ...amarHome, hero: { ...amarHome.hero, titleAccent: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Товчны текст</label>
                        <input className={scInput} value={amarHome.hero.cta} onChange={e => setAmarHome({ ...amarHome, hero: { ...amarHome.hero, cta: e.target.value } })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Тайлбар</label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={amarHome.hero.desc}
                          onChange={e => setAmarHome({ ...amarHome, hero: { ...amarHome.hero, desc: e.target.value } })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Hero Image</label>
                        <ImageUploadField
                          value={amarHome.hero.image || ""}
                          onChange={next => setAmarHome({ ...amarHome, hero: { ...amarHome.hero, image: next } })}
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection id="ah-features" title="Боломжууд">
                    <div className="grid gap-4 mb-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн гарчиг</label>
                        <input className={scInput} value={amarHome.features.title} onChange={e => setAmarHome({ ...amarHome, features: { ...amarHome.features, title: e.target.value } })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн тайлбар</label>
                        <textarea className={scTextarea("min-h-[60px]")} value={amarHome.features.desc} onChange={e => setAmarHome({ ...amarHome, features: { ...amarHome.features, desc: e.target.value } })} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {amarHome.features.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-4">
                            <input className={scInput} placeholder="Гарчиг" value={item.title} onChange={e => {
                              const items = [...amarHome.features.items]; items[i].title = e.target.value;
                              setAmarHome({ ...amarHome, features: { ...amarHome.features, items } });
                            }} />
                            <select className={scInput} value={item.size} onChange={e => {
                              const items = [...amarHome.features.items]; items[i].size = e.target.value as any;
                              setAmarHome({ ...amarHome, features: { ...amarHome.features, items } });
                            }}>
                              <option value="small">Жижиг</option>
                              <option value="medium">Дунд</option>
                              <option value="large">Том</option>
                            </select>
                            <DangerMini onClick={() => {
                              const items = amarHome.features.items.filter((_, j) => j !== i);
                              setAmarHome({ ...amarHome, features: { ...amarHome.features, items } });
                            }}>Устгах</DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={next => {
                              const items = [...amarHome.features.items]; items[i].image = next;
                              setAmarHome({ ...amarHome, features: { ...amarHome.features, items } });
                            }}
                          />
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={item.desc} onChange={e => {
                            const items = [...amarHome.features.items]; items[i].desc = e.target.value;
                            setAmarHome({ ...amarHome, features: { ...amarHome.features, items } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setAmarHome({ ...amarHome, features: { ...amarHome.features, items: [...amarHome.features.items, { title: "", desc: "", size: "small" }] } })}>+ Боломж нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="ah-hardware" title="Төхөөрөмжүүд">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн гарчиг</label>
                      <input className={scInput} value={amarHome.hardware.title} onChange={e => setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, title: e.target.value } })} />
                    </div>
                    <div className="space-y-4">
                      {amarHome.hardware.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-4">
                            <input className={scInput} placeholder="Нэр" value={item.name} onChange={e => {
                              const items = [...amarHome.hardware.items]; items[i].name = e.target.value;
                              setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, items } });
                            }} />
                            <input className={scInput} placeholder="Төрөл (жишээ: Мэдрэгч)" value={item.label} onChange={e => {
                              const items = [...amarHome.hardware.items]; items[i].label = e.target.value;
                              setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, items } });
                            }} />
                            <DangerMini onClick={() => {
                              const items = amarHome.hardware.items.filter((_, j) => j !== i);
                              setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, items } });
                            }}>Устгах</DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={next => {
                              const items = [...amarHome.hardware.items]; items[i].image = next;
                              setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, items } });
                            }}
                          />
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={item.desc} onChange={e => {
                            const items = [...amarHome.hardware.items]; items[i].desc = e.target.value;
                            setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, items } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setAmarHome({ ...amarHome, hardware: { ...amarHome.hardware, items: [...amarHome.hardware.items, { name: "", desc: "", label: "" }] } })}>+ Төхөөрөмж нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="ah-pricing" title="Үнэ тариф">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Хэсгийн гарчиг</label>
                      <input className={scInput} value={amarHome.pricing.title} onChange={e => setAmarHome({ ...amarHome, pricing: { ...amarHome.pricing, title: e.target.value } })} />
                    </div>
                    <div className="space-y-4">
                      {amarHome.pricing.tiers.map((tier, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex gap-4">
                            <input className={scInput} placeholder="Багцын нэр" value={tier.name} onChange={e => {
                              const tiers = [...amarHome.pricing.tiers]; tiers[i].name = e.target.value;
                              setAmarHome({ ...amarHome, pricing: { ...amarHome.pricing, tiers } });
                            }} />
                            <input className={scInput} placeholder="Үнэ" value={tier.price} onChange={e => {
                              const tiers = [...amarHome.pricing.tiers]; tiers[i].price = e.target.value;
                              setAmarHome({ ...amarHome, pricing: { ...amarHome.pricing, tiers } });
                            }} />
                            <DangerMini onClick={() => {
                              const tiers = amarHome.pricing.tiers.filter((_, j) => j !== i);
                              setAmarHome({ ...amarHome, pricing: { ...amarHome.pricing, tiers } });
                            }}>Устгах</DangerMini>
                          </div>
                          <textarea className={scTextarea("min-h-[60px]")} placeholder="Тайлбар" value={tier.desc} onChange={e => {
                            const tiers = [...amarHome.pricing.tiers]; tiers[i].desc = e.target.value;
                            setAmarHome({ ...amarHome, pricing: { ...amarHome.pricing, tiers } });
                          }} />
                        </div>
                      ))}
                      <GhostButton onClick={() => setAmarHome({ ...amarHome, pricing: { ...amarHome.pricing, tiers: [...amarHome.pricing.tiers, { name: "", price: "", desc: "" }] } })}>+ Багц нэмэх</GhostButton>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("amarhome")}
                  >
                    {saving ? t.common.saving : "Хадгалах (AmarHome)"}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "ajluud" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "ajluud-header", label: "Толгой" },
                    { id: "ajluud-items", label: "Бүтээлүүд" },
                  ]}
                >
                  <EditorSection id="ajluud-header" title="Толгой хэсэг" subtitle="Badge, гарчиг, онцлох үг">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Badge</label>
                        <input
                          className={scInput}
                          placeholder="Манай бүтээлүүд"
                          value={ajluud.header.badge}
                          onChange={(e) => setAjluud({ ...ajluud, header: { ...ajluud.header, badge: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Гарчиг</label>
                        <input
                          className={scInput}
                          placeholder="Digital"
                          value={ajluud.header.titleLine1}
                          onChange={(e) => setAjluud({ ...ajluud, header: { ...ajluud.header, titleLine1: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Онцлох үг (хоосон бол автомат)</label>
                        <input
                          className={scInput}
                          placeholder="Craft."
                          value={ajluud.header.titleAccent}
                          onChange={(e) => setAjluud({ ...ajluud, header: { ...ajluud.header, titleAccent: e.target.value } })}
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection id="ajluud-items" title="Бүтээлүүд" subtitle="Browser slideshow дээр харагдах бүтээлүүд" defaultOpen={false}>
                    <div className="space-y-4">
                      {ajluud.items.map((item, i) => (
                        <div key={item.id || i} className="rounded-xl border border-slate-200/90 bg-white/80 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-900/40">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{i + 1}</span>
                            <DangerMini onClick={() => setAjluud({ ...ajluud, items: ajluud.items.filter((_, j) => j !== i) })}>
                              Устгах
                            </DangerMini>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs text-zinc-500">Нэр</label>
                              <input
                                className={scInput}
                                placeholder="AmarHome"
                                value={item.title}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = { ...items[i], title: e.target.value };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">Ангилал</label>
                              <input
                                className={scInput}
                                placeholder="Real Estate Platform"
                                value={item.category}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = { ...items[i], category: e.target.value };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">Холбоос (URL)</label>
                              <input
                                className={scInput}
                                placeholder="https://amarhome.mn"
                                value={item.link ?? ""}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = { ...items[i], link: e.target.value };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">Тайлбар</label>
                              <input
                                className={scInput}
                                placeholder="Товч тайлбар..."
                                value={item.description ?? ""}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = { ...items[i], description: e.target.value };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-3">
                              <label className="text-xs text-zinc-500">Үндсэн зураг/видео (Desktop)</label>
                              <ImageUploadField
                                previewFit="cover"
                                value={item.image}
                                onChange={(next) => {
                                  const items = [...ajluud.items];
                                  items[i] = { ...items[i], image: next };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-500">Гар утасны зураг/видео (Mobile)</label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={item.showMobile}
                                    onChange={(e) => {
                                      const items = [...ajluud.items];
                                      items[i] = { ...items[i], showMobile: e.target.checked };
                                      setAjluud({ ...ajluud, items });
                                    }}
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Mobile харуулах</span>
                                </label>
                              </div>
                              <ImageUploadField
                                previewFit="cover"
                                value={item.mobileImage ?? ""}
                                onChange={(next) => {
                                  const items = [...ajluud.items];
                                  items[i] = { ...items[i], mobileImage: next };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setAjluud({
                            ...ajluud,
                            items: [
                              ...ajluud.items,
                              { id: Date.now(), title: "", category: "", image: "", description: "", link: "" },
                            ],
                          })
                        }
                      >
                        + Бүтээл нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <PrimarySave disabled={saving} onClick={() => void save("ajluud")}>
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.ajluud.label)}
                  </PrimarySave>
                </EditorBody>
              ) : (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "footer-brand", label: "Брэнд" },
                  ]}
                >
                  <EditorSection
                    id="footer-brand"
                    title="Лого хэсэг & брэнд"
                    subtitle="Хөлийн түншүүдийн гарчиг болон брэндийн танилцуулга"
                  >
                    <div className="grid gap-4">
                      <div className="w-full">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Танилцуулга (брэндийн текст)
                        </label>
                        <textarea
                          className={scTextarea("min-h-[90px]")}
                          value={footer.brand.desc}
                          onChange={(e) =>
                            setFooter({
                              ...footer,
                              brand: { desc: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("footer")}
                  >
                    {saving ? t.common.saving : t.siteContent.common.saveTab(t.siteContent.tabs.footer.label)}
                  </PrimarySave>
                </EditorBody>
              )}
            </div>
          </EditorSurface>
        </div>
      </div>
    </div>
  );
}
