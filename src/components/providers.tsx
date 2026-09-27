"use client";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

export function Providers({
  children,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultTheme: "dark" | "light" | "system";
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
