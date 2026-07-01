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

type StatItem = { value: string; label: string; icon?: string; color?: string };

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
  bottomLeftText?: string;
  bottomRightText?: string;
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
    bio?: string;
    videoUrl?: string;
    redirectUrl?: string;
  }[];
  cta: { href: string; label: string };
  footerText?: string;
};
type SalesPageState = {
  header: { eyebrow: string; title: string; intro: string };
};
type JobsPageState = { header: { title: string; intro: string } };
type ZarPageState = {
  header: { eyebrow: string; title: string; intro: string };
  jobsHeader?: { eyebrow: string; title: string; intro: string };
  salesHeader?: { eyebrow: string; title: string; intro: string };
  jobsTabLabel?: string;
  salesTabLabel?: string;
};
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
  cta: {
    title: string;
    subtitle: string;
    buttonLabel: string;
    buttonHref: string;
  };
};
type ParkEaseState = {
  hideDescription?: boolean;
  hideAppLinks?: boolean;
  hero: {
    eyebrow: string;
    title1: string;
    words: string[];
    desc: string;
    cta1: string;
    cta2: string;
    cta2Link?: string;
    image?: string;
    videoUrl?: string;
    videos?: { url: string; bio?: string }[];
    stats: { value: string; label: string }[];
  };
  how: {
    label: string;
    title: string[];
    desc: string;
    steps: { title: string; desc: string; icon?: string }[];
  };
  payments: {
    label: string;
    title: string[];
    desc: string;
    qpayTitle: string;
    qpayBadge: string;
    qpayDesc: string;
    stickerTitle: string;
    stickerBadge: string;
    stickerDesc: string;
    note: string;
    banks: { name: string; sub: string; image?: string }[];
  };
  features: {
    label: string;
    title: string;
    desc: string;
    items: {
      title: string;
      desc: string;
      size: "small" | "medium" | "large";
      image?: string;
      icon?: string;
    }[];
  };
  bolomjuud: {
    label: string;
    title: string;
    desc: string;
    items: { title: string; desc: string; image?: string }[];
  };
  pricing: {
    label: string;
    title: string;
    desc: string;
    mostPopular: string;
    ctaBtn: string;
    note: string;
    quoteBtn: string;
    quoteLink?: string;
    tiers: {
      name: string;
      slots: string;
      features: string[];
      hideButton?: boolean;
      buttonUrl?: string;
      buttonLabel?: string;
      discounts?: { label: string; color?: string }[];
    }[];
  };
  free: {
    title: string;
    desc: string;
    cards: { label: string; sub: string }[];
    hidden?: boolean;
  };
  cta: {
    title: string;
    desc: string;
    btn: string;
    emailLabel: string;
    email: string;
    phoneLabel: string;
    phone: string;
    locationLabel: string;
    location: string;
  };
};
type PosEaseState = {
  hideDescription?: boolean;
  hideAppLinks?: boolean;
  hero: {
    title: string;
    titleAccent: string;
    desc: string;
    cta: string;
    secondary: string;
    image?: string;
    tabImage?: string;
    videoUrl?: string;
    mobileImage?: string;
    videos?: { url: string; bio?: string }[];
  };
  features: {
    title: string;
    desc: string;
    items: {
      title: string;
      desc: string;
      size: "small" | "medium" | "large";
      image?: string;
    }[];
  };
  hardware: {
    title: string;
    items: { name: string; desc: string; label: string; image?: string }[];
  };
  pricing: {
    title: string;
    tiers: {
      name: string;
      price: string;
      desc: string;
      hideButton?: boolean;
      buttonUrl?: string;
      buttonLabel?: string;
      discounts?: { label: string; color?: string }[];
    }[];
  };
};
type AmarHomeState = {
  hideDescription?: boolean;
  hideAppLinks?: boolean;
  hero: {
    title: string;
    titleAccent: string;
    desc: string;
    cta: string;
    image?: string;
    videoUrl?: string;
    videos?: { url: string; bio?: string }[];
  };
  features: {
    title: string;
    desc: string;
    items: {
      title: string;
      desc: string;
      size: "small" | "medium" | "large";
      image?: string;
    }[];
  };
  hardware: {
    title: string;
    items: { name: string; desc: string; label: string; image?: string }[];
  };
  pricing: {
    title: string;
    tiers: {
      name: string;
      price: string;
      desc: string;
      hideButton?: boolean;
      buttonUrl?: string;
      buttonLabel?: string;
      discounts?: { label: string; color?: string }[];
    }[];
  };
};
type RentlyState = {
  hideDescription?: boolean;
  hideAppLinks?: boolean;
  hero: {
    title: string;
    titleAccent: string;
    titleAccent2: string;
    desc: string;
    cta: string;
    secondary: string;
    secondaryUrl?: string;
    image?: string;
    videoUrl?: string;
    videos?: { url: string; bio?: string }[];
  };
  features: {
    title: string;
    desc: string;
    items: {
      title: string;
      desc: string;
      size: "small" | "medium" | "large";
      image?: string;
    }[];
  };
  notifications: {
    title: string;
    desc: string;
    label?: string;
    image?: string;
    videoUrl?: string;
  };
  penalties: {
    title: string;
    desc: string;
    label?: string;
    image?: string;
    videoUrl?: string;
  };
  costs: {
    title: string;
    desc: string;
    label?: string;
    image?: string;
    videoUrl?: string;
  };
  pricing: {
    title: string;
    tiers: {
      name: string;
      price: string;
      desc: string;
      hideButton?: boolean;
      buttonUrl?: string;
      buttonLabel?: string;
      discounts?: { label: string; color?: string }[];
    }[];
  };
  cta?: {
    title: string;
    subtitle: string;
    desc: string;
  };
};
type GlobalContactState = {
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
  locationLabel: string;
  location: string;
  locationUrl: string;
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
  hero: {
    eyebrow: "",
    title1: "",
    words: [],
    desc: "",
    cta1: "",
    cta2: "",
    cta2Link: "",
    stats: [],
  },
  how: { label: "", title: ["", ""], desc: "", steps: [] },
  payments: {
    label: "",
    title: ["", ""],
    desc: "",
    qpayTitle: "",
    qpayBadge: "",
    qpayDesc: "",
    stickerTitle: "",
    stickerBadge: "",
    stickerDesc: "",
    note: "",
    banks: [],
  },
  features: { label: "", title: "", desc: "", items: [] },
  bolomjuud: { label: "", title: "", desc: "", items: [] },
  pricing: {
    label: "",
    title: "",
    desc: "",
    mostPopular: "",
    ctaBtn: "",
    note: "",
    quoteBtn: "",
    quoteLink: "",
    tiers: [],
  },
  free: { title: "", desc: "", cards: [], hidden: false },
  cta: {
    title: "",
    desc: "",
    btn: "",
    emailLabel: "",
    email: "",
    phoneLabel: "",
    phone: "",
    locationLabel: "",
    location: "",
  },
};
const EMPTY_POSEASE: PosEaseState = {
  hero: {
    title: "",
    titleAccent: "",
    desc: "",
    cta: "",
    secondary: "",
    image: "",
    tabImage: "",
    mobileImage: "",
  },
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
const EMPTY_RENTLY: RentlyState = {
  hero: {
    title: "",
    titleAccent: "",
    titleAccent2: "",
    desc: "",
    cta: "",
    secondary: "",
  },
  features: { title: "", desc: "", items: [] },
  notifications: { title: "", desc: "", label: "", image: "" },
  penalties: { title: "", desc: "", label: "", image: "" },
  costs: { title: "", desc: "", label: "", image: "" },
  pricing: { title: "", tiers: [] },
  cta: { title: "", subtitle: "", desc: "" },
};
const EMPTY_GLOBAL_CONTACT: GlobalContactState = {
  emailLabel: "И-Мэйл",
  email: "info@zevtabs.mn",
  phoneLabel: "Утас",
  phone: "",
  locationLabel: "Байршил",
  location: "",
  locationUrl: "",
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
  bottomLeftText: "",
  bottomRightText: "",
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
const EMPTY_ZAR_PAGE: ZarPageState = {
  header: { eyebrow: "", title: "", intro: "" },
  jobsHeader: { eyebrow: "", title: "", intro: "" },
  salesHeader: { eyebrow: "", title: "", intro: "" },
  jobsTabLabel: "",
  salesTabLabel: "",
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
      slideImages: Array.isArray(hero.slideImages)
        ? (hero.slideImages as string[])
        : [],
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
      partners: Array.isArray(main.partners)
        ? (main.partners as {
            name: string;
            src: string;
            width: number;
            height: number;
          }[])
        : [],
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
        ? (partners.items as {
            name: string;
            src: string;
            width: number;
            height: number;
          }[])
        : [],
    },
    brand: { ...EMPTY_FOOTER.brand, ...brand },
    bottomLeftText: root.bottomLeftText as string | undefined,
    bottomRightText: (root.bottomRightText ?? root.bottomText) as
      | string
      | undefined,
  };
}
function normalizeContact(v: unknown): ContactState {
  const root = asRecord(v);
  return {
    hero: { ...EMPTY_CONTACT.hero, ...asRecord(root.hero) },
    items: Array.isArray(root.items)
      ? (root.items as { title: string; value: string }[])
      : [],
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
      ? (root.features as {
          title: string;
          desc: string;
          image?: string;
          accent?: string;
        }[])
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
    categories: Array.isArray(root.categories)
      ? (root.categories as string[])
      : [],
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
function normalizeZarPage(v: unknown): ZarPageState {
  const root = asRecord(v);
  return {
    header: {
      eyebrow: "",
      title: "",
      intro: "",
      ...asRecord(root.header),
    },
    jobsHeader: {
      eyebrow: "",
      title: "",
      intro: "",
      ...asRecord(root.jobsHeader),
    },
    salesHeader: {
      eyebrow: "",
      title: "",
      intro: "",
      ...asRecord(root.salesHeader),
    },
    jobsTabLabel:
      typeof root.jobsTabLabel === "string" ? root.jobsTabLabel : "",
    salesTabLabel:
      typeof root.salesTabLabel === "string" ? root.salesTabLabel : "",
  };
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
    hideDescription: !!root.hideDescription,
    hideAppLinks: !!root.hideAppLinks,
    hero: {
      ...EMPTY_PARKEASE.hero,
      ...asRecord(root.hero),
      words: Array.isArray(asRecord(root.hero).words)
        ? (asRecord(root.hero).words as string[])
        : [],
      stats: Array.isArray(asRecord(root.hero).stats)
        ? (asRecord(root.hero).stats as any)
        : [],
      videos: Array.isArray(asRecord(root.hero).videos) ? (asRecord(root.hero).videos as any) : undefined,
    },
    how: {
      ...EMPTY_PARKEASE.how,
      ...asRecord(root.how),
      title: Array.isArray(asRecord(root.how).title)
        ? (asRecord(root.how).title as string[])
        : ["", ""],
      steps: Array.isArray(asRecord(root.how).steps)
        ? (asRecord(root.how).steps as any)
        : [],
    },
    payments: {
      ...EMPTY_PARKEASE.payments,
      ...asRecord(root.payments),
      title: Array.isArray(asRecord(root.payments).title)
        ? (asRecord(root.payments).title as string[])
        : ["", ""],
      banks: Array.isArray(asRecord(root.payments).banks)
        ? (asRecord(root.payments).banks as any)
        : [],
    },
    features: {
      ...EMPTY_PARKEASE.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items)
        ? (asRecord(root.features).items as any[]).map((item) => ({
            title: item.title || "",
            desc: item.desc || "",
            size: item.size || "medium",
            image: item.image || "",
            icon: item.icon || "",
          }))
        : [],
    },
    bolomjuud: {
      ...EMPTY_PARKEASE.bolomjuud,
      ...asRecord(root.bolomjuud),
      items: Array.isArray(asRecord(root.bolomjuud).items)
        ? (asRecord(root.bolomjuud).items as any[]).map((item) => ({
            title: item.title || "",
            desc: item.desc || "",
            image: item.image || "",
          }))
        : [],
    },
    pricing: {
      ...EMPTY_PARKEASE.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers)
        ? (asRecord(root.pricing).tiers as any[]).map((tier) => ({
            ...tier,
            discounts: Array.isArray(tier.discounts) ? tier.discounts : [],
          }))
        : [],
    },
    free: {
      ...EMPTY_PARKEASE.free,
      ...asRecord(root.free),
      cards: Array.isArray(asRecord(root.free).cards)
        ? (asRecord(root.free).cards as any)
        : [],
      hidden: !!asRecord(root.free).hidden,
    },
    cta: { ...EMPTY_PARKEASE.cta, ...asRecord(root.cta) },
  };
}
function normalizePosEase(v: unknown): PosEaseState {
  const root = asRecord(v);
  return {
    hideDescription: !!root.hideDescription,
    hideAppLinks: !!root.hideAppLinks,
    hero: {
      ...EMPTY_POSEASE.hero,
      ...asRecord(root.hero),
      videos: Array.isArray(asRecord(root.hero).videos) ? (asRecord(root.hero).videos as any) : undefined,
    },
    features: {
      ...EMPTY_POSEASE.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items)
        ? (asRecord(root.features).items as any)
        : [],
    },
    hardware: {
      ...EMPTY_POSEASE.hardware,
      ...asRecord(root.hardware),
      items: Array.isArray(asRecord(root.hardware).items)
        ? (asRecord(root.hardware).items as any)
        : [],
    },
    pricing: {
      ...EMPTY_POSEASE.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers)
        ? (asRecord(root.pricing).tiers as any[]).map((t: any) => ({
            name: t.name ?? "",
            price: t.price ?? "",
            desc: t.desc ?? "",
            discounts: Array.isArray(t.discounts) ? t.discounts : [],
          }))
        : [],
    },
  };
}
function normalizeAmarHome(v: unknown): AmarHomeState {
  const root = asRecord(v);
  return {
    hideDescription: !!root.hideDescription,
    hideAppLinks: !!root.hideAppLinks,
    hero: {
      ...EMPTY_AMARHOME.hero,
      ...asRecord(root.hero),
      videos: Array.isArray(asRecord(root.hero).videos) ? (asRecord(root.hero).videos as any) : undefined,
    },
    features: {
      ...EMPTY_AMARHOME.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items)
        ? (asRecord(root.features).items as any)
        : [],
    },
    hardware: {
      ...EMPTY_AMARHOME.hardware,
      ...asRecord(root.hardware),
      items: Array.isArray(asRecord(root.hardware).items)
        ? (asRecord(root.hardware).items as any)
        : [],
    },
    pricing: {
      ...EMPTY_AMARHOME.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers)
        ? (asRecord(root.pricing).tiers as any[]).map((tier) => ({
            ...tier,
            discounts: Array.isArray(tier.discounts) ? tier.discounts : [],
          }))
        : [],
    },
  };
}
function normalizeRently(v: unknown): RentlyState {
  const root = asRecord(v);
  return {
    hideDescription: !!root.hideDescription,
    hideAppLinks: !!root.hideAppLinks,
    hero: { ...EMPTY_RENTLY.hero, ...asRecord(root.hero) },
    features: {
      ...EMPTY_RENTLY.features,
      ...asRecord(root.features),
      items: Array.isArray(asRecord(root.features).items)
        ? (asRecord(root.features).items as any)
        : [],
    },
    notifications: {
      ...EMPTY_RENTLY.notifications,
      ...asRecord(root.notifications),
    },
    penalties: { ...EMPTY_RENTLY.penalties, ...asRecord(root.penalties) },
    costs: { ...EMPTY_RENTLY.costs, ...asRecord(root.costs) },
    pricing: {
      ...EMPTY_RENTLY.pricing,
      ...asRecord(root.pricing),
      tiers: Array.isArray(asRecord(root.pricing).tiers)
        ? (asRecord(root.pricing).tiers as any[]).map((tier) => ({
            ...tier,
            discounts: Array.isArray(tier.discounts) ? tier.discounts : [],
          }))
        : [],
    },
    cta: {
      title: "",
      subtitle: "",
      desc: "",
      ...asRecord(root.cta),
    } as { title: string; subtitle: string; desc: string },
  };
}
function normalizeGlobalContact(v: unknown): GlobalContactState {
  const root = asRecord(v);
  return { ...EMPTY_GLOBAL_CONTACT, ...root };
}
function normalizeAjluud(v: unknown): AjluudState {
  const root = asRecord(v);
  return {
    header: { ...EMPTY_AJLUUD.header, ...asRecord(root.header) },
    items: Array.isArray(root.items)
      ? (root.items as AjluudState["items"])
      : [],
  };
}

async function fetchSections(
  pageId: string,
  lang: string,
  siteId: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(
    joinBackendRequestUrl(
      getApiBaseUrl(),
      `/api/v1/admin/site-pages/${pageId}?lang=${lang}&siteId=${siteId}`,
    ),
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
  const { lang, t } = useAdminLanguage();
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
      id: "rently" as const,
      label: "Rently",
      hint: "Rently түрээсийн удирдлагын системийн агуулга",
      icon: Newspaper,
    },
    {
      id: "ajluud" as const,
      label: t.siteContent.tabs.ajluud.label,
      hint: t.siteContent.tabs.ajluud.hint,
      icon: ClipboardList,
    },
    {
      id: "zar-page" as const,
      label: lang === "mn" ? "Зар хуудас" : "Zar Page",
      hint:
        lang === "mn"
          ? "Зар хуудасны толгой, тайлбар"
          : "Zar page header and description",
      icon: Newspaper,
    },
    {
      id: "global-contact" as const,
      label: "Глобал холбоо",
      hint: "Бүх бүтээгдэхүүний хуудсанд харагдах нийтлэг холбоо барих мэдээлэл",
      icon: Phone,
    },
  ];

  if (siteId === "parkease") {
    return tabs.filter(
      (t) =>
        t.id === "parkease" || t.id === "footer" || t.id === "global-contact",
    );
  }
  if (siteId === "posease") {
    return tabs.filter(
      (t) =>
        t.id === "posease" || t.id === "footer" || t.id === "global-contact",
    );
  }
  if (siteId === "amarhome") {
    return tabs.filter(
      (t) =>
        t.id === "amarhome" || t.id === "footer" || t.id === "global-contact",
    );
  }
  if (siteId === "rently") {
    return tabs.filter(
      (t) =>
        t.id === "rently" || t.id === "footer" || t.id === "global-contact",
    );
  }
  return tabs.filter(
    (t) =>
      t.id !== "parkease" &&
      t.id !== "posease" &&
      t.id !== "amarhome" &&
      t.id !== "rently",
  );
}

type TabId =
  | "home"
  | "about"
  | "services"
  | "contact"
  | "properties-page"
  | "sales-page"
  | "jobs-page"
  | "zar-page"
  | "team"
  | "footer"
  | "parkease"
  | "posease"
  | "amarhome"
  | "rently"
  | "ajluud"
  | "global-contact";

export default function SiteContentPage() {
  const { lang, t } = useAdminLanguage();
  const params = useParams();
  const siteId = (params?.siteId as string) || "zevtabs";
  const TABS = useTabs(siteId);
  const [tab, setTab] = useState<TabId>(
    siteId === "parkease"
      ? "parkease"
      : siteId === "posease"
        ? "posease"
        : siteId === "rently"
          ? "rently"
          : "home",
  );
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
  const [zarPage, setZarPage] = useState<ZarPageState>(EMPTY_ZAR_PAGE);
  const [teamPage, setTeamPage] = useState<TeamPageState>(EMPTY_TEAM_PAGE);
  const [parkEase, setParkEase] = useState<ParkEaseState>(EMPTY_PARKEASE);
  const [posEase, setPosEase] = useState<PosEaseState>(EMPTY_POSEASE);
  const [amarHome, setAmarHome] = useState<AmarHomeState>(EMPTY_AMARHOME);
  const [ajluud, setAjluud] = useState<AjluudState>(EMPTY_AJLUUD);
  const [rently, setRently] = useState<RentlyState>(EMPTY_RENTLY);
  const [globalContact, setGlobalContact] =
    useState<GlobalContactState>(EMPTY_GLOBAL_CONTACT);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [h, a, svc, c, pp, sp, jp, zp, tm, f, pke, pe, ah, re, aj, gc] =
        await Promise.all([
          fetchSections("home", lang, siteId),
          fetchSections("about", lang, siteId),
          fetchSections("services", lang, siteId),
          fetchSections("contact", lang, siteId),
          fetchSections("properties-page", lang, siteId),
          fetchSections("sales-page", lang, siteId),
          fetchSections("jobs-page", lang, siteId),
          fetchSections("zar-page", lang, siteId),
          fetchSections("team", lang, siteId),
          fetchSections("footer", lang, siteId),
          fetchSections("parkease", lang, siteId),
          fetchSections("posease", lang, siteId),
          fetchSections("amarhome", lang, siteId),
          fetchSections("rently", lang, siteId),
          fetchSections("ajluud", lang, siteId),
          fetchSections("global-contact", "mn", "zevtabs"),
        ]);
      setHome(normalizeHome(h));
      setAbout(normalizeAbout(a));
      setServices(normalizeServices(svc));
      setContact(normalizeContact(c));
      setPropertiesPage(normalizePropertiesPage(pp));
      setSalesPage(normalizeSalesPage(sp));
      setJobsPage(normalizeJobsPage(jp));
      setZarPage(normalizeZarPage(zp));
      setTeamPage(normalizeTeamPage(tm));
      setFooter(normalizeFooter(f));
      setParkEase(normalizeParkEase(pke));
      setPosEase(normalizePosEase(pe));
      setAmarHome(normalizeAmarHome(ah));
      setRently(normalizeRently(re));
      setAjluud(normalizeAjluud(aj));
      setGlobalContact(normalizeGlobalContact(gc));
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
          joinBackendRequestUrl(
            getApiBaseUrl(),
            `/api/v1/admin/site-pages/${pageId}?lang=${lang}&siteId=${siteId}`,
          ),
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
                : pageId === "zar-page"
                  ? zarPage
                  : pageId === "parkease"
                    ? parkEase
                    : pageId === "posease"
                      ? posEase
                      : pageId === "amarhome"
                        ? amarHome
                        : pageId === "ajluud"
                          ? ajluud
                          : pageId === "rently"
                            ? rently
                            : pageId === "global-contact"
                              ? globalContact
                              : footer;
    const saveSiteId = pageId === "global-contact" ? "zevtabs" : siteId;
    try {
      const res = await fetch(
        joinBackendRequestUrl(
          getApiBaseUrl(),
          `/api/v1/admin/site-pages/${pageId}?lang=${lang}&siteId=${saveSiteId}`,
        ),
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

      const rev = await fetch("/admin/api/revalidate-front", {
        method: "POST",
      });
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
                    {
                      id: "home-slides",
                      label: t.siteContent.home.sections.slides,
                    },
                    {
                      id: "home-hero",
                      label: t.siteContent.home.sections.hero,
                    },
                    {
                      id: "home-desc",
                      label: t.siteContent.home.sections.desc,
                    },
                    {
                      id: "home-stats",
                      label: t.siteContent.home.sections.stats,
                    },
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
                          [
                            "titleAccent",
                            t.siteContent.home.fields.titleAccent,
                          ],
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
                  <EditorSection
                    id="home-desc"
                    title={t.siteContent.home.sections.desc}
                  >
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
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.home.label,
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "zar-page" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "zar-general",
                      label:
                        lang === "mn" ? "Ерөнхий тохиргоо" : "General Settings",
                    },
                    {
                      id: "zar-jobs",
                      label: lang === "mn" ? "Ажлын зар" : "Jobs Header",
                    },
                    {
                      id: "zar-sales",
                      label:
                        lang === "mn" ? "Борлуулалтын зар" : "Sales Header",
                    },
                  ]}
                >
                  {/* General settings */}
                  <EditorSection
                    id="zar-general"
                    title={
                      lang === "mn" ? "Ерөнхий тохиргоо" : "General Settings"
                    }
                    subtitle={
                      lang === "mn"
                        ? "Хуудасны ерөнхий толгой (Fallback болгон ашиглагдана)"
                        : "General page header used as fallback"
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Ерөнхий дээд шошго (eyebrow)"
                            : "General Eyebrow"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.header.eyebrow}
                          onChange={(e) => {
                            const header = {
                              ...zarPage.header,
                              eyebrow: e.target.value,
                            };
                            setZarPage({ ...zarPage, header });
                            debouncedSave("zar-page", { ...zarPage, header });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn" ? "Ерөнхий гарчиг" : "General Title"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.header.title}
                          onChange={(e) => {
                            const header = {
                              ...zarPage.header,
                              title: e.target.value,
                            };
                            setZarPage({ ...zarPage, header });
                            debouncedSave("zar-page", { ...zarPage, header });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Ерөнхий танилцуулга"
                            : "General Introduction"}
                        </label>
                        <textarea
                          className={scTextarea("min-h-[100px]")}
                          value={zarPage.header.intro}
                          onChange={(e) => {
                            const header = {
                              ...zarPage.header,
                              intro: e.target.value,
                            };
                            setZarPage({ ...zarPage, header });
                            debouncedSave("zar-page", { ...zarPage, header });
                          }}
                        />
                      </div>
                    </div>
                  </EditorSection>

                  {/* Jobs view settings */}
                  <EditorSection
                    id="zar-jobs"
                    title={
                      lang === "mn"
                        ? "Ажлын зар тохиргоо"
                        : "Jobs View Settings"
                    }
                    subtitle={
                      lang === "mn"
                        ? "Ажлын зарын таб болон толгой хэсэг"
                        : "Jobs tab label and custom header"
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Ажлын зарын табын нэр"
                            : "Jobs Tab Label"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.jobsTabLabel ?? ""}
                          placeholder="Ажлын зар"
                          onChange={(e) => {
                            const next = {
                              ...zarPage,
                              jobsTabLabel: e.target.value,
                            };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Ажлын зарын дээд шошго (eyebrow)"
                            : "Jobs Eyebrow"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.jobsHeader?.eyebrow ?? ""}
                          onChange={(e) => {
                            const jobsHeader = {
                              ...(zarPage.jobsHeader ?? {
                                eyebrow: "",
                                title: "",
                                intro: "",
                              }),
                              eyebrow: e.target.value,
                            };
                            const next = { ...zarPage, jobsHeader };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn" ? "Ажлын зарын гарчиг" : "Jobs Title"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.jobsHeader?.title ?? ""}
                          onChange={(e) => {
                            const jobsHeader = {
                              ...(zarPage.jobsHeader ?? {
                                eyebrow: "",
                                title: "",
                                intro: "",
                              }),
                              title: e.target.value,
                            };
                            const next = { ...zarPage, jobsHeader };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Ажлын зарын танилцуулга"
                            : "Jobs Introduction"}
                        </label>
                        <textarea
                          className={scTextarea("min-h-[100px]")}
                          value={zarPage.jobsHeader?.intro ?? ""}
                          onChange={(e) => {
                            const jobsHeader = {
                              ...(zarPage.jobsHeader ?? {
                                eyebrow: "",
                                title: "",
                                intro: "",
                              }),
                              intro: e.target.value,
                            };
                            const next = { ...zarPage, jobsHeader };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                    </div>
                  </EditorSection>

                  {/* Sales view settings */}
                  <EditorSection
                    id="zar-sales"
                    title={
                      lang === "mn"
                        ? "Борлуулалтын зар тохиргоо"
                        : "Sales View Settings"
                    }
                    subtitle={
                      lang === "mn"
                        ? "Борлуулалтын зарын таб болон толгой хэсэг"
                        : "Sales tab label and custom header"
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Борлуулалтын зарын табын нэр"
                            : "Sales Tab Label"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.salesTabLabel ?? ""}
                          placeholder="Борлуулалтын зар"
                          onChange={(e) => {
                            const next = {
                              ...zarPage,
                              salesTabLabel: e.target.value,
                            };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Борлуулалтын зарын дээд шошго (eyebrow)"
                            : "Sales Eyebrow"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.salesHeader?.eyebrow ?? ""}
                          onChange={(e) => {
                            const salesHeader = {
                              ...(zarPage.salesHeader ?? {
                                eyebrow: "",
                                title: "",
                                intro: "",
                              }),
                              eyebrow: e.target.value,
                            };
                            const next = { ...zarPage, salesHeader };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Борлуулалтын зарын гарчиг"
                            : "Sales Title"}
                        </label>
                        <input
                          className={scInput}
                          value={zarPage.salesHeader?.title ?? ""}
                          onChange={(e) => {
                            const salesHeader = {
                              ...(zarPage.salesHeader ?? {
                                eyebrow: "",
                                title: "",
                                intro: "",
                              }),
                              title: e.target.value,
                            };
                            const next = { ...zarPage, salesHeader };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {lang === "mn"
                            ? "Борлуулалтын зарын танилцуулга"
                            : "Sales Introduction"}
                        </label>
                        <textarea
                          className={scTextarea("min-h-[100px]")}
                          value={zarPage.salesHeader?.intro ?? ""}
                          onChange={(e) => {
                            const salesHeader = {
                              ...(zarPage.salesHeader ?? {
                                eyebrow: "",
                                title: "",
                                intro: "",
                              }),
                              intro: e.target.value,
                            };
                            const next = { ...zarPage, salesHeader };
                            setZarPage(next);
                            debouncedSave("zar-page", next);
                          }}
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("zar-page")}
                  >
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          lang === "mn" ? "Зар" : "Zar",
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "about" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "about-fields",
                      label: t.siteContent.about.sections.fields,
                    },
                    {
                      id: "about-copy",
                      label: t.siteContent.about.sections.copy,
                    },
                    {
                      id: "about-stats",
                      label: t.siteContent.about.sections.stats,
                    },
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
                          [
                            "sectionLabel",
                            t.siteContent.about.fields.sectionLabel,
                          ],
                          ["h2Line1", t.siteContent.about.fields.h2Line1],
                          ["h2Accent", t.siteContent.about.fields.h2Accent],
                          [
                            "imageBuildingName",
                            t.siteContent.about.fields.imageBuildingName,
                          ],
                          [
                            "imageBuildingSubtitle",
                            t.siteContent.about.fields.imageBuildingSubtitle,
                          ],
                          [
                            "yearsBadgeValue",
                            t.siteContent.about.fields.yearsBadgeValue,
                          ],
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

                  <EditorSection
                    id="about-copy"
                    title={t.siteContent.about.sections.copy}
                  >
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
                        <div
                          key={i}
                          className="rounded-xl border border-slate-200/90 bg-white/80 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-900/40"
                        >
                          <div className="flex flex-wrap gap-2">
                            <input
                              className={`${scInput} max-w-[140px]`}
                              placeholder="Гарчиг"
                              value={row.value}
                              onChange={(e) => {
                                const stats = [...about.main.stats];
                                stats[i] = {
                                  ...stats[i],
                                  value: e.target.value,
                                };
                                setAbout({
                                  ...about,
                                  main: { ...about.main, stats },
                                });
                              }}
                            />
                            <input
                              className={`${scInput} min-w-[140px] flex-1`}
                              placeholder="Тайлбар"
                              value={row.label}
                              onChange={(e) => {
                                const stats = [...about.main.stats];
                                stats[i] = {
                                  ...stats[i],
                                  label: e.target.value,
                                };
                                setAbout({
                                  ...about,
                                  main: { ...about.main, stats },
                                });
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-900"
                                value={row.color || "#3b82f6"}
                                onChange={(e) => {
                                  const stats = [...about.main.stats];
                                  stats[i] = {
                                    ...stats[i],
                                    color: e.target.value,
                                  };
                                  setAbout({
                                    ...about,
                                    main: { ...about.main, stats },
                                  });
                                }}
                              />
                              <input
                                className={`${scInput} w-[100px]`}
                                placeholder="#3b82f6"
                                value={row.color || ""}
                                onChange={(e) => {
                                  const stats = [...about.main.stats];
                                  stats[i] = {
                                    ...stats[i],
                                    color: e.target.value,
                                  };
                                  setAbout({
                                    ...about,
                                    main: { ...about.main, stats },
                                  });
                                }}
                              />
                            </div>
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
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Дүрс зураг (Icon)
                            </label>
                            <ImageUploadField
                              value={row.icon || ""}
                              previewFit="contain"
                              accept="image/*"
                              onChange={(next) => {
                                const stats = [...about.main.stats];
                                stats[i] = { ...stats[i], icon: next };
                                setAbout({
                                  ...about,
                                  main: { ...about.main, stats },
                                });
                              }}
                            />
                          </div>
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
                                {
                                  value: "",
                                  label: "",
                                  icon: "",
                                  color: "#3b82f6",
                                },
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
                        <div
                          key={i}
                          className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                        >
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <label className="text-xs text-zinc-500">
                                Нэр
                              </label>
                              <input
                                className={scInput}
                                value={row.name}
                                onChange={(e) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = {
                                    ...partners[i],
                                    name: e.target.value,
                                  };
                                  setAbout({
                                    ...about,
                                    main: { ...about.main, partners },
                                  });
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
                                  setAbout({
                                    ...about,
                                    main: { ...about.main, partners },
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">
                                Өргөн
                              </label>
                              <input
                                type="number"
                                className={scInput}
                                value={row.width}
                                onChange={(e) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = {
                                    ...partners[i],
                                    width: Number(e.target.value) || 0,
                                  };
                                  setAbout({
                                    ...about,
                                    main: { ...about.main, partners },
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">
                                Өндөр
                              </label>
                              <input
                                type="number"
                                className={scInput}
                                value={row.height}
                                onChange={(e) => {
                                  const partners = [...about.main.partners];
                                  partners[i] = {
                                    ...partners[i],
                                    height: Number(e.target.value) || 0,
                                  };
                                  setAbout({
                                    ...about,
                                    main: { ...about.main, partners },
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <DangerMini
                              onClick={() => {
                                const partners = about.main.partners.filter(
                                  (_, j) => j !== i,
                                );
                                setAbout({
                                  ...about,
                                  main: { ...about.main, partners },
                                });
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
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.about.label,
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "services" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "svc-header",
                      label: t.siteContent.services.sections.header,
                    },
                    {
                      id: "svc-features",
                      label: t.siteContent.services.sections.features,
                    },
                    {
                      id: "svc-banner",
                      label: t.siteContent.services.sections.banner,
                    },
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
                              features[i] = {
                                ...features[i],
                                title: e.target.value,
                              };
                              setServices({ ...services, features });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[72px]")}
                            placeholder={t.siteContent.common.description}
                            value={f.desc}
                            onChange={(e) => {
                              const features = [...services.features];
                              features[i] = {
                                ...features[i],
                                desc: e.target.value,
                              };
                              setServices({ ...services, features });
                            }}
                          />
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Зураг (JPEG, PNG, WebP)
                            </label>
                            <ImageUploadField
                              value={f.image ?? ""}
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
                                  const m = c.match(
                                    /rgb\((\d+),\s*(\d+),\s*(\d+)\)/,
                                  );
                                  if (m) {
                                    const hex = (n: number) =>
                                      n.toString(16).padStart(2, "0");
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
                                  features[i] = {
                                    ...features[i],
                                    accent: `rgb(${r}, ${g}, ${b})`,
                                  };
                                  setServices({ ...services, features });
                                }}
                              />
                              <input
                                className={`${scInput} flex-1`}
                                placeholder="rgb(99, 102, 241)"
                                value={f.accent ?? ""}
                                onChange={(e) => {
                                  const features = [...services.features];
                                  features[i] = {
                                    ...features[i],
                                    accent: e.target.value,
                                  };
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
                                  features: services.features.filter(
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
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.services.label,
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "contact" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "contact-hero",
                      label: t.siteContent.contact.sections.hero,
                    },
                    {
                      id: "contact-items",
                      label: t.siteContent.contact.sections.items,
                    },
                    {
                      id: "contact-agent",
                      label: t.siteContent.contact.sections.agent,
                    },
                    {
                      id: "contact-form",
                      label: t.siteContent.contact.sections.form,
                    },
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
                  <EditorSection
                    id="contact-form"
                    title={t.siteContent.contact.fields.formTitle}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-zinc-500">
                          {t.siteContent.common.title}
                        </label>
                        <input
                          className={scInput}
                          value={contact.formTitle}
                          onChange={(e) =>
                            setContact({
                              ...contact,
                              formTitle: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {(["name", "email", "message"] as const).map((key) => (
                          <div key={key}>
                            <label className="text-xs text-zinc-500 uppercase tracking-wide">
                              {key === "name"
                                ? "Name Label"
                                : key === "email"
                                  ? "Email Label"
                                  : "Message Label"}
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
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.contact.label,
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "properties-page" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "properties-header",
                      label: t.siteContent.propertiesPage.sections.header,
                    },
                    {
                      id: "properties-categories",
                      label: t.siteContent.propertiesPage.sections.categories,
                    },
                    {
                      id: "properties-items",
                      label: t.siteContent.propertiesPage.sections.items,
                    },
                    {
                      id: "properties-cta",
                      label: t.siteContent.propertiesPage.sections.cta,
                    },
                    {
                      id: "properties-footer",
                      label: "Доод текст",
                    },
                  ]}
                >
                  <EditorSection
                    id="properties-header"
                    title={t.siteContent.propertiesPage.fields.headerTitle}
                    subtitle={
                      t.siteContent.propertiesPage.fields.headerSubtitle
                    }
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
                    subtitle={
                      t.siteContent.propertiesPage.fields.categoriesHint
                    }
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
                            <div className="sm:col-span-2">
                              <label className="text-xs text-zinc-500">
                                Товч тайлбар (bio)
                              </label>
                              <input
                                className={scInput}
                                placeholder="e.g. Next.js · TypeScript · Tailwind"
                                value={item.bio ?? ""}
                                onChange={(e) => {
                                  const items = [...propertiesPage.items];
                                  items[i] = {
                                    ...items[i],
                                    bio: e.target.value,
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
                  <EditorSection
                    id="properties-cta"
                    title={t.siteContent.propertiesPage.sections.cta}
                  >
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
                  <EditorSection
                    id="properties-footer"
                    title="Доод текст"
                    subtitle="Төслүүд хуудасны доод хэсэгт харагдах текст"
                    defaultOpen={false}
                  >
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Текст
                        </label>
                        <textarea
                          className={scTextarea("min-h-[120px]")}
                          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
                          value={propertiesPage.footerText || ""}
                          onChange={(e) =>
                            setPropertiesPage({
                              ...propertiesPage,
                              footerText: e.target.value,
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
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.propertiesPage.label,
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "parkease" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "pke-visibility",
                      label: t.siteContent.visibility.title,
                    },
                    { id: "pke-hero", label: "Hero хэсэг" },
                    { id: "pke-how", label: "Хэрхэн ажилладаг" },
                    { id: "pke-payments", label: "Төлбөр" },
                    { id: "pke-features", label: "Онцлогууд" },
                    { id: "pke-pricing", label: "Үнэ тариф" },
                    { id: "pke-free", label: "Үнэгүй жолооч" },
                    { id: "pke-cta", label: "Дуудлага" },
                  ]}
                >
                  <EditorSection
                    id="pke-visibility"
                    title={t.siteContent.visibility.title}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideDescription}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {t.siteContent.common.editingPage}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={parkEase.hideDescription}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hideDescription: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideAppLinks}
                          </h4>
                          <p className="text-xs text-slate-500">
                            App Store & Play Store
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={parkEase.hideAppLinks}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hideAppLinks: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <EditorSection
                    id="pke-hero"
                    title="Hero хэсэг"
                    subtitle="Нүүр хуудсын том зураг дээрх агуулга"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Eyebrow — гарчгийн дээрх жижиг текст
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Автомат зогсоол"
                          value={parkEase.hero.eyebrow}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: {
                                ...parkEase.hero,
                                eyebrow: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг — том үсгээр харагдах нэр
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: ParkEase"
                          value={parkEase.hero.title1}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: {
                                ...parkEase.hero,
                                title1: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Үндсэн товч — шар өнгийн томоохон товч
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Холбоо барих"
                          value={parkEase.hero.cta1}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: { ...parkEase.hero, cta1: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хоёрдогч товч — цагаан хүрээтэй товч
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Хэрхэн ажилладаг вэ?"
                          value={parkEase.hero.cta2}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: { ...parkEase.hero, cta2: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хоёрдогч товчны холбоос — шинэ таб нээгдэнэ (хоосон
                          бол доош гүйлгэнэ)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://parkease.mn"
                          value={parkEase.hero.cta2Link || ""}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: {
                                ...parkEase.hero,
                                cta2Link: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар — гарчгийн доорх дэлгэрэнгүй текст
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={parkEase.hero.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: { ...parkEase.hero, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Hero зураг
                        </label>
                        <ImageUploadField
                          value={parkEase.hero.image || ""}
                          onChange={(next) =>
                            setParkEase({
                              ...parkEase,
                              hero: { ...parkEase.hero, image: next },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Танилцуулга видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={parkEase.hero.videoUrl || ""}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              hero: {
                                ...parkEase.hero,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Multiple videos list */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Олон видео (9:16 хэлбэр)
                        </label>
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          onClick={() =>
                            setParkEase({
                              ...parkEase,
                              hero: {
                                ...parkEase.hero,
                                videos: [...(parkEase.hero.videos || []), { url: "", bio: "" }],
                              },
                            })
                          }
                        >
                          + Видео нэмэх
                        </button>
                      </div>
                      {(parkEase.hero.videos || []).map((v, i) => (
                        <div key={i} className="rounded-xl border border-zinc-700 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400 font-medium">Видео {i + 1}</span>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-red-400 transition"
                              onClick={() =>
                                setParkEase({
                                  ...parkEase,
                                  hero: {
                                    ...parkEase.hero,
                                    videos: (parkEase.hero.videos || []).filter((_, j) => j !== i),
                                  },
                                })
                              }
                            >
                              Устгах
                            </button>
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              URL
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: https://youtube.com/watch?v=..."
                              value={v.url}
                              onChange={(e) => {
                                const videos = [...(parkEase.hero.videos || [])];
                                videos[i] = { ...videos[i], url: e.target.value };
                                setParkEase({ ...parkEase, hero: { ...parkEase.hero, videos } });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Тайлбар (bio)
                            </label>
                            <textarea
                              className={scTextarea("min-h-[60px]")}
                              placeholder="Видеоны товч тайлбар..."
                              value={v.bio || ""}
                              onChange={(e) => {
                                const videos = [...(parkEase.hero.videos || [])];
                                videos[i] = { ...videos[i], bio: e.target.value };
                                setParkEase({ ...parkEase, hero: { ...parkEase.hero, videos } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Эргэлдэх үгс — гарчгийн доор ээлжлэн харагдах үгс
                      </label>
                      <p className="text-[11px] text-zinc-400 -mt-1">
                        жш: 24/7. · Ажилтангүй. · Бүх Банк. — хэд ч болно
                      </p>
                      {parkEase.hero.words.map((word, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className={`${scInput} flex-1`}
                            placeholder={`${i + 1}-р үг`}
                            value={word}
                            onChange={(e) => {
                              const words = [...parkEase.hero.words];
                              words[i] = e.target.value;
                              setParkEase({
                                ...parkEase,
                                hero: { ...parkEase.hero, words },
                              });
                            }}
                          />
                          <DangerMini
                            onClick={() =>
                              setParkEase({
                                ...parkEase,
                                hero: {
                                  ...parkEase.hero,
                                  words: parkEase.hero.words.filter(
                                    (_, j) => j !== i,
                                  ),
                                },
                              })
                            }
                          >
                            Устгах
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            hero: {
                              ...parkEase.hero,
                              words: [...parkEase.hero.words, ""],
                            },
                          })
                        }
                      >
                        + Үг нэмэх
                      </GhostButton>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Статистик — хуудсын доод хэсэгт харагдах тоон мэдээлэл
                      </label>
                      {parkEase.hero.stats.map((stat, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className={`${scInput} w-[30%]`}
                            placeholder="Тоо (жш: 200+)"
                            value={stat.value}
                            onChange={(e) => {
                              const stats = [...parkEase.hero.stats];
                              stats[i] = { ...stats[i], value: e.target.value };
                              setParkEase({
                                ...parkEase,
                                hero: { ...parkEase.hero, stats },
                              });
                            }}
                          />
                          <input
                            className={`${scInput} w-[70%]`}
                            placeholder="Тайлбар (жш: Зогсоол)"
                            value={stat.label}
                            onChange={(e) => {
                              const stats = [...parkEase.hero.stats];
                              stats[i] = { ...stats[i], label: e.target.value };
                              setParkEase({
                                ...parkEase,
                                hero: { ...parkEase.hero, stats },
                              });
                            }}
                          />
                          <DangerMini
                            onClick={() =>
                              setParkEase({
                                ...parkEase,
                                hero: {
                                  ...parkEase.hero,
                                  stats: parkEase.hero.stats.filter(
                                    (_, j) => j !== i,
                                  ),
                                },
                              })
                            }
                          >
                            Устгах
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            hero: {
                              ...parkEase.hero,
                              stats: [
                                ...parkEase.hero.stats,
                                { value: "", label: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Статистик нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-how"
                    title="Хэрхэн ажилладаг"
                    subtitle="3 алхамт процессын тайлбар хэсэг"
                  >
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн шошго (label)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.how.label}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              how: { ...parkEase.how, label: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.how.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              how: { ...parkEase.how, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг 1-р мөр
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.how.title[0] ?? ""}
                          onChange={(e) => {
                            const title = [...parkEase.how.title];
                            title[0] = e.target.value;
                            setParkEase({
                              ...parkEase,
                              how: { ...parkEase.how, title },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг 2-р мөр
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.how.title[1] ?? ""}
                          onChange={(e) => {
                            const title = [...parkEase.how.title];
                            title[1] = e.target.value;
                            setParkEase({
                              ...parkEase,
                              how: { ...parkEase.how, title },
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Алхамууд
                      </label>
                      {parkEase.how.steps.map((step, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-2"
                        >
                          <div className="flex gap-3">
                            <input
                              className={`${scInput} flex-1`}
                              placeholder={`${i + 1}-р алхамын гарчиг`}
                              value={step.title}
                              onChange={(e) => {
                                const steps = [...parkEase.how.steps];
                                steps[i] = {
                                  ...steps[i],
                                  title: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  how: { ...parkEase.how, steps },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() =>
                                setParkEase({
                                  ...parkEase,
                                  how: {
                                    ...parkEase.how,
                                    steps: parkEase.how.steps.filter(
                                      (_, j) => j !== i,
                                    ),
                                  },
                                })
                              }
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={step.desc}
                            onChange={(e) => {
                              const steps = [...parkEase.how.steps];
                              steps[i] = { ...steps[i], desc: e.target.value };
                              setParkEase({
                                ...parkEase,
                                how: { ...parkEase.how, steps },
                              });
                            }}
                          />
                          <ImageUploadField
                            value={step.icon || ""}
                            accept="image/*"
                            onChange={(url) => {
                              const steps = [...parkEase.how.steps];
                              steps[i] = { ...steps[i], icon: url };
                              setParkEase({
                                ...parkEase,
                                how: { ...parkEase.how, steps },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            how: {
                              ...parkEase.how,
                              steps: [
                                ...parkEase.how.steps,
                                { title: "", desc: "", icon: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Алхам нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-payments"
                    title="Төлбөр"
                    subtitle="QPay, Sticker QR картууд болон банкны лого жагсаалт"
                  >
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн шошго (label)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.label}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг 1-р мөр
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.title[0] ?? ""}
                          onChange={(e) => {
                            const title = [...parkEase.payments.title];
                            title[0] = e.target.value;
                            setParkEase({
                              ...parkEase,
                              payments: { ...parkEase.payments, title },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг 2-р мөр
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.title[1] ?? ""}
                          onChange={(e) => {
                            const title = [...parkEase.payments.title];
                            title[1] = e.target.value;
                            setParkEase({
                              ...parkEase,
                              payments: { ...parkEase.payments, title },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          QPay гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.qpayTitle}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                qpayTitle: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          QPay шошго (badge)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.qpayBadge}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                qpayBadge: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          QPay тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={parkEase.payments.qpayDesc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                qpayDesc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Стикер QR гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.stickerTitle}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                stickerTitle: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Стикер QR шошго (badge)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.stickerBadge}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                stickerBadge: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Стикер QR тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={parkEase.payments.stickerDesc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                stickerDesc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тэмдэглэл (доод хэсэгт)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.payments.note}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              payments: {
                                ...parkEase.payments,
                                note: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-3 mt-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Банкнуудын лого
                      </label>
                      {parkEase.payments.banks.map((bank, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-2"
                        >
                          <div className="flex gap-2">
                            <input
                              className={`${scInput} flex-1`}
                              placeholder="Банкны нэр (жш: Khan Bank)"
                              value={bank.name}
                              onChange={(e) => {
                                const banks = [...parkEase.payments.banks];
                                banks[i] = {
                                  ...banks[i],
                                  name: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  payments: { ...parkEase.payments, banks },
                                });
                              }}
                            />
                            <input
                              className={`${scInput} flex-1`}
                              placeholder="Дэд нэр (жш: Хаан Банк)"
                              value={bank.sub}
                              onChange={(e) => {
                                const banks = [...parkEase.payments.banks];
                                banks[i] = { ...banks[i], sub: e.target.value };
                                setParkEase({
                                  ...parkEase,
                                  payments: { ...parkEase.payments, banks },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() =>
                                setParkEase({
                                  ...parkEase,
                                  payments: {
                                    ...parkEase.payments,
                                    banks: parkEase.payments.banks.filter(
                                      (_, j) => j !== i,
                                    ),
                                  },
                                })
                              }
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <ImageUploadField
                            value={bank.image ?? ""}
                            previewFit="contain"
                            onChange={(next) => {
                              const banks = [...parkEase.payments.banks];
                              banks[i] = { ...banks[i], image: next };
                              setParkEase({
                                ...parkEase,
                                payments: { ...parkEase.payments, banks },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            payments: {
                              ...parkEase.payments,
                              banks: [
                                ...parkEase.payments.banks,
                                { name: "", sub: "", image: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Банк нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-features"
                    title="Онцлогууд"
                    subtitle="Системийн давуу талуудын карт жагсаалт"
                  >
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго (label)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.features.label}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              features: {
                                ...parkEase.features,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.features.title}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              features: {
                                ...parkEase.features,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={parkEase.features.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              features: {
                                ...parkEase.features,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {parkEase.features.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Гарчиг"
                              value={item.title}
                              onChange={(e) => {
                                const items = [...parkEase.features.items];
                                items[i] = {
                                  ...items[i],
                                  title: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  features: { ...parkEase.features, items },
                                });
                              }}
                            />
                            <select
                              className={scInput}
                              value={item.size || "medium"}
                              onChange={(e) => {
                                const items = [...parkEase.features.items];
                                items[i] = {
                                  ...items[i],
                                  size: e.target.value as
                                    | "small"
                                    | "medium"
                                    | "large",
                                };
                                setParkEase({
                                  ...parkEase,
                                  features: { ...parkEase.features, items },
                                });
                              }}
                            >
                              <option value="small">Жижиг</option>
                              <option value="medium">Дунд</option>
                              <option value="large">Том</option>
                            </select>
                            <DangerMini
                              onClick={() => {
                                const items = parkEase.features.items.filter(
                                  (_, j) => j !== i,
                                );
                                setParkEase({
                                  ...parkEase,
                                  features: { ...parkEase.features, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Дүрс зураг (Icon)
                            </p>
                            <ImageUploadField
                              value={item.icon || ""}
                              previewFit="contain"
                              onChange={(next) => {
                                const items = [...parkEase.features.items];
                                items[i] = { ...items[i], icon: next };
                                setParkEase({
                                  ...parkEase,
                                  features: { ...parkEase.features, items },
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Background зураг
                            </p>
                            <ImageUploadField
                              value={item.image || ""}
                              onChange={(next) => {
                                const items = [...parkEase.features.items];
                                items[i] = { ...items[i], image: next };
                                setParkEase({
                                  ...parkEase,
                                  features: { ...parkEase.features, items },
                                });
                              }}
                            />
                          </div>
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...parkEase.features.items];
                              items[i] = { ...items[i], desc: e.target.value };
                              setParkEase({
                                ...parkEase,
                                features: { ...parkEase.features, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            features: {
                              ...parkEase.features,
                              items: [
                                ...parkEase.features.items,
                                {
                                  title: "",
                                  desc: "",
                                  size: "medium",
                                  image: "",
                                  icon: "",
                                },
                              ],
                            },
                          })
                        }
                      >
                        + Онцлог нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-bolomjuud"
                    title="Инновац (мөрлөг хэсэг)"
                    subtitle="Зураг + текст ээлжилсэн мөрүүд — агуулга байхгүй бол хэрэглэгчид харагдахгүй"
                  >
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго (label)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Innovation"
                          value={parkEase.bolomjuud.label}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              bolomjuud: {
                                ...parkEase.bolomjuud,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.bolomjuud.title}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              bolomjuud: {
                                ...parkEase.bolomjuud,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={parkEase.bolomjuud.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              bolomjuud: {
                                ...parkEase.bolomjuud,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {parkEase.bolomjuud.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-2">
                            <input
                              className={scInput}
                              placeholder="Гарчиг"
                              value={item.title}
                              onChange={(e) => {
                                const items = [...parkEase.bolomjuud.items];
                                items[i] = {
                                  ...items[i],
                                  title: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  bolomjuud: { ...parkEase.bolomjuud, items },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() => {
                                const items = parkEase.bolomjuud.items.filter(
                                  (_, j) => j !== i,
                                );
                                setParkEase({
                                  ...parkEase,
                                  bolomjuud: { ...parkEase.bolomjuud, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...parkEase.bolomjuud.items];
                              items[i] = { ...items[i], desc: e.target.value };
                              setParkEase({
                                ...parkEase,
                                bolomjuud: { ...parkEase.bolomjuud, items },
                              });
                            }}
                          />
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={(next) => {
                              const items = [...parkEase.bolomjuud.items];
                              items[i] = { ...items[i], image: next };
                              setParkEase({
                                ...parkEase,
                                bolomjuud: { ...parkEase.bolomjuud, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            bolomjuud: {
                              ...parkEase.bolomjuud,
                              items: [
                                ...parkEase.bolomjuud.items,
                                { title: "", desc: "", image: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Мөр нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-pricing"
                    title="Үнэ тариф"
                    subtitle="Үнийн багцууд болон товчны текст"
                  >
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго (label)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.pricing.label}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.pricing.title}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.pricing.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хамгийн алдартай шошго
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Хамгийн алдартай"
                          value={parkEase.pricing.mostPopular}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                mostPopular: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Товч текст
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Эхлэх →"
                          value={parkEase.pricing.ctaBtn}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                ctaBtn: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тэмдэглэл (доод хэсэгт)
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.pricing.note}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                note: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Үнийн санал товч
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Үнийн санал авах →"
                          value={parkEase.pricing.quoteBtn}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                quoteBtn: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Үнийн санал товчны холбоос
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: #kholbooBarikh эсвэл /quote"
                          value={parkEase.pricing.quoteLink || ""}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              pricing: {
                                ...parkEase.pricing,
                                quoteLink: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {parkEase.pricing.tiers.map((tier, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-3">
                            <input
                              className={scInput}
                              placeholder="Багцын нэр"
                              value={tier.name}
                              onChange={(e) => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  name: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  pricing: { ...parkEase.pricing, tiers },
                                });
                              }}
                            />
                            <input
                              className={scInput}
                              placeholder="Зогсоол (жш: 30 хүртэл)"
                              value={tier.slots}
                              onChange={(e) => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  slots: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  pricing: { ...parkEase.pricing, tiers },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() =>
                                setParkEase({
                                  ...parkEase,
                                  pricing: {
                                    ...parkEase.pricing,
                                    tiers: parkEase.pricing.tiers.filter(
                                      (_, j) => j !== i,
                                    ),
                                  },
                                })
                              }
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-zinc-500">
                              Боломжуудын жагсаалт (мөр бүр нэг боломж)
                            </label>
                            <textarea
                              className={scTextarea("min-h-[80px]")}
                              value={tier.features.join("\n")}
                              onChange={(e) => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  features: e.target.value.split("\n"),
                                };
                                setParkEase({
                                  ...parkEase,
                                  pricing: { ...parkEase.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!tier.hideButton}
                              onChange={(e) => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  hideButton: e.target.checked,
                                };
                                setParkEase({
                                  ...parkEase,
                                  pricing: { ...parkEase.pricing, tiers },
                                });
                              }}
                            />
                            Товч нуух
                          </label>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны текст
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: Эхлэх →"
                              value={tier.buttonLabel || ""}
                              onChange={(e) => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonLabel: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  pricing: { ...parkEase.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны холбоос (URL)
                            </label>
                            <input
                              className={scInput}
                              placeholder="https://..."
                              value={tier.buttonUrl || ""}
                              onChange={(e) => {
                                const tiers = [...parkEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonUrl: e.target.value,
                                };
                                setParkEase({
                                  ...parkEase,
                                  pricing: { ...parkEase.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-950">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Хөнгөлөлт
                            </label>
                            <div className="space-y-2">
                              {(tier.discounts || []).map(
                                (disc: any, k: number) => (
                                  <div
                                    key={k}
                                    className="flex gap-2 items-center"
                                  >
                                    <input
                                      className={`${scInput} text-xs py-1.5`}
                                      placeholder="6 mth /5% OFF"
                                      value={disc.label}
                                      onChange={(e) => {
                                        const tiers = [
                                          ...parkEase.pricing.tiers,
                                        ];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          label: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setParkEase({
                                          ...parkEase,
                                          pricing: {
                                            ...parkEase.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                    />
                                    <input
                                      className={`${scInput} text-xs py-1.5 max-w-[120px]`}
                                      placeholder="Өнгө (Сонголттой, жш: #7c3aed)"
                                      value={disc.color || ""}
                                      onChange={(e) => {
                                        const tiers = [
                                          ...parkEase.pricing.tiers,
                                        ];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          color: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setParkEase({
                                          ...parkEase,
                                          pricing: {
                                            ...parkEase.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                    />
                                    <input
                                      type="color"
                                      title="Дэвсгэр өнгө"
                                      value={
                                        disc.color
                                          ? disc.color.startsWith("#")
                                            ? disc.color
                                            : "#" + disc.color
                                          : "#7c3aed"
                                      }
                                      onChange={(e) => {
                                        const tiers = [
                                          ...parkEase.pricing.tiers,
                                        ];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          color: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setParkEase({
                                          ...parkEase,
                                          pricing: {
                                            ...parkEase.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                      className="w-10 h-9 rounded cursor-pointer border border-slate-200 p-0.5 bg-white shrink-0"
                                    />
                                    <DangerMini
                                      onClick={() => {
                                        const tiers = [
                                          ...parkEase.pricing.tiers,
                                        ];
                                        const discounts = (
                                          tiers[i].discounts || []
                                        ).filter((_, l) => l !== k);
                                        tiers[i] = { ...tiers[i], discounts };
                                        setParkEase({
                                          ...parkEase,
                                          pricing: {
                                            ...parkEase.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                    >
                                      ✕
                                    </DangerMini>
                                  </div>
                                ),
                              )}
                              <GhostButton
                                className="text-[10px] py-1"
                                onClick={() => {
                                  const tiers = [...parkEase.pricing.tiers];
                                  const discounts = [
                                    ...(tiers[i].discounts || []),
                                    { label: "", color: "" },
                                  ];
                                  tiers[i] = { ...tiers[i], discounts };
                                  setParkEase({
                                    ...parkEase,
                                    pricing: { ...parkEase.pricing, tiers },
                                  });
                                }}
                              >
                                + Хөнгөлөлт нэмэх
                              </GhostButton>
                            </div>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            pricing: {
                              ...parkEase.pricing,
                              tiers: [
                                ...parkEase.pricing.tiers,
                                { name: "", slots: "", features: [] },
                              ],
                            },
                          })
                        }
                      >
                        + Багц нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-free"
                    title="Үнэгүй жолооч"
                    subtitle="Жолооч үнэгүй зогсоолдох нөхцөлийн карт хэсэг"
                  >
                    <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Нуух
                        </p>
                        <p className="text-xs text-zinc-400">
                          Идэвхжүүлбэл frontend-д харагдахгүй
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            free: {
                              ...parkEase.free,
                              hidden: !parkEase.free.hidden,
                            },
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          parkEase.free.hidden
                            ? "bg-red-500"
                            : "bg-zinc-300 dark:bg-zinc-600"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                            parkEase.free.hidden
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="grid gap-4 mb-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={parkEase.free.title}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              free: { ...parkEase.free, title: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[70px]")}
                          value={parkEase.free.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              free: { ...parkEase.free, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Картууд
                      </label>
                      {parkEase.free.cards.map((card, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className={`${scInput} flex-1`}
                            placeholder="Гарчиг"
                            value={card.label}
                            onChange={(e) => {
                              const cards = [...parkEase.free.cards];
                              cards[i] = { ...cards[i], label: e.target.value };
                              setParkEase({
                                ...parkEase,
                                free: { ...parkEase.free, cards },
                              });
                            }}
                          />
                          <input
                            className={`${scInput} flex-1`}
                            placeholder="Дэд текст"
                            value={card.sub}
                            onChange={(e) => {
                              const cards = [...parkEase.free.cards];
                              cards[i] = { ...cards[i], sub: e.target.value };
                              setParkEase({
                                ...parkEase,
                                free: { ...parkEase.free, cards },
                              });
                            }}
                          />
                          <DangerMini
                            onClick={() =>
                              setParkEase({
                                ...parkEase,
                                free: {
                                  ...parkEase.free,
                                  cards: parkEase.free.cards.filter(
                                    (_, j) => j !== i,
                                  ),
                                },
                              })
                            }
                          >
                            Устгах
                          </DangerMini>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setParkEase({
                            ...parkEase,
                            free: {
                              ...parkEase.free,
                              cards: [
                                ...parkEase.free.cards,
                                { label: "", sub: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Карт нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="pke-cta"
                    title="Дуудлага (CTA)"
                    subtitle="Хуудсын доод хэсэгт харилцагч татах хэсэг"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго — дээрх жижиг badge текст
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Холбоо барих"
                          value={parkEase.cta.btn}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: { ...parkEase.cta, btn: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг — том үсгийн heading
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Санаагаа бодит болгон хувиргацгаая"
                          value={parkEase.cta.title}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: { ...parkEase.cta, title: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар — гарчгийн доорх параграф текст
                        </label>
                        <textarea
                          className={scTextarea("min-h-[70px]")}
                          placeholder="жш: Бид таны санааг бодит болгоход бэлэн байна..."
                          value={parkEase.cta.desc}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: { ...parkEase.cta, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Email товших текст — жижиг шошго
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Email Us"
                          value={parkEase.cta.emailLabel}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: {
                                ...parkEase.cta,
                                emailLabel: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          И-мэйл хаяг
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: contact@zevtabs.mn"
                          type="email"
                          value={parkEase.cta.email}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: { ...parkEase.cta, email: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Утасны шошго
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Утас"
                          value={parkEase.cta.phoneLabel}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: {
                                ...parkEase.cta,
                                phoneLabel: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Утасны дугаар
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: +976 9900 0000"
                          type="tel"
                          value={parkEase.cta.phone}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: { ...parkEase.cta, phone: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Байршлын шошго
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Байршил"
                          value={parkEase.cta.locationLabel}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: {
                                ...parkEase.cta,
                                locationLabel: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Байршил
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: Улаанбаатар, Монгол"
                          value={parkEase.cta.location}
                          onChange={(e) =>
                            setParkEase({
                              ...parkEase,
                              cta: {
                                ...parkEase.cta,
                                location: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("parkease")}
                  >
                    {saving ? t.common.saving : "Хадгалах (ParkEase)"}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "posease" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "pe-visibility",
                      label: t.siteContent.visibility.title,
                    },
                    { id: "pe-hero", label: "Hero хэсэг" },
                    { id: "pe-features", label: "Боломжууд" },
                    { id: "pe-hardware", label: "Төхөөрөмжүүд" },
                    { id: "pe-pricing", label: "Үнэ тариф" },
                  ]}
                >
                  <EditorSection
                    id="pe-visibility"
                    title={t.siteContent.visibility.title}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideDescription}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {t.siteContent.common.editingPage}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={posEase.hideDescription}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hideDescription: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideAppLinks}
                          </h4>
                          <p className="text-xs text-slate-500">
                            App Store & Play Store
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={posEase.hideAppLinks}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hideAppLinks: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <EditorSection id="pe-hero" title="Hero хэсэг">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={posEase.hero.title}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hero: { ...posEase.hero, title: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг (онцлох)
                        </label>
                        <input
                          className={scInput}
                          value={posEase.hero.titleAccent}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hero: {
                                ...posEase.hero,
                                titleAccent: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Үндсэн товч
                        </label>
                        <input
                          className={scInput}
                          value={posEase.hero.cta}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hero: { ...posEase.hero, cta: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Туслах товч
                        </label>
                        <input
                          className={scInput}
                          value={posEase.hero.secondary}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hero: {
                                ...posEase.hero,
                                secondary: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={posEase.hero.desc}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hero: { ...posEase.hero, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Hero Image (PC) (1440x900)
                        </label>
                        <ImageUploadField
                          value={posEase.hero.image || ""}
                          onChange={(next) =>
                            setPosEase({
                              ...posEase,
                              hero: { ...posEase.hero, image: next },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Hero Image (Tablet) (1280x800)
                        </label>
                        <ImageUploadField
                          value={posEase.hero.tabImage || ""}
                          onChange={(next) =>
                            setPosEase({
                              ...posEase,
                              hero: { ...posEase.hero, tabImage: next },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Hero Image (Mobile) (1080x2340)
                        </label>
                        <ImageUploadField
                          value={posEase.hero.mobileImage || ""}
                          onChange={(next) =>
                            setPosEase({
                              ...posEase,
                              hero: { ...posEase.hero, mobileImage: next },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Танилцуулга видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={posEase.hero.videoUrl || ""}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              hero: {
                                ...posEase.hero,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Multiple videos list */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Олон видео (9:16 хэлбэр)
                        </label>
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          onClick={() =>
                            setPosEase({
                              ...posEase,
                              hero: {
                                ...posEase.hero,
                                videos: [...(posEase.hero.videos || []), { url: "", bio: "" }],
                              },
                            })
                          }
                        >
                          + Видео нэмэх
                        </button>
                      </div>
                      {(posEase.hero.videos || []).map((v, i) => (
                        <div key={i} className="rounded-xl border border-zinc-700 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400 font-medium">Видео {i + 1}</span>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-red-400 transition"
                              onClick={() =>
                                setPosEase({
                                  ...posEase,
                                  hero: {
                                    ...posEase.hero,
                                    videos: (posEase.hero.videos || []).filter((_, j) => j !== i),
                                  },
                                })
                              }
                            >
                              Устгах
                            </button>
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              URL
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: https://youtube.com/watch?v=..."
                              value={v.url}
                              onChange={(e) => {
                                const videos = [...(posEase.hero.videos || [])];
                                videos[i] = { ...videos[i], url: e.target.value };
                                setPosEase({ ...posEase, hero: { ...posEase.hero, videos } });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Тайлбар (bio)
                            </label>
                            <textarea
                              className={scTextarea("min-h-[60px]")}
                              placeholder="Видеоны товч тайлбар..."
                              value={v.bio || ""}
                              onChange={(e) => {
                                const videos = [...(posEase.hero.videos || [])];
                                videos[i] = { ...videos[i], bio: e.target.value };
                                setPosEase({ ...posEase, hero: { ...posEase.hero, videos } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection id="pe-features" title="Боломжууд">
                    <div className="grid gap-4 mb-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={posEase.features.title}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              features: {
                                ...posEase.features,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={posEase.features.desc}
                          onChange={(e) =>
                            setPosEase({
                              ...posEase,
                              features: {
                                ...posEase.features,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {posEase.features.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Гарчиг"
                              value={item.title}
                              onChange={(e) => {
                                const items = [...posEase.features.items];
                                items[i].title = e.target.value;
                                setPosEase({
                                  ...posEase,
                                  features: { ...posEase.features, items },
                                });
                              }}
                            />
                            <select
                              className={scInput}
                              value={item.size}
                              onChange={(e) => {
                                const items = [...posEase.features.items];
                                items[i].size = e.target.value as any;
                                setPosEase({
                                  ...posEase,
                                  features: { ...posEase.features, items },
                                });
                              }}
                            >
                              <option value="small">Жижиг</option>
                              <option value="medium">Дунд</option>
                              <option value="large">Том</option>
                            </select>
                            <DangerMini
                              onClick={() => {
                                const items = posEase.features.items.filter(
                                  (_, j) => j !== i,
                                );
                                setPosEase({
                                  ...posEase,
                                  features: { ...posEase.features, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={(next) => {
                              const items = [...posEase.features.items];
                              items[i].image = next;
                              setPosEase({
                                ...posEase,
                                features: { ...posEase.features, items },
                              });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...posEase.features.items];
                              items[i].desc = e.target.value;
                              setPosEase({
                                ...posEase,
                                features: { ...posEase.features, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setPosEase({
                            ...posEase,
                            features: {
                              ...posEase.features,
                              items: [
                                ...posEase.features.items,
                                { title: "", desc: "", size: "small" },
                              ],
                            },
                          })
                        }
                      >
                        + Боломж нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pe-hardware" title="Төхөөрөмжүүд">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Хэсгийн гарчиг
                      </label>
                      <input
                        className={scInput}
                        value={posEase.hardware.title}
                        onChange={(e) =>
                          setPosEase({
                            ...posEase,
                            hardware: {
                              ...posEase.hardware,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      {posEase.hardware.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Нэр"
                              value={item.name}
                              onChange={(e) => {
                                const items = [...posEase.hardware.items];
                                items[i].name = e.target.value;
                                setPosEase({
                                  ...posEase,
                                  hardware: { ...posEase.hardware, items },
                                });
                              }}
                            />
                            <input
                              className={scInput}
                              placeholder="Төрөл (жишээ: Мобайл)"
                              value={item.label}
                              onChange={(e) => {
                                const items = [...posEase.hardware.items];
                                items[i].label = e.target.value;
                                setPosEase({
                                  ...posEase,
                                  hardware: { ...posEase.hardware, items },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() => {
                                const items = posEase.hardware.items.filter(
                                  (_, j) => j !== i,
                                );
                                setPosEase({
                                  ...posEase,
                                  hardware: { ...posEase.hardware, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={(next) => {
                              const items = [...posEase.hardware.items];
                              items[i].image = next;
                              setPosEase({
                                ...posEase,
                                hardware: { ...posEase.hardware, items },
                              });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...posEase.hardware.items];
                              items[i].desc = e.target.value;
                              setPosEase({
                                ...posEase,
                                hardware: { ...posEase.hardware, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setPosEase({
                            ...posEase,
                            hardware: {
                              ...posEase.hardware,
                              items: [
                                ...posEase.hardware.items,
                                { name: "", desc: "", label: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Төхөөрөмж нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="pe-pricing" title="Үнэ тариф">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Хэсгийн гарчиг
                      </label>
                      <input
                        className={scInput}
                        value={posEase.pricing.title}
                        onChange={(e) =>
                          setPosEase({
                            ...posEase,
                            pricing: {
                              ...posEase.pricing,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      {posEase.pricing.tiers.map((tier, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Багцын нэр"
                              value={tier.name}
                              onChange={(e) => {
                                const tiers = [...posEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  name: e.target.value,
                                };
                                setPosEase({
                                  ...posEase,
                                  pricing: { ...posEase.pricing, tiers },
                                });
                              }}
                            />
                            <input
                              className={scInput}
                              placeholder="Үнэ"
                              value={tier.price}
                              onChange={(e) => {
                                const tiers = [...posEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  price: e.target.value,
                                };
                                setPosEase({
                                  ...posEase,
                                  pricing: { ...posEase.pricing, tiers },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() => {
                                const tiers = posEase.pricing.tiers.filter(
                                  (_, j) => j !== i,
                                );
                                setPosEase({
                                  ...posEase,
                                  pricing: { ...posEase.pricing, tiers },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={tier.desc}
                            onChange={(e) => {
                              const tiers = [...posEase.pricing.tiers];
                              tiers[i] = { ...tiers[i], desc: e.target.value };
                              setPosEase({
                                ...posEase,
                                pricing: { ...posEase.pricing, tiers },
                              });
                            }}
                          />
                          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!tier.hideButton}
                              onChange={(e) => {
                                const tiers = [...posEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  hideButton: e.target.checked,
                                };
                                setPosEase({
                                  ...posEase,
                                  pricing: { ...posEase.pricing, tiers },
                                });
                              }}
                            />
                            Товч нуух
                          </label>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны текст
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: Эхлэх →"
                              value={tier.buttonLabel || ""}
                              onChange={(e) => {
                                const tiers = [...posEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonLabel: e.target.value,
                                };
                                setPosEase({
                                  ...posEase,
                                  pricing: { ...posEase.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны холбоос (URL)
                            </label>
                            <input
                              className={scInput}
                              placeholder="https://..."
                              value={tier.buttonUrl || ""}
                              onChange={(e) => {
                                const tiers = [...posEase.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonUrl: e.target.value,
                                };
                                setPosEase({
                                  ...posEase,
                                  pricing: { ...posEase.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                              Хөнгөлөлт
                            </p>
                            <div className="space-y-2">
                              {(tier.discounts || []).map((disc, di) => (
                                <div
                                  key={di}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    className={scInput}
                                    placeholder="6 mth /5% OFF"
                                    value={disc.label}
                                    onChange={(e) => {
                                      const tiers = [...posEase.pricing.tiers];
                                      const discounts = [
                                        ...(tiers[i].discounts || []),
                                      ];
                                      discounts[di] = {
                                        ...discounts[di],
                                        label: e.target.value,
                                      };
                                      tiers[i] = { ...tiers[i], discounts };
                                      setPosEase({
                                        ...posEase,
                                        pricing: { ...posEase.pricing, tiers },
                                      });
                                    }}
                                  />
                                  <input
                                    className={`${scInput} text-xs py-1.5 max-w-[120px]`}
                                    placeholder="Өнгө (Сонголттой, жш: #e11d48)"
                                    value={disc.color || ""}
                                    onChange={(e) => {
                                      const tiers = [...posEase.pricing.tiers];
                                      const discounts = [
                                        ...(tiers[i].discounts || []),
                                      ];
                                      discounts[di] = {
                                        ...discounts[di],
                                        color: e.target.value,
                                      };
                                      tiers[i] = { ...tiers[i], discounts };
                                      setPosEase({
                                        ...posEase,
                                        pricing: { ...posEase.pricing, tiers },
                                      });
                                    }}
                                  />
                                  <input
                                    type="color"
                                    title="Дэвсгэр өнгө"
                                    value={
                                      disc.color
                                        ? disc.color.startsWith("#")
                                          ? disc.color
                                          : "#" + disc.color
                                        : "#e11d48"
                                    }
                                    onChange={(e) => {
                                      const tiers = [...posEase.pricing.tiers];
                                      const discounts = [
                                        ...(tiers[i].discounts || []),
                                      ];
                                      discounts[di] = {
                                        ...discounts[di],
                                        color: e.target.value,
                                      };
                                      tiers[i] = { ...tiers[i], discounts };
                                      setPosEase({
                                        ...posEase,
                                        pricing: { ...posEase.pricing, tiers },
                                      });
                                    }}
                                    className="w-10 h-9 rounded cursor-pointer border border-slate-200 p-0.5 bg-white shrink-0"
                                  />
                                  <DangerMini
                                    onClick={() => {
                                      const tiers = [...posEase.pricing.tiers];
                                      tiers[i] = {
                                        ...tiers[i],
                                        discounts: (
                                          tiers[i].discounts || []
                                        ).filter((_, k) => k !== di),
                                      };
                                      setPosEase({
                                        ...posEase,
                                        pricing: { ...posEase.pricing, tiers },
                                      });
                                    }}
                                  >
                                    ✕
                                  </DangerMini>
                                </div>
                              ))}
                              <GhostButton
                                onClick={() => {
                                  const tiers = [...posEase.pricing.tiers];
                                  tiers[i] = {
                                    ...tiers[i],
                                    discounts: [
                                      ...(tiers[i].discounts || []),
                                      { label: "", color: "#e11d48" },
                                    ],
                                  };
                                  setPosEase({
                                    ...posEase,
                                    pricing: { ...posEase.pricing, tiers },
                                  });
                                }}
                              >
                                + Хөнгөлөлт нэмэх
                              </GhostButton>
                            </div>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setPosEase({
                            ...posEase,
                            pricing: {
                              ...posEase.pricing,
                              tiers: [
                                ...posEase.pricing.tiers,
                                {
                                  name: "",
                                  price: "",
                                  desc: "",
                                  discounts: [],
                                },
                              ],
                            },
                          })
                        }
                      >
                        + Багц нэмэх
                      </GhostButton>
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
                    {
                      id: "ah-visibility",
                      label: t.siteContent.visibility.title,
                    },
                    { id: "ah-hero", label: "Hero хэсэг" },
                    { id: "ah-features", label: "Боломжууд" },
                    { id: "ah-hardware", label: "Төхөөрөмжүүд" },
                    { id: "ah-pricing", label: "Үнэ тариф" },
                  ]}
                >
                  <EditorSection
                    id="ah-visibility"
                    title={t.siteContent.visibility.title}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideDescription}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {t.siteContent.common.editingPage}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={amarHome.hideDescription}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hideDescription: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideAppLinks}
                          </h4>
                          <p className="text-xs text-slate-500">
                            App Store & Play Store
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={amarHome.hideAppLinks}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hideAppLinks: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <EditorSection id="ah-hero" title="Hero хэсэг">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={amarHome.hero.title}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hero: { ...amarHome.hero, title: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг (онцлох)
                        </label>
                        <input
                          className={scInput}
                          value={amarHome.hero.titleAccent}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hero: {
                                ...amarHome.hero,
                                titleAccent: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Товчны текст
                        </label>
                        <input
                          className={scInput}
                          value={amarHome.hero.cta}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hero: { ...amarHome.hero, cta: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={amarHome.hero.desc}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hero: { ...amarHome.hero, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Hero Image
                        </label>
                        <ImageUploadField
                          value={amarHome.hero.image || ""}
                          onChange={(next) =>
                            setAmarHome({
                              ...amarHome,
                              hero: { ...amarHome.hero, image: next },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Танилцуулга видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={amarHome.hero.videoUrl || ""}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              hero: {
                                ...amarHome.hero,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Multiple videos list */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Олон видео (9:16 хэлбэр)
                        </label>
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          onClick={() =>
                            setAmarHome({
                              ...amarHome,
                              hero: {
                                ...amarHome.hero,
                                videos: [...(amarHome.hero.videos || []), { url: "", bio: "" }],
                              },
                            })
                          }
                        >
                          + Видео нэмэх
                        </button>
                      </div>
                      {(amarHome.hero.videos || []).map((v, i) => (
                        <div key={i} className="rounded-xl border border-zinc-700 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400 font-medium">Видео {i + 1}</span>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-red-400 transition"
                              onClick={() =>
                                setAmarHome({
                                  ...amarHome,
                                  hero: {
                                    ...amarHome.hero,
                                    videos: (amarHome.hero.videos || []).filter((_, j) => j !== i),
                                  },
                                })
                              }
                            >
                              Устгах
                            </button>
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              URL
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: https://youtube.com/watch?v=..."
                              value={v.url}
                              onChange={(e) => {
                                const videos = [...(amarHome.hero.videos || [])];
                                videos[i] = { ...videos[i], url: e.target.value };
                                setAmarHome({ ...amarHome, hero: { ...amarHome.hero, videos } });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Тайлбар (bio)
                            </label>
                            <textarea
                              className={scTextarea("min-h-[60px]")}
                              placeholder="Видеоны товч тайлбар..."
                              value={v.bio || ""}
                              onChange={(e) => {
                                const videos = [...(amarHome.hero.videos || [])];
                                videos[i] = { ...videos[i], bio: e.target.value };
                                setAmarHome({ ...amarHome, hero: { ...amarHome.hero, videos } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection id="ah-features" title="Боломжууд">
                    <div className="grid gap-4 mb-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={amarHome.features.title}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              features: {
                                ...amarHome.features,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={amarHome.features.desc}
                          onChange={(e) =>
                            setAmarHome({
                              ...amarHome,
                              features: {
                                ...amarHome.features,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {amarHome.features.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Гарчиг"
                              value={item.title}
                              onChange={(e) => {
                                const items = [...amarHome.features.items];
                                items[i].title = e.target.value;
                                setAmarHome({
                                  ...amarHome,
                                  features: { ...amarHome.features, items },
                                });
                              }}
                            />
                            <select
                              className={scInput}
                              value={item.size}
                              onChange={(e) => {
                                const items = [...amarHome.features.items];
                                items[i].size = e.target.value as any;
                                setAmarHome({
                                  ...amarHome,
                                  features: { ...amarHome.features, items },
                                });
                              }}
                            >
                              <option value="small">Жижиг</option>
                              <option value="medium">Дунд</option>
                              <option value="large">Том</option>
                            </select>
                            <DangerMini
                              onClick={() => {
                                const items = amarHome.features.items.filter(
                                  (_, j) => j !== i,
                                );
                                setAmarHome({
                                  ...amarHome,
                                  features: { ...amarHome.features, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={(next) => {
                              const items = [...amarHome.features.items];
                              items[i].image = next;
                              setAmarHome({
                                ...amarHome,
                                features: { ...amarHome.features, items },
                              });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...amarHome.features.items];
                              items[i].desc = e.target.value;
                              setAmarHome({
                                ...amarHome,
                                features: { ...amarHome.features, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setAmarHome({
                            ...amarHome,
                            features: {
                              ...amarHome.features,
                              items: [
                                ...amarHome.features.items,
                                { title: "", desc: "", size: "small" },
                              ],
                            },
                          })
                        }
                      >
                        + Боломж нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="ah-hardware" title="Төхөөрөмжүүд">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Хэсгийн гарчиг
                      </label>
                      <input
                        className={scInput}
                        value={amarHome.hardware.title}
                        onChange={(e) =>
                          setAmarHome({
                            ...amarHome,
                            hardware: {
                              ...amarHome.hardware,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      {amarHome.hardware.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Нэр"
                              value={item.name}
                              onChange={(e) => {
                                const items = [...amarHome.hardware.items];
                                items[i].name = e.target.value;
                                setAmarHome({
                                  ...amarHome,
                                  hardware: { ...amarHome.hardware, items },
                                });
                              }}
                            />
                            <input
                              className={scInput}
                              placeholder="Төрөл (жишээ: Мэдрэгч)"
                              value={item.label}
                              onChange={(e) => {
                                const items = [...amarHome.hardware.items];
                                items[i].label = e.target.value;
                                setAmarHome({
                                  ...amarHome,
                                  hardware: { ...amarHome.hardware, items },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() => {
                                const items = amarHome.hardware.items.filter(
                                  (_, j) => j !== i,
                                );
                                setAmarHome({
                                  ...amarHome,
                                  hardware: { ...amarHome.hardware, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={(next) => {
                              const items = [...amarHome.hardware.items];
                              items[i].image = next;
                              setAmarHome({
                                ...amarHome,
                                hardware: { ...amarHome.hardware, items },
                              });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...amarHome.hardware.items];
                              items[i].desc = e.target.value;
                              setAmarHome({
                                ...amarHome,
                                hardware: { ...amarHome.hardware, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setAmarHome({
                            ...amarHome,
                            hardware: {
                              ...amarHome.hardware,
                              items: [
                                ...amarHome.hardware.items,
                                { name: "", desc: "", label: "" },
                              ],
                            },
                          })
                        }
                      >
                        + Төхөөрөмж нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection id="ah-pricing" title="Үнэ тариф">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Хэсгийн гарчиг
                      </label>
                      <input
                        className={scInput}
                        value={amarHome.pricing.title}
                        onChange={(e) =>
                          setAmarHome({
                            ...amarHome,
                            pricing: {
                              ...amarHome.pricing,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      {amarHome.pricing.tiers.map((tier, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Багцын нэр"
                              value={tier.name}
                              onChange={(e) => {
                                const tiers = [...amarHome.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  name: e.target.value,
                                };
                                setAmarHome({
                                  ...amarHome,
                                  pricing: { ...amarHome.pricing, tiers },
                                });
                              }}
                            />
                            <input
                              className={scInput}
                              placeholder="Үнэ"
                              value={tier.price}
                              onChange={(e) => {
                                const tiers = [...amarHome.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  price: e.target.value,
                                };
                                setAmarHome({
                                  ...amarHome,
                                  pricing: { ...amarHome.pricing, tiers },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() => {
                                const tiers = amarHome.pricing.tiers.filter(
                                  (_, j) => j !== i,
                                );
                                setAmarHome({
                                  ...amarHome,
                                  pricing: { ...amarHome.pricing, tiers },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={tier.desc}
                            onChange={(e) => {
                              const tiers = [...amarHome.pricing.tiers];
                              tiers[i] = { ...tiers[i], desc: e.target.value };
                              setAmarHome({
                                ...amarHome,
                                pricing: { ...amarHome.pricing, tiers },
                              });
                            }}
                          />
                          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!tier.hideButton}
                              onChange={(e) => {
                                const tiers = [...amarHome.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  hideButton: e.target.checked,
                                };
                                setAmarHome({
                                  ...amarHome,
                                  pricing: { ...amarHome.pricing, tiers },
                                });
                              }}
                            />
                            Товч нуух
                          </label>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны текст
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: Эхлэх →"
                              value={tier.buttonLabel || ""}
                              onChange={(e) => {
                                const tiers = [...amarHome.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonLabel: e.target.value,
                                };
                                setAmarHome({
                                  ...amarHome,
                                  pricing: { ...amarHome.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны холбоос (URL)
                            </label>
                            <input
                              className={scInput}
                              placeholder="https://..."
                              value={tier.buttonUrl || ""}
                              onChange={(e) => {
                                const tiers = [...amarHome.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonUrl: e.target.value,
                                };
                                setAmarHome({
                                  ...amarHome,
                                  pricing: { ...amarHome.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-950">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Хөнгөлөлт
                            </label>
                            <div className="space-y-2">
                              {(tier.discounts || []).map(
                                (disc: any, k: number) => (
                                  <div
                                    key={k}
                                    className="flex gap-2 items-center"
                                  >
                                    <input
                                      className={`${scInput} text-xs py-1.5`}
                                      placeholder="6 mth /5% OFF"
                                      value={disc.label}
                                      onChange={(e) => {
                                        const tiers = [
                                          ...amarHome.pricing.tiers,
                                        ];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          label: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setAmarHome({
                                          ...amarHome,
                                          pricing: {
                                            ...amarHome.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                    />
                                    <input
                                      className={`${scInput} text-xs py-1.5 max-w-[120px]`}
                                      placeholder="Өнгө (Сонголттой, жш: #7c3aed)"
                                      value={disc.color || ""}
                                      onChange={(e) => {
                                        const tiers = [
                                          ...amarHome.pricing.tiers,
                                        ];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          color: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setAmarHome({
                                          ...amarHome,
                                          pricing: {
                                            ...amarHome.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                    />
                                    <input
                                      type="color"
                                      title="Дэвсгэр өнгө"
                                      value={
                                        disc.color
                                          ? disc.color.startsWith("#")
                                            ? disc.color
                                            : "#" + disc.color
                                          : "#7c3aed"
                                      }
                                      onChange={(e) => {
                                        const tiers = [
                                          ...amarHome.pricing.tiers,
                                        ];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          color: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setAmarHome({
                                          ...amarHome,
                                          pricing: {
                                            ...amarHome.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                      className="w-10 h-9 rounded cursor-pointer border border-slate-200 p-0.5 bg-white shrink-0"
                                    />
                                    <DangerMini
                                      onClick={() => {
                                        const tiers = [
                                          ...amarHome.pricing.tiers,
                                        ];
                                        const discounts = (
                                          tiers[i].discounts || []
                                        ).filter((_, l) => l !== k);
                                        tiers[i] = { ...tiers[i], discounts };
                                        setAmarHome({
                                          ...amarHome,
                                          pricing: {
                                            ...amarHome.pricing,
                                            tiers,
                                          },
                                        });
                                      }}
                                    >
                                      ✕
                                    </DangerMini>
                                  </div>
                                ),
                              )}
                              <GhostButton
                                className="text-[10px] py-1"
                                onClick={() => {
                                  const tiers = [...amarHome.pricing.tiers];
                                  const discounts = [
                                    ...(tiers[i].discounts || []),
                                    { label: "", color: "" },
                                  ];
                                  tiers[i] = { ...tiers[i], discounts };
                                  setAmarHome({
                                    ...amarHome,
                                    pricing: { ...amarHome.pricing, tiers },
                                  });
                                }}
                              >
                                + Хөнгөлөлт нэмэх
                              </GhostButton>
                            </div>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setAmarHome({
                            ...amarHome,
                            pricing: {
                              ...amarHome.pricing,
                              tiers: [
                                ...amarHome.pricing.tiers,
                                {
                                  name: "",
                                  price: "",
                                  desc: "",
                                  discounts: [],
                                },
                              ],
                            },
                          })
                        }
                      >
                        + Багц нэмэх
                      </GhostButton>
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
                  <EditorSection
                    id="ajluud-header"
                    title="Толгой хэсэг"
                    subtitle="Badge, гарчиг, онцлох үг"
                  >
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Badge
                        </label>
                        <input
                          className={scInput}
                          placeholder="Манай бүтээлүүд"
                          value={ajluud.header.badge}
                          onChange={(e) =>
                            setAjluud({
                              ...ajluud,
                              header: {
                                ...ajluud.header,
                                badge: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          placeholder="Digital"
                          value={ajluud.header.titleLine1}
                          onChange={(e) =>
                            setAjluud({
                              ...ajluud,
                              header: {
                                ...ajluud.header,
                                titleLine1: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Онцлох үг (хоосон бол автомат)
                        </label>
                        <input
                          className={scInput}
                          placeholder="Craft."
                          value={ajluud.header.titleAccent}
                          onChange={(e) =>
                            setAjluud({
                              ...ajluud,
                              header: {
                                ...ajluud.header,
                                titleAccent: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="ajluud-items"
                    title="Бүтээлүүд"
                    subtitle="Browser slideshow дээр харагдах бүтээлүүд"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      {ajluud.items.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="rounded-xl border border-slate-200/90 bg-white/80 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-900/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              #{i + 1}
                            </span>
                            <DangerMini
                              onClick={() =>
                                setAjluud({
                                  ...ajluud,
                                  items: ajluud.items.filter((_, j) => j !== i),
                                })
                              }
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs text-zinc-500">
                                Нэр
                              </label>
                              <input
                                className={scInput}
                                placeholder="AmarHome"
                                value={item.title}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = {
                                    ...items[i],
                                    title: e.target.value,
                                  };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">
                                Ангилал
                              </label>
                              <input
                                className={scInput}
                                placeholder="Real Estate Platform"
                                value={item.category}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = {
                                    ...items[i],
                                    category: e.target.value,
                                  };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">
                                Холбоос (URL)
                              </label>
                              <input
                                className={scInput}
                                placeholder="https://amarhome.mn"
                                value={item.link ?? ""}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = {
                                    ...items[i],
                                    link: e.target.value,
                                  };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500">
                                Тайлбар
                              </label>
                              <input
                                className={scInput}
                                placeholder="Товч тайлбар..."
                                value={item.description ?? ""}
                                onChange={(e) => {
                                  const items = [...ajluud.items];
                                  items[i] = {
                                    ...items[i],
                                    description: e.target.value,
                                  };
                                  setAjluud({ ...ajluud, items });
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-3">
                              <label className="text-xs text-zinc-500">
                                Үндсэн зураг/видео (Desktop)
                              </label>
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
                                <label className="text-xs text-zinc-500">
                                  Гар утасны зураг/видео (Mobile)
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={item.showMobile}
                                    onChange={(e) => {
                                      const items = [...ajluud.items];
                                      items[i] = {
                                        ...items[i],
                                        showMobile: e.target.checked,
                                      };
                                      setAjluud({ ...ajluud, items });
                                    }}
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    Mobile харуулах
                                  </span>
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
                              {
                                id: Date.now(),
                                title: "",
                                category: "",
                                image: "",
                                description: "",
                                link: "",
                              },
                            ],
                          })
                        }
                      >
                        + Бүтээл нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("ajluud")}
                  >
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.ajluud.label,
                        )}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "rently" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    {
                      id: "re-visibility",
                      label: t.siteContent.visibility.title,
                    },
                    { id: "re-hero", label: "Hero хэсэг" },
                    { id: "re-features", label: "Боломжууд" },
                    { id: "re-notifications", label: "Мэдэгдэл" },
                    { id: "re-penalties", label: "Торгууль" },
                    { id: "re-costs", label: "Зардал" },
                    { id: "re-pricing", label: "Үнэ тариф" },
                    { id: "re-cta", label: "Холбоо барих хэсэг" },
                  ]}
                >
                  <EditorSection
                    id="re-visibility"
                    title={t.siteContent.visibility.title}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideDescription}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {t.siteContent.common.editingPage}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={rently.hideDescription}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hideDescription: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.siteContent.visibility.hideAppLinks}
                          </h4>
                          <p className="text-xs text-slate-500">
                            App Store & Play Store
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={rently.hideAppLinks}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hideAppLinks: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  </EditorSection>
                  <EditorSection id="re-hero" title="Hero хэсэг">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={rently.hero.title}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: { ...rently.hero, title: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг (онцлох)
                        </label>
                        <input
                          className={scInput}
                          value={rently.hero.titleAccent}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: {
                                ...rently.hero,
                                titleAccent: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг (онцлох 2)
                        </label>
                        <input
                          className={scInput}
                          value={rently.hero.titleAccent2}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: {
                                ...rently.hero,
                                titleAccent2: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Үндсэн товч
                        </label>
                        <input
                          className={scInput}
                          value={rently.hero.cta}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: { ...rently.hero, cta: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Туслах товч
                        </label>
                        <input
                          className={scInput}
                          value={rently.hero.secondary}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: {
                                ...rently.hero,
                                secondary: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Туслах товчны холбоос (URL)
                        </label>
                        <input
                          className={scInput}
                          placeholder="https://..."
                          value={rently.hero.secondaryUrl || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: {
                                ...rently.hero,
                                secondaryUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={rently.hero.desc}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: { ...rently.hero, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Hero Image
                        </label>
                        <ImageUploadField
                          value={rently.hero.image || ""}
                          onChange={(next) =>
                            setRently({
                              ...rently,
                              hero: { ...rently.hero, image: next },
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Танилцуулга видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={rently.hero.videoUrl || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              hero: {
                                ...rently.hero,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Multiple videos list */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Олон видео (9:16 хэлбэр)
                        </label>
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          onClick={() =>
                            setRently({
                              ...rently,
                              hero: {
                                ...rently.hero,
                                videos: [...(rently.hero.videos || []), { url: "", bio: "" }],
                              },
                            })
                          }
                        >
                          + Видео нэмэх
                        </button>
                      </div>
                      {(rently.hero.videos || []).map((v, i) => (
                        <div key={i} className="rounded-xl border border-zinc-700 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400 font-medium">Видео {i + 1}</span>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-red-400 transition"
                              onClick={() =>
                                setRently({
                                  ...rently,
                                  hero: {
                                    ...rently.hero,
                                    videos: (rently.hero.videos || []).filter((_, j) => j !== i),
                                  },
                                })
                              }
                            >
                              Устгах
                            </button>
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              URL
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: https://youtube.com/watch?v=..."
                              value={v.url}
                              onChange={(e) => {
                                const videos = [...(rently.hero.videos || [])];
                                videos[i] = { ...videos[i], url: e.target.value };
                                setRently({ ...rently, hero: { ...rently.hero, videos } });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Тайлбар (bio)
                            </label>
                            <textarea
                              className={scTextarea("min-h-[60px]")}
                              placeholder="Видеоны товч тайлбар..."
                              value={v.bio || ""}
                              onChange={(e) => {
                                const videos = [...(rently.hero.videos || [])];
                                videos[i] = { ...videos[i], bio: e.target.value };
                                setRently({ ...rently, hero: { ...rently.hero, videos } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection id="re-features" title="Боломжууд">
                    <div className="grid gap-4 mb-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={rently.features.title}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              features: {
                                ...rently.features,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Хэсгийн тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[60px]")}
                          value={rently.features.desc}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              features: {
                                ...rently.features,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {rently.features.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Гарчиг"
                              value={item.title}
                              onChange={(e) => {
                                const items = [...rently.features.items];
                                items[i] = {
                                  ...items[i],
                                  title: e.target.value,
                                };
                                setRently({
                                  ...rently,
                                  features: { ...rently.features, items },
                                });
                              }}
                            />
                            <select
                              className={scInput}
                              value={item.size}
                              onChange={(e) => {
                                const items = [...rently.features.items];
                                items[i] = {
                                  ...items[i],
                                  size: e.target.value as
                                    | "small"
                                    | "medium"
                                    | "large",
                                };
                                setRently({
                                  ...rently,
                                  features: { ...rently.features, items },
                                });
                              }}
                            >
                              <option value="small">Жижиг</option>
                              <option value="medium">Дунд</option>
                              <option value="large">Том</option>
                            </select>
                            <DangerMini
                              onClick={() => {
                                const items = rently.features.items.filter(
                                  (_, j) => j !== i,
                                );
                                setRently({
                                  ...rently,
                                  features: { ...rently.features, items },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <ImageUploadField
                            value={item.image || ""}
                            onChange={(next) => {
                              const items = [...rently.features.items];
                              items[i] = { ...items[i], image: next };
                              setRently({
                                ...rently,
                                features: { ...rently.features, items },
                              });
                            }}
                          />
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={item.desc}
                            onChange={(e) => {
                              const items = [...rently.features.items];
                              items[i] = { ...items[i], desc: e.target.value };
                              setRently({
                                ...rently,
                                features: { ...rently.features, items },
                              });
                            }}
                          />
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setRently({
                            ...rently,
                            features: {
                              ...rently.features,
                              items: [
                                ...rently.features.items,
                                { title: "", desc: "", size: "small" },
                              ],
                            },
                          })
                        }
                      >
                        + Боломж нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="re-notifications"
                    title="Мэдэгдэл"
                    subtitle="Түрээсийн мэдэгдлийн хэсэг"
                  >
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго
                        </label>
                        <input
                          className={scInput}
                          value={rently.notifications.label || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              notifications: {
                                ...rently.notifications,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={rently.notifications.title}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              notifications: {
                                ...rently.notifications,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={rently.notifications.desc}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              notifications: {
                                ...rently.notifications,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Зураг / Икон
                        </label>
                        <ImageUploadField
                          value={rently.notifications.image || ""}
                          onChange={(next) =>
                            setRently({
                              ...rently,
                              notifications: {
                                ...rently.notifications,
                                image: next,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={rently.notifications.videoUrl || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              notifications: {
                                ...rently.notifications,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="re-penalties"
                    title="Торгуулийн нөхцөл"
                    subtitle="Хариуцлагын болон торгуулийн мэдээлэл"
                  >
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго
                        </label>
                        <input
                          className={scInput}
                          value={rently.penalties.label || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              penalties: {
                                ...rently.penalties,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={rently.penalties.title}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              penalties: {
                                ...rently.penalties,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={rently.penalties.desc}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              penalties: {
                                ...rently.penalties,
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Зураг / Икон
                        </label>
                        <ImageUploadField
                          value={rently.penalties.image || ""}
                          onChange={(next) =>
                            setRently({
                              ...rently,
                              penalties: {
                                ...rently.penalties,
                                image: next,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={rently.penalties.videoUrl || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              penalties: {
                                ...rently.penalties,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="re-costs"
                    title="Зардлын мэдээлэл"
                    subtitle="Хөлс, зардлын тайлбар"
                  >
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Шошго
                        </label>
                        <input
                          className={scInput}
                          value={rently.costs.label || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              costs: {
                                ...rently.costs,
                                label: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг
                        </label>
                        <input
                          className={scInput}
                          value={rently.costs.title}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              costs: { ...rently.costs, title: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={rently.costs.desc}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              costs: { ...rently.costs, desc: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Зураг / Икон
                        </label>
                        <ImageUploadField
                          value={rently.costs.image || ""}
                          onChange={(next) =>
                            setRently({
                              ...rently,
                              costs: {
                                ...rently.costs,
                                image: next,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Видео URL (YouTube эсвэл шууд)
                        </label>
                        <input
                          className={scInput}
                          placeholder="жш: https://youtube.com/watch?v=..."
                          value={rently.costs.videoUrl || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              costs: {
                                ...rently.costs,
                                videoUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <EditorSection id="re-pricing" title="Үнэ тариф">
                    <div className="mb-6">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Хэсгийн гарчиг
                      </label>
                      <input
                        className={scInput}
                        value={rently.pricing.title}
                        onChange={(e) =>
                          setRently({
                            ...rently,
                            pricing: {
                              ...rently.pricing,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      {rently.pricing.tiers.map((tier, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
                        >
                          <div className="flex gap-4">
                            <input
                              className={scInput}
                              placeholder="Багцын нэр"
                              value={tier.name}
                              onChange={(e) => {
                                const tiers = [...rently.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  name: e.target.value,
                                };
                                setRently({
                                  ...rently,
                                  pricing: { ...rently.pricing, tiers },
                                });
                              }}
                            />
                            <input
                              className={scInput}
                              placeholder="Үнэ"
                              value={tier.price}
                              onChange={(e) => {
                                const tiers = [...rently.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  price: e.target.value,
                                };
                                setRently({
                                  ...rently,
                                  pricing: { ...rently.pricing, tiers },
                                });
                              }}
                            />
                            <DangerMini
                              onClick={() => {
                                const tiers = rently.pricing.tiers.filter(
                                  (_, j) => j !== i,
                                );
                                setRently({
                                  ...rently,
                                  pricing: { ...rently.pricing, tiers },
                                });
                              }}
                            >
                              Устгах
                            </DangerMini>
                          </div>
                          <textarea
                            className={scTextarea("min-h-[60px]")}
                            placeholder="Тайлбар"
                            value={tier.desc}
                            onChange={(e) => {
                              const tiers = [...rently.pricing.tiers];
                              tiers[i] = { ...tiers[i], desc: e.target.value };
                              setRently({
                                ...rently,
                                pricing: { ...rently.pricing, tiers },
                              });
                            }}
                          />
                          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!tier.hideButton}
                              onChange={(e) => {
                                const tiers = [...rently.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  hideButton: e.target.checked,
                                };
                                setRently({
                                  ...rently,
                                  pricing: { ...rently.pricing, tiers },
                                });
                              }}
                            />
                            Товч нуух
                          </label>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны текст
                            </label>
                            <input
                              className={scInput}
                              placeholder="жш: Эхлэх →"
                              value={tier.buttonLabel || ""}
                              onChange={(e) => {
                                const tiers = [...rently.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonLabel: e.target.value,
                                };
                                setRently({
                                  ...rently,
                                  pricing: { ...rently.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Товчны холбоос (URL)
                            </label>
                            <input
                              className={scInput}
                              placeholder="https://..."
                              value={tier.buttonUrl || ""}
                              onChange={(e) => {
                                const tiers = [...rently.pricing.tiers];
                                tiers[i] = {
                                  ...tiers[i],
                                  buttonUrl: e.target.value,
                                };
                                setRently({
                                  ...rently,
                                  pricing: { ...rently.pricing, tiers },
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-950">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Хөнгөлөлт
                            </label>
                            <div className="space-y-2">
                              {(tier.discounts || []).map(
                                (disc: any, k: number) => (
                                  <div
                                    key={k}
                                    className="flex gap-2 items-center"
                                  >
                                    <input
                                      className={`${scInput} text-xs py-1.5`}
                                      placeholder="6 mth /5% OFF"
                                      value={disc.label}
                                      onChange={(e) => {
                                        const tiers = [...rently.pricing.tiers];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          label: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setRently({
                                          ...rently,
                                          pricing: { ...rently.pricing, tiers },
                                        });
                                      }}
                                    />
                                    <input
                                      className={`${scInput} text-xs py-1.5 max-w-[120px]`}
                                      placeholder="Өнгө (Сонголттой, жш: #7c3aed)"
                                      value={disc.color || ""}
                                      onChange={(e) => {
                                        const tiers = [...rently.pricing.tiers];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          color: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setRently({
                                          ...rently,
                                          pricing: { ...rently.pricing, tiers },
                                        });
                                      }}
                                    />
                                    <input
                                      type="color"
                                      title="Дэвсгэр өнгө"
                                      value={
                                        disc.color
                                          ? disc.color.startsWith("#")
                                            ? disc.color
                                            : "#" + disc.color
                                          : "#7c3aed"
                                      }
                                      onChange={(e) => {
                                        const tiers = [...rently.pricing.tiers];
                                        const discounts = [
                                          ...(tiers[i].discounts || []),
                                        ];
                                        discounts[k] = {
                                          ...discounts[k],
                                          color: e.target.value,
                                        };
                                        tiers[i] = { ...tiers[i], discounts };
                                        setRently({
                                          ...rently,
                                          pricing: { ...rently.pricing, tiers },
                                        });
                                      }}
                                      className="w-10 h-9 rounded cursor-pointer border border-slate-200 p-0.5 bg-white shrink-0"
                                    />
                                    <DangerMini
                                      onClick={() => {
                                        const tiers = [...rently.pricing.tiers];
                                        const discounts = (
                                          tiers[i].discounts || []
                                        ).filter((_, l) => l !== k);
                                        tiers[i] = { ...tiers[i], discounts };
                                        setRently({
                                          ...rently,
                                          pricing: { ...rently.pricing, tiers },
                                        });
                                      }}
                                    >
                                      ✕
                                    </DangerMini>
                                  </div>
                                ),
                              )}
                              <GhostButton
                                className="text-[10px] py-1"
                                onClick={() => {
                                  const tiers = [...rently.pricing.tiers];
                                  const discounts = [
                                    ...(tiers[i].discounts || []),
                                    { label: "", color: "" },
                                  ];
                                  tiers[i] = { ...tiers[i], discounts };
                                  setRently({
                                    ...rently,
                                    pricing: { ...rently.pricing, tiers },
                                  });
                                }}
                              >
                                + Хөнгөлөлт нэмэх
                              </GhostButton>
                            </div>
                          </div>
                        </div>
                      ))}
                      <GhostButton
                        onClick={() =>
                          setRently({
                            ...rently,
                            pricing: {
                              ...rently.pricing,
                              tiers: [
                                ...rently.pricing.tiers,
                                {
                                  name: "",
                                  price: "",
                                  desc: "",
                                  discounts: [],
                                },
                              ],
                            },
                          })
                        }
                      >
                        + Багц нэмэх
                      </GhostButton>
                    </div>
                  </EditorSection>

                  <EditorSection
                    id="re-cta"
                    title="Холбоо барих хэсэг"
                    subtitle="Хуудасны доор байрлах бүртгэлийн формын текст"
                  >
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Дэд гарчиг (Subtitle)
                        </label>
                        <input
                          className={scInput}
                          value={rently.cta?.subtitle || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              cta: {
                                ...(rently.cta || {
                                  title: "",
                                  subtitle: "",
                                  desc: "",
                                }),
                                subtitle: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Гарчиг (Title)
                        </label>
                        <input
                          className={scInput}
                          value={rently.cta?.title || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              cta: {
                                ...(rently.cta || {
                                  title: "",
                                  subtitle: "",
                                  desc: "",
                                }),
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Тайлбар (Description)
                        </label>
                        <textarea
                          className={scTextarea("min-h-[80px]")}
                          value={rently.cta?.desc || ""}
                          onChange={(e) =>
                            setRently({
                              ...rently,
                              cta: {
                                ...(rently.cta || {
                                  title: "",
                                  subtitle: "",
                                  desc: "",
                                }),
                                desc: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("rently")}
                  >
                    {saving ? t.common.saving : "Хадгалах (Rently)"}
                  </PrimarySave>
                </EditorBody>
              ) : tab === "global-contact" ? (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[
                    { id: "gc-contact", label: "Холбоо барих мэдээлэл" },
                  ]}
                >
                  <EditorSection
                    id="gc-contact"
                    title="Нийтлэг холбоо барих мэдээлэл"
                    subtitle="Бүх бүтээгдэхүүний хуудсанд харагдана — ParkEase, PosEase, AmarHome, Rently"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          И-Мэйл шошго (жш: И-Мэйл)
                        </label>
                        <input
                          className={scInput}
                          placeholder="И-Мэйл"
                          value={globalContact.emailLabel}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              emailLabel: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          И-Мэйл хаяг
                        </label>
                        <input
                          className={scInput}
                          placeholder="info@zevtabs.mn"
                          value={globalContact.email}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Утасны шошго (жш: Утас)
                        </label>
                        <input
                          className={scInput}
                          placeholder="Утас"
                          value={globalContact.phoneLabel}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              phoneLabel: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Утасны дугаар (хоосон бол харагдахгүй)
                        </label>
                        <input
                          className={scInput}
                          placeholder="+976 9999-9999"
                          value={globalContact.phone}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Байршлын шошго (жш: Байршил)
                        </label>
                        <input
                          className={scInput}
                          placeholder="Байршил"
                          value={globalContact.locationLabel}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              locationLabel: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Байршил (хоосон бол харагдахгүй)
                        </label>
                        <input
                          className={scInput}
                          placeholder="Улаанбаатар, Монгол"
                          value={globalContact.location}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Google Maps холбоос (байршил дарахад нээгдэнэ)
                        </label>
                        <input
                          className={scInput}
                          placeholder="https://maps.google.com/?q=..."
                          value={globalContact.locationUrl}
                          onChange={(e) =>
                            setGlobalContact({
                              ...globalContact,
                              locationUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("global-contact")}
                  >
                    {saving ? t.common.saving : "Хадгалах (Нийтлэг холбоо)"}
                  </PrimarySave>
                </EditorBody>
              ) : (
                <EditorBody
                  sectionJumpKey={tab}
                  sectionItems={[{ id: "footer-bottom", label: "Доод текст" }]}
                >
                  <EditorSection
                    id="footer-bottom"
                    title="Доод текст"
                    subtitle="Хөлийн доод хэсэгт харагдах текст"
                  >
                    <div className="grid gap-4">
                      <div className="w-full">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Зүүн доод текст
                        </label>
                        <input
                          className={scInput}
                          placeholder="Жишээ: Privacy Policy · Terms"
                          value={footer.bottomLeftText || ""}
                          onChange={(e) =>
                            setFooter({
                              ...footer,
                              bottomLeftText: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="w-full">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Баруун доод текст (жишээ: Бүтээгч: Zevtabs · © 2026)
                        </label>
                        <input
                          className={scInput}
                          placeholder="Бүтээгч: Zevtabs · © 2026"
                          value={footer.bottomRightText || ""}
                          onChange={(e) =>
                            setFooter({
                              ...footer,
                              bottomRightText: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                          Хэрэв хоосон бол: Бүтээгч: Zevtabs · © 2026
                        </p>
                      </div>
                    </div>
                  </EditorSection>

                  <PrimarySave
                    disabled={saving}
                    onClick={() => void save("footer")}
                  >
                    {saving
                      ? t.common.saving
                      : t.siteContent.common.saveTab(
                          t.siteContent.tabs.footer.label,
                        )}
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
