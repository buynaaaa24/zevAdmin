"use client";

import { useEffect, useRef, useState } from "react";
import {
  ensureClientAuthorized,
  PERMISSION_DENIED_MN,
  withClientAdminAuth,
} from "@/lib/adminClientAuth";
import { getApiBaseUrl, getPublicFrontOrigin, getSocketBaseUrl, joinBackendRequestUrl } from "@/lib/api";
import { ImageIcon, Loader2, Upload } from "lucide-react";

/** Match backend `UPLOAD_MAX_MB` (default 15). Set `NEXT_PUBLIC_UPLOAD_MAX_MB` to keep UI in sync. */
const UPLOAD_MAX_MB =
  Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB ?? "100") || 100;
const UPLOAD_MAX_BYTES = Math.max(1, UPLOAD_MAX_MB) * 1024 * 1024;

const MSG_IMAGE_TOO_LARGE =
  "Файлын хэмжээ хэтэрсэн байна. Видеог 100МБ-аас бага эсвэл зургийг жижигрүүлж оруулна уу.";

function isVideo(path: string): boolean {
  return /\.(mp4|webm|ogg|mov)$/i.test(path);
}

function previewUrl(path: string): string {
  const p = path.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/upload/")) {
    return `${getSocketBaseUrl()}${p}`;
  }
  if (p.startsWith("/")) {
    return `${getPublicFrontOrigin()}${p}`;
  }
  return p;
}

export async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(
    joinBackendRequestUrl(getApiBaseUrl(), "/api/v1/admin/upload"),
    withClientAdminAuth({
      method: "POST",
      body: fd,
    }),
  );
  const gate = await ensureClientAuthorized(res);
  if (gate === "forbidden") {
    throw new Error(PERMISSION_DENIED_MN);
  }
  if (gate !== "ok") {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 413) {
      throw new Error(MSG_IMAGE_TOO_LARGE);
    }
    try {
      const j = JSON.parse(t) as { error?: { code?: string; message?: string } };
      if (j?.error?.code === "FILE_TOO_LARGE") {
        throw new Error(MSG_IMAGE_TOO_LARGE);
      }
      if (j?.error?.message) throw new Error(j.error.message);
    } catch (e) {
      if (e instanceof Error && e.message === MSG_IMAGE_TOO_LARGE) throw e;
    }
    throw new Error(t.slice(0, 200) || "Алдаа");
  }
  const json = (await res.json()) as { data?: { path?: string } };
  const path = json.data?.path;
  if (!path) throw new Error("Invalid response");
  return path;
}

type Props = {
  value: string;
  onChange: (path: string) => void;
  /** Show remove row button (e.g. slide list) */
  showRemove?: boolean;
  onRemove?: () => void;
  /**
   * Both preserve aspect ratio (`object-contain`). `cover` allows a taller preview (slides);
   * `contain` uses a smaller cap (logos, marks).
   * @default "cover"
   */
  previewFit?: "cover" | "contain";
};

export default function ImageUploadField({
  value,
  onChange,
  showRemove,
  onRemove,
  previewFit = "cover",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  /** Instant preview while upload runs; cleared once parent `value` matches uploaded path */
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const pendingPathRef = useRef<string | null>(null);

  useEffect(() => {
    const pending = pendingPathRef.current;
    if (!pending || !blobUrl) return;
    if (value.trim() === pending.trim()) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      pendingPathRef.current = null;
    }
  }, [value, blobUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    if (file.size > UPLOAD_MAX_BYTES) {
      setErr(
        `Файлын хэмжээ хэтэрсэн байна (хамгийн ихдээ ${UPLOAD_MAX_MB} МБ). Та файлаа жижигрүүлээд дахин оролдоно уу.`,
      );
      return;
    }
    const local = URL.createObjectURL(file);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return local;
    });
    setBusy(true);
    try {
      const path = await uploadImageFile(file);
      pendingPathRef.current = path;
      onChange(path);
    } catch (x) {
      const failedFetch =
        x instanceof TypeError && String(x.message).includes("fetch");
      const msg = failedFetch
        ? file.size > UPLOAD_MAX_BYTES
          ? MSG_IMAGE_TOO_LARGE
          : "Сүлжээний алдаа эсвэл зургийн хэмжээ хэтэрсэн байж магадгүй. Дахин оролдоно уу."
        : x instanceof Error
          ? x.message
          : "Алдаа";
      setErr(msg);
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      pendingPathRef.current = null;
    } finally {
      setBusy(false);
    }
  }

  const remoteSrc = previewUrl(value);
  const src = blobUrl ?? remoteSrc;
  const isVid = src ? isVideo(src) : false;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-700/90 dark:bg-zinc-950">
      <div
        className={`flex w-full items-center justify-center overflow-hidden bg-linear-to-b from-zinc-50 to-zinc-100/90 p-3 dark:from-zinc-900 dark:to-zinc-950 sm:p-4 ${
          previewFit === "contain" ? "min-h-[140px] sm:min-h-[160px]" : "min-h-[180px] sm:min-h-[220px]"
        }`}
      >
        {src ? (
          isVid ? (
            <video
              key={src}
              src={src}
              controls
              className="h-auto max-h-[min(85vh,1200px)] w-full max-w-full object-contain object-center"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- dynamic CMS URLs
            <img
              key={blobUrl ?? (value || "empty")}
              src={src}
              alt=""
              decoding="async"
              fetchPriority={blobUrl ? "high" : "auto"}
              className={
                previewFit === "contain"
                  ? "h-auto max-h-[min(50vh,280px)] w-full max-w-full object-contain object-center"
                  : "h-auto max-h-[min(85vh,1200px)] w-full max-w-full object-contain object-center"
              }
            />
          )
        ) : (
          <div
            className="flex w-full flex-col items-center justify-center gap-2 px-6 py-12 text-center text-zinc-400 dark:text-zinc-500"
          >
            <div className="rounded-full bg-zinc-200/80 p-4 dark:bg-zinc-800/80">
              <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden />
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Зураг эсвэл Видео оруулна уу</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 px-3 py-3 dark:border-zinc-800 sm:px-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onPick}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 sm:flex-none sm:justify-start"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-4 w-4 shrink-0" aria-hidden />
          )}
          Файл оруулах
        </button>
        {showRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-red-200/90 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Устгах
          </button>
        )}
      </div>

      {err && (
        <div className="border-t border-red-100 bg-red-50/50 px-4 py-3 dark:border-red-900/30 dark:bg-red-950/20">
          <div className="flex gap-2 text-red-600 dark:text-red-400">
            <div className="mt-0.5 shrink-0">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {err}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
