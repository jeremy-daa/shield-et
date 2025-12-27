export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
            user?: {
                id: number;
                first_name: string;
                last_name?: string;
                username?: string;
                language_code?: string;
                [key: string]: any;
            };
            [key: string]: any;
        };
        version?: string;
        platform?: string;
        ready: () => void;
        expand?: () => void;
        close?: () => void;
        HapticFeedback?: {
            notificationOccurred: (type: "error" | "success" | "warning") => void;
            selectionChanged: () => void;
            impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
        };
        // Add other properties as needed from Telegram SDK
      };
    };
  }
}
