"use client";

import { HeroUIProvider } from "@heroui/react";
import { SafetyProvider } from "../context/SafetyContext";
import { useTelegramViewport } from "../hooks/useTelegramViewport";
import { useEffect, useState } from "react";
import { account } from "../lib/appwrite";

export function Providers({ children }: { children: React.ReactNode }) {
  useTelegramViewport();



  return (
    <HeroUIProvider>
      <SafetyProvider>
        {children}
      </SafetyProvider>
    </HeroUIProvider>
  );
}
