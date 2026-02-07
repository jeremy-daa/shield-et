"use client";

import React, { useEffect } from "react";

export const TelegramMinimizer = () => {
    useEffect(() => {
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
            try {
                // Telegram Bot API 8.0+ supports exiting fullscreen
                if ((window.Telegram.WebApp as any).exitFullscreen) {
                    (window.Telegram.WebApp as any).exitFullscreen();
                }
            } catch (e) {
                console.warn("Failed to exit fullscreen", e);
            }
        }
    }, []);

    return null; // This component handles side effects only
};
