// -----------------------------------------------------------------------------
// SafetyContextNew.tsx - PIN-Based Authentication with SHA-256 + Salt
// -----------------------------------------------------------------------------
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { account } from "../lib/appwrite";
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
    const checkSession = async () => {
      console.log("[SafetyContext] === SESSION CHECK ON MOUNT ===");
      try {
        console.log("[SafetyContext] Calling account.get()...");
        const user = await account.get();
        console.log("[SafetyContext] Session exists:", {
          id: user.$id,
          email: user.email,
        });

        // Check for guest/anonymous sessions
        if (!user.$id || user.$id === "" || user.$id.startsWith("anonymous")) {
          console.error("[SafetyContext] ❌ Guest session detected - deleting");
          try {
            await account.deleteSession("current");
            console.log("[SafetyContext] ✅ Guest session deleted");
          } catch (e) {
            console.error("[SafetyContext] Failed to delete session:", e);
          }
          return;
        }

        console.log("[SafetyContext] ✅ Valid session detected");
        setUserId(user.$id);
      } catch (error: any) {
        console.log(
          "[SafetyContext] No active session (expected on first load)",
        );
      }
      console.log("[SafetyContext] === SESSION CHECK COMPLETE ===");
    };
    checkSession();
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
  // PIN-BASED AUTHENTICATION FLOW
  // ---------------------------------------------------------------------------
  const triggerAuthFlow = async (pin: string): Promise<boolean> => {
    if (isFlowRunning.current) return false;
    isFlowRunning.current = true;

    console.log("[SafetyContext] === STARTING PIN-BASED AUTH ===");

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
      const targetUserId = `tg-${userIdStr}`;
      const email = `${userIdStr}@shield-et.internal`;

      console.log(`[SafetyContext] Identity: ${targetUserId}`);

      // --- Phase 2: Hash PIN with Salt (Deterministic SHA-256) ---
      // NOTE: We use SHA-256 with Telegram ID as salt for deterministic hashing
      // This ensures the same PIN always produces the same password for login
      const encoder = new TextEncoder();
      const saltedPin = `${pin}-${userIdStr}`;
      const data = encoder.encode(saltedPin);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      console.log("[SafetyContext] PIN hashed with SHA-256 + TG ID salt");

      // --- Phase 3: Clean Stale Sessions ---
      try {
        await account.deleteSession("current");
        await new Promise((r) => setTimeout(r, 150));
      } catch (e) {
        // No session to delete
      }

      // --- Phase 4: Attempt Login ---
      let user;
      try {
        console.log("[SafetyContext] Attempting login...");
        await account.createEmailPasswordSession(email, password);
        await new Promise((r) => setTimeout(r, 200));

        user = await account.get();
        console.log("[SafetyContext] ✅ LOGIN SUCCESS");
        console.log("[SafetyContext] User:", {
          id: user.$id,
          email: user.email,
        });

        // Verify not guest
        if (!user.$id || user.$id === "" || user.$id.startsWith("anonymous")) {
          throw new Error("Guest role after login");
        }
      } catch (loginError: any) {
        console.log(
          "[SafetyContext] ==========================================",
        );
        console.log("[SafetyContext] LOGIN FAILED - Detailed Error Info:");
        console.log("[SafetyContext] Error message:", loginError.message);
        console.log("[SafetyContext] Error code:", loginError.code);
        console.log("[SafetyContext] Error type:", loginError.type);
        console.log("[SafetyContext] Full error:", loginError);
        console.log(
          "[SafetyContext] ==========================================",
        );

        // Check if 401 (wrong PIN or user doesn't exist)
        if (
          loginError.code === 401 ||
          loginError.type === "user_invalid_credentials"
        ) {
          try {
            // Try to create account
            console.log(
              "[SafetyContext] 🔧 Attempting to create NEW account...",
            );
            console.log("[SafetyContext] User ID:", targetUserId);
            console.log("[SafetyContext] Email:", email);
            console.log("[SafetyContext] Name:", tgUser.first_name);

            const createResult = await account.create(
              targetUserId,
              email,
              password,
              `${tgUser.first_name || "User"}`,
            );

            console.log("[SafetyContext] ✅ Account CREATE SUCCESS!");
            console.log("[SafetyContext] Created user:", createResult);

            // Login after creation
            console.log(
              "[SafetyContext] 🔐 Now logging in with new credentials...",
            );
            const sessionResult = await account.createEmailPasswordSession(
              email,
              password,
            );
            console.log("[SafetyContext] ✅ Session created:", sessionResult);

            await new Promise((r) => setTimeout(r, 200));

            console.log("[SafetyContext] 👤 Fetching user details...");
            user = await account.get();
            console.log("[SafetyContext] ✅ User details retrieved:", {
              id: user.$id,
              email: user.email,
              name: user.name,
              labels: user.labels,
              status: user.status,
            });

            // CRITICAL CHECK: Is this a guest user?
            if (
              !user.$id ||
              user.$id === "" ||
              user.$id.startsWith("anonymous")
            ) {
              console.error(
                "[SafetyContext] ❌❌❌ CRITICAL: User is GUEST after successful creation!",
              );
              console.error(
                "[SafetyContext] Something is wrong with AppWrite configuration!",
              );
              throw new Error("Guest user created instead of proper user");
            }

            console.log("[SafetyContext] ✅✅✅ NEW ACCOUNT FLOW COMPLETE");
          } catch (createError: any) {
            console.log(
              "[SafetyContext] ==========================================",
            );
            console.log(
              "[SafetyContext] ACCOUNT CREATE FAILED - Detailed Error:",
            );
            console.log("[SafetyContext] Error message:", createError.message);
            console.log("[SafetyContext] Error code:", createError.code);
            console.log("[SafetyContext] Error type:", createError.type);
            console.log("[SafetyContext] Full error:", createError);
            console.log(
              "[SafetyContext] ==========================================",
            );

            if (
              createError.code === 409 ||
              createError.type === "user_already_exists"
            ) {
              // Account exists but PIN was wrong
              console.error(
                "[SafetyContext] ❌ Wrong PIN - account already exists",
              );
              if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred(
                  "error",
                );
              }
              return false;
            }
            console.error(
              "[SafetyContext] ❌ Unexpected create error - rethrowing",
            );
            throw createError;
          }
        } else {
          throw loginError;
        }
      }

      // --- Phase 5: Success - Setup Session ---
      if (user) {
        setUserId(user.$id);

        // Fetch and restore preferences
        try {
          const prefs = await account.getPrefs();

          if (
            prefs.pref_language &&
            ["en", "am", "om"].includes(prefs.pref_language)
          ) {
            setLanguage(prefs.pref_language);
            if (typeof window !== "undefined")
              localStorage.setItem("shield_lang", prefs.pref_language);
          }
          if (
            prefs.pref_calendar &&
            ["gc", "ec"].includes(prefs.pref_calendar)
          ) {
            setCalendar(prefs.pref_calendar);
            if (typeof window !== "undefined")
              localStorage.setItem("shield_cal", prefs.pref_calendar);
          }
        } catch (prefsError) {
          console.warn(
            "[SafetyContext] Could not fetch preferences:",
            prefsError,
          );
        }

        // Grant access
        setIsSecure(true);
        setIsAuthReady(false);

        // Success haptic
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }

        console.log("[SafetyContext] ✅ AUTH COMPLETE - Redirecting");
        router.push("/dashboard");
        return true;
      }

      return false;
    } catch (e) {
      console.error("[SafetyContext] ❌ AUTH FAILED", e);

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

  const quickExit = () => {
    setIsSecure(false);
    setIsAuthReady(false);
    setUserId(null);

    // Delete session
    try {
      account.deleteSession("current");
    } catch (e) {}

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

    if (userId) {
      try {
        const prefs = await account.getPrefs();
        await account.updatePrefs({ ...prefs, pref_language: lang });
      } catch (e) {
        console.error("Failed to update language preference", e);
      }
    }
  };

  const handleSetCalendar = async (cal: CalendarType) => {
    setCalendar(cal);
    localStorage.setItem("shield_cal", cal);
    setCookie("cal", cal);

    if (userId) {
      try {
        const prefs = await account.getPrefs();
        await account.updatePrefs({ ...prefs, pref_calendar: cal });
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
