"use client";

import { useEffect } from 'react';
import { viewport } from '@telegram-apps/sdk';



export const useTelegramViewport = () => {
  useEffect(() => {
    const init = async () => {
       if (typeof window === 'undefined') return;

       try {
         // Check if running in Telegram
         // We verify if the Telegram WebApp object exists on window to avoid SDK errors
         if (window.Telegram?.WebApp) {
             window.Telegram.WebApp.ready();
             
             if (viewport.mount.isAvailable()) {
                // Ensure we are mounted
                 if (!viewport.isMounted()) {
                    await viewport.mount();
                 }
                
                if (viewport.bindCssVars.isAvailable()) {
                  viewport.bindCssVars();
                }
             }
         }
       } catch (e) {
         console.warn("Telegram SDK not available or failed to mount:", e);
       }
    };
    
    // Slight delay to ensure script load if race condition occurs
    if (typeof window !== 'undefined') {
        if (window.Telegram?.WebApp) {
            init();
        } else {
            window.addEventListener('load', init);
            setTimeout(init, 500); // Fallback retry
        }
    }

    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('load', init);
        }
    };
  }, []);
};
