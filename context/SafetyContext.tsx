"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';



import { account } from '../lib/appwrite';
import { viewport } from '@telegram-apps/sdk';

interface SafetyContextType {
  isSecure: boolean;
  isNewUser: boolean;
  setupPin: (pin: string) => Promise<boolean>;
  enterPortal: (pin: string) => Promise<boolean>;
  quickExit: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true); // Default to true until checked
  const router = useRouter();

  useEffect(() => {
      const initSafety = async () => {
          try {
              // 1. Ensure Session Exists
              try {
                  await account.get();
              } catch {
                  // No session, create anonymous
                  await account.createAnonymousSession();
              }

              // 2. Fetch Prefs for Pin Status
              const prefs = await account.getPrefs();
              if (prefs.vault_pin) {
                  setIsNewUser(false);
              } else {
                  setIsNewUser(true);
              }
          } catch (e) {
              console.error("Safety Init Failed", e);
              // Fallback: If everything fails, assume new user to allow setup attempt (which might fix session)
              setIsNewUser(true); 
          }
      };
      
      initSafety();
  }, []);

  const hashPin = async (pin: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const setupPin = async (pin: string): Promise<boolean> => {
      console.log("[SafetyContext] setupPin called");
      try {
          const hashedValue = await hashPin(pin);
          await account.updatePrefs({ vault_pin: hashedValue });
          setIsNewUser(false);
          setIsSecure(true);
          
          if (viewport.expand.isAvailable()) {
             viewport.expand();
          }
          router.push('/dashboard');
          return true;
      } catch (e) {
          console.error("Failed to setup PIN", e);
          return false;
      }
  };

  const enterPortal = async (pin: string): Promise<boolean> => {
    console.log("[SafetyContext] enterPortal called");
    try {
        const prefs = await account.getPrefs();
        const hashedInput = await hashPin(pin);
        
        // Strict check against hashed value
        if (prefs.vault_pin === hashedInput) { 
            setIsSecure(true);
            
            try {
                if (viewport.expand.isAvailable()) {
                    viewport.expand();
                }
            } catch (e) {
                console.warn("Viewport expansion failed", e);
            }

            router.push('/dashboard');
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Portal Entry Failed", error);
        return false;
    }
  };

  const quickExit = async () => {
    // Task 3: The 'Quick Exit' Wipe
    setIsSecure(false);
    
    try {
        await account.deleteSession('current');
    } catch (e) {
        console.error("Session delete failed", e);
    }

    if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
        window.location.replace('https://www.google.com'); 
    }
  };

  return (
    <SafetyContext.Provider value={{ isSecure, isNewUser, setupPin, enterPortal, quickExit }}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
