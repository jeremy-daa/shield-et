"use client";

import { HeroUIProvider } from "@heroui/react";
import { SafetyProvider, Locale, CalendarType } from "../context/SafetyContext";
import { useTelegramViewport } from "../hooks/useTelegramViewport";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
  lang?: Locale;
  cal?: CalendarType;
}

export function Providers({ children, lang, cal }: ProvidersProps) {
  useTelegramViewport();

  return (
    <HeroUIProvider>
      <SafetyProvider initialLanguage={lang} initialCalendar={cal}>
        {children}
      </SafetyProvider>
    </HeroUIProvider>
  );
}
