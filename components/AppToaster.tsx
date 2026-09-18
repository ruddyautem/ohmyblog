"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

export default function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={theme as "light" | "dark"}
      richColors
      closeButton
      gap={10}
      offset={{ top: "28px", right: "24px" }}
      mobileOffset={{ top: "20px", left: "16px", right: "16px" }}
      toastOptions={{
        className:
          "font-sans rounded-2xl shadow-xl border border-zinc-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#121826]/95 backdrop-blur-md text-zinc-900 dark:text-slate-100",
        classNames: {
          toast:
            "rounded-2xl border border-zinc-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#121826]/95 backdrop-blur-md text-zinc-900 dark:text-slate-100 shadow-xl",
          title: "text-sm font-semibold text-zinc-900 dark:text-white",
          description: "text-xs text-zinc-500 dark:text-slate-400",
          actionButton:
            "rounded-xl bg-zinc-900 dark:bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5",
          cancelButton:
            "rounded-xl bg-zinc-100 dark:bg-[#182032] text-zinc-700 dark:text-slate-300 text-xs font-medium px-3 py-1.5",
          closeButton:
            "rounded-lg border border-zinc-200 dark:border-slate-700 bg-zinc-100 dark:bg-[#182032] text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors",
        },
      }}
    />
  );
}
