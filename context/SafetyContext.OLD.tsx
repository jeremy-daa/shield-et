// -----------------------------------------------------------------------------
// SafetyContext.tsx - Lazy Authentication & Vault Logic
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
  isNewUser: boolean;
  isAuthReady: boolean; // Signals "Ready for PIN Modal"
  language: Locale;
  calendar: CalendarType;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Locale) => void;
  setCalendar: (cal: CalendarType) => void;
  formatDate: (dateString: string, includeTime?: boolean) => string;
  triggerAuthFlow: () => Promise<void>; // The ONE trigger
  setupPin: (pin: string) => Promise<boolean>;
  enterPortal: (pin: string) => Promise<boolean>;
  quickExit: () => void;
  userId: string | null;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

// Helper to set cookies for Server Side Rendering support
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
  const [isNewUser, setIsNewUser] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize from Server Props (Cookies) -> Fallback to LocalStorage (Client) -> Fallback to Default
  const [language, setLanguage] = useState<Locale>(() => {
    // Prioritize Server Prop if valid (it will be passed from cookies)
    if (initialLanguage && ["en", "am", "om"].includes(initialLanguage))
      return initialLanguage;

    // Fallback to client storage if server missed it (e.g. cookie blocked but localstorage works)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shield_lang");
      if (saved && ["en", "am", "om"].includes(saved)) return saved as Locale;
    }
    return "en";
  });

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
      try {
        const user = await account.get();

        // Check if user is in guest/anonymous role
        if (!user.$id || user.$id === "" || user.$id.startsWith("anonymous")) {
          console.error(
            "[SafetyContext] Guest/anonymous session detected on mount - cleaning up",
          );
          // Delete the guest session
          try {
            await account.deleteSession("current");
          } catch (e) {}
          return;
        }

        setUserId(user.$id);
      } catch {
        // No active session - this is fine
      }
    };
    checkSession();
  }, []);

  const isFlowRunning = useRef(false);

  // Helper Translate Function
  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };

  const formatDate = (dateString: string, includeTime = false) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const timeOptions: Intl.DateTimeFormatOptions = includeTime
      ? { hour: "numeric", minute: "numeric", hour12: true }
      : {};

    let formatted = "";

    if (calendar === "ec") {
      // Ethiopian Calendar
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
      // Gregorian
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

    // Cleanup: Remove "ERA" or "Era" which appears in some browsers for Ethiopic
    return formatted.replace(/ERA\d+\s?/, "").trim();
  };

  // ---------------------------------------------------------------------------
  // 1. The Dormant Trigger (Entry Point)
  // ---------------------------------------------------------------------------
  const triggerAuthFlow = async () => {
    // Prevent double taps
    if (isFlowRunning.current) return;
    isFlowRunning.current = true;

    console.log("[SafetyContext] Triggering Auth Flow...");

    // Haptic: Immediate feedback on trigger
    if (
      typeof window !== "undefined" &&
      window.Telegram?.WebApp?.HapticFeedback
    ) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
    }

    try {
      // --- Phase 1: Identity Extraction ---
      // @ts-ignore
      const tgUser =
        typeof window !== "undefined"
          ? window.Telegram?.WebApp?.initDataUnsafe?.user
          : null;

      if (!tgUser || !tgUser.id) {
        console.error("[SafetyContext] No Telegram User Detected. Abort.");
        isFlowRunning.current = false;
        return;
      }

      const userIdStr = String(tgUser.id);
      const targetUserId = `tg-${userIdStr}`;
      const email = `${userIdStr}@shield-et.internal`;
      const password = `shield-identity-${userIdStr}-v1`; // Deterministic Secret

      console.log(`[SafetyContext] Target Identity: ${targetUserId}`);

      // --- Phase 2: Session Cleanup (Clean Slate Policy) ---
      try {
        console.log("[SafetyContext] Cleaning potential stale sessions...");
        await account.deleteSession("current");
        await new Promise((r) => setTimeout(r, 100));
      } catch (e: any) {}

      // --- Phase 3: Deterministic Auth (The Anchor) ---
      let user;
      try {
        // Step A: Convert TG ID -> Appwrite Session
        console.log("[SafetyContext] Attempting Login...");
        await account.createEmailPasswordSession(email, password);
        user = await account.get();
        console.log("[SafetyContext] Login Success!");
      } catch (loginError: any) {
        console.log(
          `[SafetyContext] Login Failed (${loginError.message}). Attempting Creation...`,
        );

        // Step B: Account doesn't exist? Create it.
        try {
          await account.create(
            targetUserId,
            email,
            password,
            `${tgUser.first_name || "Agent"}`,
          );

          // Login immediately after creation
          await account.createEmailPasswordSession(email, password);
          user = await account.get();
          console.log("[SafetyContext] Creation & Login Success!");
        } catch (createError: any) {
          // Step C: Race Condition (User Exists 409)
          if (
            createError.code === 409 ||
            createError.type === "user_already_exists"
          ) {
            console.log(
              "[SafetyContext] User exists (409) - Retrying Login...",
            );
            // One last try
            await account.createEmailPasswordSession(email, password);
            user = await account.get();
          } else {
            throw createError; // Fatal Error
          }
        }
      }

      // --- Phase 4: PIN & Prefs ---
      if (user) {
        // Validate user has proper account scopes (not guest role)
        if (!user.$id || user.$id === "" || user.$id.startsWith("anonymous")) {
          console.error(
            "[SafetyContext] User is in guest/anonymous role - cannot access preferences",
          );
          // Clean up the invalid session
          try {
            await account.deleteSession("current");
          } catch (e) {}

          isFlowRunning.current = false;

          // Haptic Error
          if (
            typeof window !== "undefined" &&
            window.Telegram?.WebApp?.HapticFeedback
          ) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
          }
          return;
        }

        setUserId(user.$id);
        console.log("[SafetyContext] Fetching Preferences...");

        let prefs;
        try {
          prefs = await account.getPrefs();
        } catch (prefsError: any) {
          // Handle guest role / scope errors when fetching preferences
          if (
            prefsError.code === 401 ||
            prefsError.type === "user_unauthorized" ||
            (prefsError.message &&
              (prefsError.message.includes("guest") ||
                prefsError.message.includes("scope")))
          ) {
            console.error(
              "[SafetyContext] Guest role detected when fetching prefs - cleaning up",
            );

            // Clean up the invalid session
            try {
              await account.deleteSession("current");
            } catch (e) {}

            isFlowRunning.current = false;

            // Haptic Error
            if (
              typeof window !== "undefined" &&
              window.Telegram?.WebApp?.HapticFeedback
            ) {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred(
                "error",
              );
            }
            return;
          }

          // Other errors - throw to outer catch
          throw prefsError;
        }

        // RESTORE PREFERENCES
        if (
          prefs.pref_language &&
          ["en", "am", "om"].includes(prefs.pref_language)
        ) {
          setLanguage(prefs.pref_language);
          if (typeof window !== "undefined")
            localStorage.setItem("shield_lang", prefs.pref_language);
        }
        if (prefs.pref_calendar && ["gc", "ec"].includes(prefs.pref_calendar)) {
          setCalendar(prefs.pref_calendar);
          if (typeof window !== "undefined")
            localStorage.setItem("shield_cal", prefs.pref_calendar);
        }

        if (prefs.vault_pin) {
          console.log("[SafetyContext] PIN Found -> Existing User");
          setIsNewUser(false);
        } else {
          console.log("[SafetyContext] No PIN -> New User");
          setIsNewUser(true);
        }

        // Only NOW are we ready for the UI to show the Modal
        setIsAuthReady(true);

        // Success Haptic
        if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.HapticFeedback
        ) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
      }
    } catch (e) {
      console.error("[SafetyContext] Auth Flow Failed", e);
      // Haptic Error
      if (
        typeof window !== "undefined" &&
        window.Telegram?.WebApp?.HapticFeedback
      ) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    } finally {
      isFlowRunning.current = false;
    }
  };

  const wipeLocalState = () => {
    console.log("[SafetyContext] Wiping Local State...");
    setIsSecure(false);
    setIsAuthReady(false);
    setUserId(null);
    // Fire and forget - do not await
    account
      .deleteSession("current")
      .catch((e) => console.warn("Session delete background fail", e));
  };

  const quickExit = () => {
    // 1. Instant State Kill
    wipeLocalState();

    // 2. Instant Navigation (SPA)
    // Using router.replace is faster than window.location.href
    // The TelegramMinimizer on camo page will handle the shrink.
    router.replace("/");
  };

  const handleSetLanguage = async (lang: Locale) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("shield_lang", lang);
      setCookie("shield_lang", lang);
    }

    try {
      const prefs = await account.getPrefs();
      await account.updatePrefs({ ...prefs, pref_language: lang });
    } catch (e) {}
  };

  const handleSetCalendar = async (cal: CalendarType) => {
    setCalendar(cal);
    if (typeof window !== "undefined") {
      localStorage.setItem("shield_cal", cal);
      setCookie("shield_cal", cal);
    }

    try {
      const prefs = await account.getPrefs();
      await account.updatePrefs({ ...prefs, pref_calendar: cal });
    } catch (e) {}
  };

  const hashPin = async (pin: string, salt: string = ""): Promise<string> => {
    const encoder = new TextEncoder();
    const saltedPin = salt ? `${pin}-${salt}` : pin;
    const data = encoder.encode(saltedPin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const setupPin = async (pin: string): Promise<boolean> => {
    try {
      // Step 1: Verify we have a valid user session
      let u;
      try {
        u = await account.get();
      } catch (userError) {
        console.error("[SafetyContext] No valid user session for PIN setup");
        return false;
      }

      if (!u || u.$id.startsWith("anonymous")) {
        console.error(
          "[SafetyContext] Anonymous or invalid user - cannot set PIN",
        );
        return false;
      }

      setUserId(u.$id);

      // Step 2: Check if PIN already exists (prevent overwrite)
      const prefs = await account.getPrefs();
      if (prefs.vault_pin) {
        console.warn(
          "[SafetyContext] PIN already exists - refusing to overwrite",
        );
        // Treat as existing user and redirect to enterPortal flow
        setIsNewUser(false);
        return false;
      }

      // Step 3: Set the new PIN
      const hashedValue = await hashPin(pin);
      await account.updatePrefs({ ...prefs, vault_pin: hashedValue });

      setIsNewUser(false);
      setIsSecure(true);
      router.push("/dashboard");
      return true;
    } catch (e) {
      console.error("[SafetyContext] setupPin error:", e);
      return false;
    }
  };

  const enterPortal = async (pin: string): Promise<boolean> => {
    try {
      // Step 1: Validate user exists and has active session
      let user;
      try {
        user = await account.get();

        // Check if user is in guest role (missing proper authentication)
        if (!user || user.$id === "" || user.$id.startsWith("anonymous")) {
          throw new Error("Guest or anonymous user detected");
        }
      } catch (userError: any) {
        // User deleted, guest role, or session invalid - reset auth state
        console.error(
          "[SafetyContext] User validation failed - resetting auth state",
          userError,
        );

        // Force session cleanup (handles guest role sessions)
        try {
          await account.deleteSession("current");
        } catch (e) {
          // Session might already be gone, ignore
        }

        wipeLocalState();
        setIsNewUser(true);
        // Trigger fresh auth flow
        setTimeout(() => triggerAuthFlow(), 100);
        return false;
      }

      // Step 2: Fetch preferences
      const prefs = await account.getPrefs();

      // Step 3: Check if PIN is actually set
      if (!prefs.vault_pin) {
        // User exists but no PIN set - treat as new user
        console.log(
          "[SafetyContext] User exists but no PIN found - treating as new user",
        );
        setIsNewUser(true);
        setIsAuthReady(true);
        return false;
      }

      // Step 4: Validate PIN
      const hashedInput = await hashPin(pin);

      if (prefs.vault_pin === hashedInput) {
        setIsSecure(true);
        router.push("/dashboard");
        return true;
      } else {
        // Wrong PIN - but user exists and has a PIN set
        return false;
      }
    } catch (error: any) {
      console.error("[SafetyContext] enterPortal error:", error);

      // Handle guest/scope errors specifically
      if (
        error.code === 401 ||
        error.type === "user_unauthorized" ||
        (error.message && error.message.includes("guest")) ||
        (error.message && error.message.includes("scope"))
      ) {
        console.error("[SafetyContext] Auth scope error - forcing cleanup");

        // Force session cleanup
        try {
          await account.deleteSession("current");
        } catch (e) {}

        wipeLocalState();
        setIsNewUser(true);
        setTimeout(() => triggerAuthFlow(), 100);
        return false;
      }

      // Generic error - don't reset auth state, just return false
      return false;
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        isSecure,
        isNewUser,
        isAuthReady,
        language,
        calendar,
        t,
        setLanguage: handleSetLanguage,
        setCalendar: handleSetCalendar,
        formatDate,
        triggerAuthFlow,
        setupPin,
        enterPortal,
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
