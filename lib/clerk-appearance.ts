import { dark } from "@clerk/themes";

export function getClerkAppearance(isDark: boolean) {
  return {
    theme: isDark ? dark : undefined,
    variables: isDark
      ? {
          colorPrimary: "#6366f1", // Modern indigo-500
          colorBackground: "#121826", // Obsidian dark card surface
          colorInput: "#182032", // Elevated input surface
          colorInputForeground: "#f8fafc",
          colorForeground: "#f8fafc",
          colorMutedForeground: "#94a3b8",
          colorNeutral: "#cbd5e1",
          borderRadius: "0.875rem",
          fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
        }
      : {
          colorPrimary: "#4f46e5",
          colorBackground: "#ffffff",
          colorInput: "#ffffff",
          colorInputForeground: "#0f172a",
          colorForeground: "#0f172a",
          colorMutedForeground: "#64748b",
          borderRadius: "0.875rem",
          fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
        },
    elements: {
      rootBox: "w-full max-w-md mx-auto",
      card: "shadow-2xl shadow-indigo-950/20 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] border border-zinc-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-[#121826]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8",
      headerTitle: "text-xl font-bold tracking-tight text-zinc-900 dark:text-white",
      headerSubtitle: "text-xs sm:text-sm text-zinc-500 dark:text-slate-400",
      socialButtonsBlockButton:
        "rounded-xl border border-zinc-200 dark:border-slate-700/80 bg-zinc-50 dark:bg-[#182032] text-zinc-800 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-[#1e293b] hover:border-zinc-300 dark:hover:border-slate-600 transition-all font-medium py-2.5 shadow-2xs cursor-pointer",
      socialButtonsBlockButtonText:
        "text-zinc-700 dark:text-slate-200 font-medium text-sm",
      dividerLine: "bg-zinc-200 dark:bg-slate-800",
      dividerText:
        "text-zinc-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold",
      formFieldLabel:
        "text-xs font-semibold text-zinc-700 dark:text-slate-300 tracking-wide mb-1",
      formFieldInput:
        "rounded-xl border border-zinc-200 dark:border-slate-700/80 bg-white dark:bg-[#182032] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all py-2.5 px-3.5 text-sm",
      formButtonPrimary:
        "rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all py-2.5 active:scale-[0.98] cursor-pointer",
      footer:
        "border-t border-zinc-100 dark:border-slate-800/80 mt-5 pt-4 bg-transparent",
      footerActionText: "text-zinc-500 dark:text-slate-400 text-xs sm:text-sm",
      footerActionLink:
        "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline cursor-pointer",
      identityPreview:
        "border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-[#182032] rounded-xl",
      identityPreviewText: "text-zinc-900 dark:text-white font-medium",
      identityPreviewEditButton:
        "text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer",
      formFieldAction:
        "text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium cursor-pointer",
      formFieldSuccessText: "text-emerald-500 text-xs mt-1",
      formFieldErrorText: "text-rose-500 text-xs mt-1",
      alert:
        "rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs p-3",
      alertText: "text-rose-200 text-xs",
      otpCodeFieldInput:
        "rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#182032] text-zinc-900 dark:text-white focus:border-indigo-500",
    },
  };
}
