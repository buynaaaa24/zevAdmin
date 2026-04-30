"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_BASE_PATH } from "@/lib/adminBasePath";
import { writeClientAdminSession } from "@/lib/adminClientAuth";

type LoginErrorShape = {
  code?: string;
  message?: string;
};

function mapLoginError(code?: string, message?: string): string {
  const c = (code ?? "").toUpperCase();
  const m = (message ?? "").toLowerCase();
  if (c === "UNAUTHORIZED" || m.includes("invalid credentials")) {
    return "Incorrect username or password.";
  }
  if (c === "VALIDATION_ERROR") return "Please check your input and try again.";
  if (c === "NOT_FOUND") return "Server endpoint not found.";
  return "Login failed. Please try again.";
}

function parseLoginError(raw: unknown): LoginErrorShape {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as { error?: LoginErrorShape | string };
    if (typeof parsed.error === "string") {
      try {
        const nested = JSON.parse(parsed.error) as { error?: LoginErrorShape };
        return nested.error ?? {};
      } catch { return {}; }
    }
    return parsed.error ?? {};
  } catch { return {}; }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_BASE_PATH}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        token?: string;
        username?: string;
        displayName?: string;
        permissions?: string[];
        error?: string;
      };
      if (!res.ok) {
        const parsed = parseLoginError(json.error);
        setError(mapLoginError(parsed.code, parsed.message));
        return;
      }
      if (json.token) {
        const uname = typeof json.username === "string" ? json.username : "";
        const displayName =
          typeof json.displayName === "string" ? json.displayName : uname || "Admin";
        const permissions = Array.isArray(json.permissions)
          ? json.permissions.filter((x): x is string => typeof x === "string")
          : [];
        writeClientAdminSession(json.token, { username: uname, displayName, permissions });
      }
      router.replace("/zevtabs/dashboard/");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f5f5f7] px-4">
      {/* Card */}
      <div className="w-full max-w-[400px]">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <img src={`${ADMIN_BASE_PATH}/logo.png`} alt="Zevtabs" className="w-14 h-14 object-contain mb-4 shadow-sm rounded-xl" />
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Zevtabs Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your dashboard
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-[13px] font-medium text-gray-700 mb-1.5"
              >
                Username
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-200"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-[13px] font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-200"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-3 transition-all duration-200 shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Zevtabs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
