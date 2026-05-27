"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Save, 
  Smartphone, 
  Share2, 
  Layout, 
  FileEdit,
  Globe,
  QrCode,
  Plus,
  Trash2
} from "lucide-react";
import { ADMIN_BASE_PATH } from "@/lib/adminBasePath";
import { 
  ensureClientAuthorized, 
  readClientAdminToken, 
  withClientAdminAuth 
} from "@/lib/adminClientAuth";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { getApiBaseUrl, joinBackendRequestUrl } from "@/lib/api";
import ImageUploadField from "@/components/ImageUploadField";
import {
  EditorAlerts,
  EditorBody,
  EditorSection,
  EditorSurface,
  EditorTabRail,
  EditorTabSelect,
  Field,
  PrimarySave,
  scInput,
  scTextarea,
  SubCard,
} from "../editorUi";

type QrTabId = "app-links" | "social" | "descriptions" | "branding";

interface SocialLink {
  name: string;
  label: string;
  url: string;
  icon: string;
  color?: string;
}

export default function QrContentPage() {
  const params = useParams();
  const siteId = params?.siteId as string;
  const { t } = useAdminLanguage();
  
  const [tab, setTab] = useState<QrTabId>("app-links");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentLang, setContentLang] = useState<"mn" | "en">("mn");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    description: { mn: "", en: "" },
    ios: "",
    android: "",
    facebook: "",
    facebookName: "",
    instagram: "",
    instagramName: "",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.5)",
    hideDescription: false,
    hideAppLinks: false,
    hideSocial: false,
    socialLinks: [] as SocialLink[]
  });

  const QR_TABS = [
    { id: "app-links", label: t.qrPortal.sections.appLinks, hint: "App Store & Play Store", icon: Smartphone },
    { id: "social", label: t.qrPortal.sections.social, hint: "Facebook & Instagram", icon: Share2 },
    { id: "descriptions", label: t.qrPortal.sections.descriptions, hint: "Welcome Messages", icon: FileEdit },
    { id: "branding", label: t.qrPortal.sections.branding, hint: "Colors & Glow", icon: Layout },
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          joinBackendRequestUrl(
            getApiBaseUrl(),
            `/api/v1/admin/site-pages/qr-portal?siteId=${siteId}`
          ),
          withClientAdminAuth()
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data?.sections) {
            const data = json.data.sections;
            setFormData(prev => ({
              ...prev,
              ...data,
              description: data.description && typeof data.description === 'object' 
                ? { ...prev.description, ...data.description }
                : prev.description,
              hideDescription: !!data.hideDescription,
              hideAppLinks: !!data.hideAppLinks,
              hideSocial: !!data.hideSocial,
              socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : []
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch QR data:", e);
      } finally {
        setLoading(false);
      }
    }
    if (siteId) fetchData();
  }, [siteId]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        joinBackendRequestUrl(
          getApiBaseUrl(),
          `/api/v1/admin/site-pages/qr-portal?siteId=${siteId}`
        ),
        withClientAdminAuth({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: "qr-portal",
            siteId: siteId,
            sections: formData
          })
        })
      );

      const gate = await ensureClientAuthorized(res);
      if (gate === "forbidden") {
        setMessage({ type: "error", text: t.siteContent.common.forbidden });
        return;
      }
      if (gate !== "ok") return;

      if (res.ok) {
        setMessage({ type: "success", text: t.qrPortal.messages.success });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: t.qrPortal.messages.error });
      }
    } catch (e) {
      setMessage({ type: "error", text: t.qrPortal.messages.error });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-zinc-500">{t.qrPortal.messages.loading}</div>;

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] w-full max-w-none min-h-0 flex-col gap-4 overflow-hidden sm:h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-6.5rem)]">
      <EditorAlerts 
        error={message?.type === 'error' ? message.text : null} 
        saved={message?.type === 'success' ? message.text : null} 
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:grid lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <aside className="hidden h-full min-h-0 lg:block lg:w-full lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-linear-to-b lg:from-slate-50 lg:to-white lg:p-4 lg:shadow-sm dark:lg:border-slate-800 dark:lg:from-slate-950 dark:lg:to-slate-900">
          <EditorTabRail
            tabs={QR_TABS}
            active={tab}
            onSelect={(id) => setTab(id as QrTabId)}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          <EditorTabSelect
            tabs={QR_TABS}
            active={tab}
            onSelect={(id) => setTab(id as QrTabId)}
          />

          <EditorSurface>
            <header className="shrink-0 border-b border-slate-200/80 pb-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                {t.siteContent.common.editingPage}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {QR_TABS.find(t => t.id === tab)?.label}
              </h2>
              <p className="mt-1 w-full text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {QR_TABS.find(t => t.id === tab)?.hint} — {siteId}
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pt-6 [scrollbar-gutter:stable]">
              <EditorBody>
                {tab === "app-links" && (
                  <EditorSection 
                    id="app-links" 
                    title={t.qrPortal.sections.appLinks}
                  >
                    <div className="space-y-6">
                      {/* Section Toggle */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {t.qrPortal.visibility.hideAppLinks}
                          </label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.qrPortal.fields.hideAppLinks}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.hideAppLinks}
                          onChange={e => setFormData({ ...formData, hideAppLinks: e.target.checked })}
                          className="h-5 w-5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label={t.qrPortal.fields.ios}>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              className={`${scInput} pl-10`}
                              value={formData.ios}
                              onChange={e => setFormData({ ...formData, ios: e.target.value })}
                              placeholder="https://apps.apple.com/..."
                            />
                          </div>
                        </Field>
                        <Field label={t.qrPortal.fields.android}>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              className={`${scInput} pl-10`}
                              value={formData.android}
                              onChange={e => setFormData({ ...formData, android: e.target.value })}
                              placeholder="https://play.google.com/..."
                            />
                          </div>
                        </Field>
                      </div>
                    </div>
                  </EditorSection>
                )}

                {tab === "social" && (
                  <EditorSection 
                    id="social-handles" 
                    title={t.qrPortal.sections.social}
                  >
                    <div className="space-y-8">
                      {/* Dynamic links */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Dynamic Social Handles List
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = [
                                ...formData.socialLinks,
                                { name: "", label: "", url: "", icon: "", color: "#10b981" }
                              ];
                              setFormData({ ...formData, socialLinks: newLinks });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all duration-200"
                          >
                            <Plus size={14} /> {t.qrPortal.fields.addSocial}
                          </button>
                        </div>

                        {formData.socialLinks.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-3xl text-slate-400 dark:text-slate-500">
                            No dynamic social links added yet. Click the button above to add one.
                          </div>
                        ) : (
                          <div className="grid gap-6">
                            {formData.socialLinks.map((link, idx) => (
                              <SubCard key={idx}>
                                <div className="flex flex-col gap-6">
                                  {/* Header with Remove Button */}
                                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                                      Social Link #{idx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newLinks = formData.socialLinks.filter((_, i) => i !== idx);
                                        setFormData({ ...formData, socialLinks: newLinks });
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-black text-red-500 hover:text-red-750 uppercase transition-colors"
                                    >
                                      <Trash2 size={14} /> {t.siteContent.common.remove}
                                    </button>
                                  </div>

                                  {/* Link Fields */}
                                  <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                      <Field label={t.qrPortal.fields.socialName}>
                                        <input
                                          className={scInput}
                                          value={link.name}
                                          onChange={e => {
                                            const newLinks = [...formData.socialLinks];
                                            newLinks[idx].name = e.target.value;
                                            setFormData({ ...formData, socialLinks: newLinks });
                                          }}
                                          placeholder="Facebook, Instagram, LinkedIn..."
                                        />
                                      </Field>

                                      <Field label={t.qrPortal.fields.socialLabel}>
                                        <input
                                          className={scInput}
                                          value={link.label}
                                          onChange={e => {
                                            const newLinks = [...formData.socialLinks];
                                            newLinks[idx].label = e.target.value;
                                            setFormData({ ...formData, socialLinks: newLinks });
                                          }}
                                          placeholder="e.g. zevtabs_official"
                                        />
                                      </Field>

                                      <Field label={t.qrPortal.fields.socialUrl}>
                                        <input
                                          className={scInput}
                                          value={link.url}
                                          onChange={e => {
                                            const newLinks = [...formData.socialLinks];
                                            newLinks[idx].url = e.target.value;
                                            setFormData({ ...formData, socialLinks: newLinks });
                                          }}
                                          placeholder="https://..."
                                        />
                                      </Field>

                                      <Field label={t.qrPortal.fields.socialColor}>
                                        <div className="flex gap-2">
                                          <input
                                            type="color"
                                            value={link.color || "#10b981"}
                                            onChange={e => {
                                              const newLinks = [...formData.socialLinks];
                                              newLinks[idx].color = e.target.value;
                                              setFormData({ ...formData, socialLinks: newLinks });
                                            }}
                                            className="h-10 w-12 shrink-0 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer dark:border-slate-700 dark:bg-slate-900"
                                          />
                                          <input
                                            className={scInput}
                                            value={link.color || ""}
                                            onChange={e => {
                                              const newLinks = [...formData.socialLinks];
                                              newLinks[idx].color = e.target.value;
                                              setFormData({ ...formData, socialLinks: newLinks });
                                            }}
                                            placeholder="#10b981"
                                          />
                                        </div>
                                      </Field>
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="space-y-2">
                                      <span className="text-xs font-bold text-slate-650 dark:text-slate-400 block mb-1">
                                        {t.qrPortal.fields.socialIcon}
                                      </span>
                                      <ImageUploadField
                                        value={link.icon}
                                        onChange={path => {
                                          const newLinks = [...formData.socialLinks];
                                          newLinks[idx].icon = path;
                                          setFormData({ ...formData, socialLinks: newLinks });
                                        }}
                                        previewFit="contain"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </SubCard>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Legacy fallbacks section for backward compatibility */}
                      <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-100 dark:border-slate-800 pt-8 mt-8">
                        <SubCard>
                          <h4 className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-wider">Facebook (Legacy Static Fallback)</h4>
                          <div className="space-y-4">
                            <Field label={t.qrPortal.fields.facebook}>
                              <input
                                className={scInput}
                                value={formData.facebook}
                                onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                                placeholder="https://facebook.com/..."
                              />
                            </Field>
                            <Field label={t.qrPortal.fields.facebookName}>
                              <input
                                className={scInput}
                                value={formData.facebookName}
                                onChange={e => setFormData({ ...formData, facebookName: e.target.value })}
                                placeholder="Zevtabs"
                              />
                            </Field>
                          </div>
                        </SubCard>

                        <SubCard>
                          <h4 className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-wider">Instagram (Legacy Static Fallback)</h4>
                          <div className="space-y-4">
                            <Field label={t.qrPortal.fields.instagram}>
                              <input
                                className={scInput}
                                value={formData.instagram}
                                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                placeholder="https://instagram.com/..."
                              />
                            </Field>
                            <Field label={t.qrPortal.fields.instagramName}>
                              <input
                                className={scInput}
                                value={formData.instagramName}
                                onChange={e => setFormData({ ...formData, instagramName: e.target.value })}
                                placeholder="zevtabs_official"
                              />
                            </Field>
                          </div>
                        </SubCard>
                      </div>
                    </div>
                  </EditorSection>
                )}

                {tab === "descriptions" && (
                  <EditorSection 
                    id="descriptions" 
                    title={t.qrPortal.sections.descriptions}
                  >
                    <div className="space-y-6">
                      {/* Section Toggle */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {t.qrPortal.visibility.hideDescription}
                          </label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.qrPortal.fields.hideDescription}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.hideDescription}
                          onChange={e => setFormData({ ...formData, hideDescription: e.target.checked })}
                          className="h-5 w-5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800 w-fit">
                          <button
                            type="button"
                            onClick={() => setContentLang("mn")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${contentLang === 'mn' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            <Globe size={14} /> Монгол
                          </button>
                          <button
                            type="button"
                            onClick={() => setContentLang("en")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${contentLang === 'en' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            <Globe size={14} /> English
                          </button>
                        </div>
                        
                        <Field label={contentLang === 'mn' ? t.qrPortal.fields.descPlaceholder('mn') : t.qrPortal.fields.descPlaceholder('en')}>
                          <textarea
                            value={formData.description[contentLang]}
                            onChange={e => {
                              const newDesc = { ...formData.description, [contentLang]: e.target.value };
                              setFormData({ ...formData, description: newDesc });
                            }}
                            rows={8}
                            className={scTextarea("min-h-[200px]")}
                            placeholder={t.qrPortal.fields.descPlaceholder(contentLang)}
                          />
                        </Field>
                      </div>
                    </div>
                  </EditorSection>
                )}

                {tab === "branding" && (
                  <EditorSection 
                    id="branding" 
                    title={t.qrPortal.sections.branding}
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label={t.qrPortal.fields.color}>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={formData.color}
                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                            className="h-11 w-14 shrink-0 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer dark:border-slate-700 dark:bg-slate-900"
                          />
                          <input
                            className={scInput}
                            value={formData.color}
                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                          />
                        </div>
                      </Field>
                      <Field label={t.qrPortal.fields.glow}>
                        <input
                          className={scInput}
                          value={formData.glow}
                          onChange={e => setFormData({ ...formData, glow: e.target.value })}
                          placeholder="rgba(59, 130, 246, 0.5)"
                        />
                      </Field>
                    </div>
                  </EditorSection>
                )}
              </EditorBody>
            </div>

            <PrimarySave 
              disabled={saving} 
              onClick={handleSave}
            >
              {saving ? t.qrPortal.messages.saving : <><Save className="mr-2 h-4 w-4" /> {t.siteContent.common.saveTab(t.qrPortal.title)}</>}
            </PrimarySave>
          </EditorSurface>
        </div>
      </div>
    </div>
  );
}
