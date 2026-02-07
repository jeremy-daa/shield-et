import { useRef, useEffect } from "react";

export const useHaptic = () => {
    const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning') => {
        if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
            if (type === 'error' || type === 'success' || type === 'warning') {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
            } else {
                window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
            }
        }
    };
    return { triggerHaptic };
};
