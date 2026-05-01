"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Smartphone, Globe, Instagram, Facebook, Layout } from "lucide-react";
import { ADMIN_BASE_PATH } from "@/lib/adminBasePath";
import { readClientAdminToken } from "@/lib/adminClientAuth";

export default function QrContentPage() {
  const params = useParams();
  const siteId = params?.siteId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<"mn" | "en">("mn");
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
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${ADMIN_BASE_PATH}/api-proxy/api/v1/site-pages/qr-portal?lang=mn&siteId=${siteId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.sections) {
            setFormData(prev => ({ ...prev, ...json.data.sections }));
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
      const res = await fetch(`${ADMIN_BASE_PATH}/api-proxy/api/v1/site-pages/qr-portal?siteId=${siteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${readClientAdminToken()}`
        },
        body: JSON.stringify({
          pageId: "qr-portal",
          siteId: siteId,
          sections: formData
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "QR Portal updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to save changes." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-zinc-500">Loading QR settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">QR Portal Content</h1>
          <p className="text-zinc-500 text-sm">Manage mobile app links and social identity for {siteId}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* App Store Links */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-bold">
            <Smartphone className="text-emerald-500" size={20} />
            <h2>App Store Links</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">iOS App URL</label>
              <input
                type="text"
                value={formData.ios}
                onChange={e => setFormData({ ...formData, ios: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                placeholder="https://apps.apple.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Android Play Store URL</label>
              <input
                type="text"
                value={formData.android}
                onChange={e => setFormData({ ...formData, android: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                placeholder="https://play.google.com/..."
              />
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-bold">
            <Globe className="text-blue-500" size={20} />
            <h2>Social Handles</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                  placeholder="URL"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Facebook Name (Display)</label>
                <input
                  type="text"
                  value={formData.facebookName}
                  onChange={e => setFormData({ ...formData, facebookName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                  placeholder="e.g. Zevtabs"
                />
              </div>
            </div>
            
            <hr className="border-zinc-100 dark:border-zinc-800" />

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                  placeholder="URL"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Instagram Name (Display)</label>
                <input
                  type="text"
                  value={formData.instagramName}
                  onChange={e => setFormData({ ...formData, instagramName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                  placeholder="e.g. zevtabs_official"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Descriptions */}
        <section className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold">
              <FileEdit className="text-amber-500" size={20} />
              <h2>Page Descriptions</h2>
            </div>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setLang("mn")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'mn' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
              >
                MN
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
              >
                EN
              </button>
            </div>
          </div>
          
          <textarea
            value={lang === 'mn' ? formData.description.mn : formData.description.en}
            onChange={e => {
              const newDesc = { ...formData.description, [lang]: e.target.value };
              setFormData({ ...formData, description: newDesc });
            }}
            rows={4}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm"
            placeholder={`Enter description in ${lang === 'mn' ? 'Mongolian' : 'English'}...`}
          />
        </section>

        {/* Branding */}
        <section className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-bold">
            <Layout className="text-purple-500" size={20} />
            <h2>Visual Branding</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Theme Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-10 rounded-lg overflow-hidden cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Ambient Glow Color (RGBA/HEX)</label>
              <input
                type="text"
                value={formData.glow}
                onChange={e => setFormData({ ...formData, glow: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                placeholder="rgba(0,0,0,0.5)"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import { FileEdit } from "lucide-react";
