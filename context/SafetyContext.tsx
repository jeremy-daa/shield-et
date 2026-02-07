// -----------------------------------------------------------------------------
// SafetyContext.tsx - PIN-Based Authentication with Supabase
// -----------------------------------------------------------------------------
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import en from "../locales/en.json";
import am from "../locales/am.json";
import om from "../locales/om.json";

export type Locale = "en" | "am" | "om";
export type CalendarType = "gc" | "ec";
type TranslationKey = keyof typeof en;

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  am,
  om,
};

interface SafetyContextType {
  isSecure: boolean;
  isAuthReady: boolean;
  language: Locale;
  calendar: CalendarType;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Locale) => void;
  setCalendar: (cal: CalendarType) => void;
  formatDate: (dateString: string, includeTime?: boolean) => string;
  triggerAuthFlow: (pin: string) => Promise<boolean>;
  quickExit: () => void;
  userId: string | null;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

// Helper to set cookies for SSR support
const setCookie = (name: string, value: string) => {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
};

interface SafetyProviderProps {
  children: React.ReactNode;
  initialLanguage?: Locale;
  initialCalendar?: CalendarType;
}

export const SafetyProvider = ({
  children,
  initialLanguage = "en",
  initialCalendar = "ec",
}: SafetyProviderProps) => {
  const [isSecure, setIsSecure] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize language from props/localStorage
  const [language, setLanguage] = useState<Locale>(() => {
    if (initialLanguage && ["en", "am", "om"].includes(initialLanguage))
      return initialLanguage;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shield_lang");
      if (saved && ["en", "am", "om"].includes(saved)) return saved as Locale;
    }
    return "en";
  });

  // Initialize calendar from props/localStorage
  const [calendar, setCalendar] = useState<CalendarType>(() => {
    if (initialCalendar && ["gc", "ec"].includes(initialCalendar))
      return initialCalendar;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shield_cal");
      if (saved && ["gc", "ec"].includes(saved)) return saved as CalendarType;
    }
    return "ec";
  });

  const router = useRouter();

  // Restore Session on Mount
  useEffect(() => {
    console.log("[SafetyContext] === CHECKING SUPABASE SESSION ===");

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("[SafetyContext] ✅ Valid session found:", session.user.id);
        setUser(session.user);
        setUserId(session.user.id);

        // Restore preferences from user metadata
        const metadata = session.user.user_metadata;
        if (
          metadata.pref_language &&
          ["en", "am", "om"].includes(metadata.pref_language)
        ) {
          setLanguage(metadata.pref_language);
          localStorage.setItem("shield_lang", metadata.pref_language);
        }
        if (
          metadata.pref_calendar &&
          ["gc", "ec"].includes(metadata.pref_calendar)
        ) {
          setCalendar(metadata.pref_calendar);
          localStorage.setItem("shield_cal", metadata.pref_calendar);
        }
      } else {
        console.log("[SafetyContext] No active session");
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(
        "[SafetyContext] Auth state changed:",
        _event,
        session?.user?.id,
      );
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
      } else {
        setUser(null);
        setUserId(null);
        setIsSecure(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isFlowRunning = useRef(false);

  // Helper: Translate function
  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };

  // Helper: Format dates
  const formatDate = (dateString: string, includeTime = false) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const timeOptions = includeTime
      ? { hour: "2-digit" as const, minute: "2-digit" as const }
      : {};

    let formatted: string;
    if (calendar === "ec") {
      formatted = new Intl.DateTimeFormat(
        language === "am" ? "am-ET" : "en-ET",
        {
          calendar: "ethiopic",
          year: "numeric",
          month: "long",
          day: "numeric",
          ...timeOptions,
        },
      ).format(date);
    } else {
      formatted = new Intl.DateTimeFormat(
        language === "am" ? "am-ET" : language === "om" ? "om-ET" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          ...timeOptions,
        },
      ).format(date);
    }

    return formatted.replace(/ERA\d+\s?/, "").trim();
  };

  // ---------------------------------------------------------------------------
  // PIN-BASED AUTHENTICATION FLOW (SUPABASE)
  // ---------------------------------------------------------------------------
  const triggerAuthFlow = async (pin: string): Promise<boolean> => {
    if (isFlowRunning.current) return false;
    isFlowRunning.current = true;

    console.log("[SafetyContext] === STARTING SUPABASE PIN-BASED AUTH ===");

    // Haptic feedback
    if (
      typeof window !== "undefined" &&
      window.Telegram?.WebApp?.HapticFeedback
    ) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
    }

    try {
      // --- Phase 1: Extract Telegram Identity ---
      // @ts-ignore
      const tgUser =
        typeof window !== "undefined"
          ? window.Telegram?.WebApp?.initDataUnsafe?.user
          : null;

      if (!tgUser || !tgUser.id) {
        console.error("[SafetyContext] ❌ No Telegram user detected");
        return false;
      }

      const userIdStr = String(tgUser.id);
      const email = `user-${userIdStr}@shieldet.app`;

      console.log(`[SafetyContext] Telegram ID: ${userIdStr}`);

      // --- Phase 2: Hash PIN with Salt (Deterministic SHA-256) ---
      const encoder = new TextEncoder();
      const saltedPin = `${pin}-${userIdStr}`;
      const data = encoder.encode(saltedPin);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      console.log("[SafetyContext] PIN hashed with SHA-256");

      // --- Phase 3: Attempt Login ---
      console.log("[SafetyContext] Attempting sign in...");
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        console.log("[SafetyContext] Sign in failed:", signInError.message);

        // Invalid credentials - try to create account
        if (signInError.message.includes("Invalid login credentials")) {
          console.log("[SafetyContext] 🔧 Attempting to create new account...");

          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  telegram_id: tgUser.id,
                  first_name: tgUser.first_name || "User",
                  pref_language: language,
                  pref_calendar: calendar,
                },
              },
            });

          if (signUpError) {
            console.error("[SafetyContext] ❌ Sign up failed:", signUpError);

            // Account exists but wrong password
            if (signUpError.message.includes("already registered")) {
              console.error("[SafetyContext] ❌ Wrong PIN - account exists");
              if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred(
                  "error",
                );
              }
              return false;
            }

            throw signUpError;
          }

          console.log("[SafetyContext] ✅ Account created successfully!");
          setUser(signUpData.user);
          setUserId(signUpData.user?.id || null);
        } else {
          throw signInError;
        }
      } else {
        console.log("[SafetyContext] ✅ Sign in successful!");
        setUser(signInData.user);
        setUserId(signInData.user?.id || null);
      }

      // --- Phase 4: Success - Setup Session ---
      setIsSecure(true);
      setIsAuthReady(false);

      // Success haptic
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }

      console.log(
        "[SafetyContext] ✅ AUTH COMPLETE - Redirecting to dashboard",
      );
      router.push("/dashboard");
      return true;
    } catch (e: any) {
      console.error("[SafetyContext] ❌ AUTH FAILED:", e);

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }

      return false;
    } finally {
      isFlowRunning.current = false;
    }
  };

  // ---------------------------------------------------------------------------
  // QUICK EXIT
  // ---------------------------------------------------------------------------
  const wipeLocalState = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("shield_lang");
      localStorage.removeItem("shield_cal");
    }
  };

  const quickExit = async () => {
    console.log("[SafetyContext] 🚪 Quick exit triggered");

    setIsSecure(false);
    setIsAuthReady(false);
    setUserId(null);
    setUser(null);

    // Sign out from Supabase
    await supabase.auth.signOut();

    wipeLocalState();
    router.push("/");
  };

  // ---------------------------------------------------------------------------
  // LANGUAGE/CALENDAR HANDLERS
  // ---------------------------------------------------------------------------
  const handleSetLanguage = async (lang: Locale) => {
    setLanguage(lang);
    localStorage.setItem("shield_lang", lang);
    setCookie("lang", lang);

    if (user) {
      try {
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            pref_language: lang,
          },
        });
      } catch (e) {
        console.error("Failed to update language preference", e);
      }
    }
  };

  const handleSetCalendar = async (cal: CalendarType) => {
    setCalendar(cal);
    localStorage.setItem("shield_cal", cal);
    setCookie("cal", cal);

    if (user) {
      try {
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            pref_calendar: cal,
          },
        });
      } catch (e) {
        console.error("Failed to update calendar preference", e);
      }
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        isSecure,
        isAuthReady,
        language,
        calendar,
        t,
        setLanguage: handleSetLanguage,
        setCalendar: handleSetCalendar,
        formatDate,
        triggerAuthFlow,
        quickExit,
        userId,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error("useSafety must be used within a SafetyProvider");
  }
  return context;
};
