"use client";

import { useEffect } from "react";

/**
 * Light mode only. Dark theme is disabled — this guarantees the `dark` class is
 * never present on <html>, regardless of time of day or system preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return <>{children}</>;
}
