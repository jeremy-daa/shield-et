"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardBody, Button, Chip, Divider, Code, ScrollShadow, useDisclosure } from "@heroui/react";
import { viewport } from "@telegram-apps/sdk";
import { account } from "../../../lib/appwrite";
import { useSafety } from "../../../context/SafetyContext";
import { PinModal } from "../../../components/camouflage/PinModal";
import { DoorOpen, Fingerprint, Lock, ShieldAlert } from "lucide-react";

export default function DebugPage() {
  // Telegram & Viewport State
  const [telegramStatus, setTelegramStatus] = useState<string>("Checking...");
  const [telegramData, setTelegramData] = useState<any>(null);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Appwrite State
  const [userSession, setUserSession] = useState<string>("Initializing...");
  const [error, setError] = useState<string>("");

  // Safety Context
  const { isSecure, isNewUser, quickExit } = useSafety();

  // Test Modal State
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // Custom Long Press Test State
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [longPressStatus, setLongPressStatus] = useState("Waiting...");

  /* -------------------
     1. Initialization
  ------------------- */
  useEffect(() => {
    // Telegram Check
    if (typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      if (tg && tg.initData) {
        setTelegramStatus("Detected");
        setTelegramData({
          version: tg.version,
          platform: tg.platform,
          initData: tg.initData,
          user: tg.initDataUnsafe?.user
        });
        tg.expand?.();
      } else {
        setTelegramStatus("Not Detected");
      }

      // Viewport Check
      const updateViewport = () => {
          setViewportHeight(window.innerHeight);
          if (viewport.isMounted()) {
              setIsExpanded(viewport.isExpanded());
          }
      };
      
      updateViewport();
      window.addEventListener("resize", updateViewport);
      
      // Attempt Mount
      try {
         if (viewport.mount.isAvailable() && !viewport.isMounted()) viewport.mount();
      } catch {}

      checkSession();
      return () => window.removeEventListener("resize", updateViewport);
    }
  }, []);

  /* -------------------
     2. Auth Helpers
  ------------------- */
  const checkSession = async () => {
    try {
      setError("");
      setUserSession("Checking...");
      const user = await account.get();
      setUserSession(`Active: ${user.$id} (${user.email || 'anon'})`);
    } catch (err: any) {
       setUserSession("No Active Session");
    }
  };

  const loginAnon = async () => {
      try {
          await account.createAnonymousSession();
          checkSession();
      } catch (e: any) { setError(e.message); }
  };
  
  const deleteSession = async () => {
      try {
          await account.deleteSession("current");
          checkSession();
      } catch (e: any) { setError(e.message); }
  }

  /* -------------------
     3. Long Press Logic (Replica)
  ------------------- */
  const handlePointerDown = () => {
    if (timerRef.current) return;
    setIsPressing(true);
    setLongPressStatus("Pressing...");
    
    timerRef.current = setTimeout(() => {
      setLongPressStatus("Triggered!");
      onOpen(); // Open real modal
      setIsPressing(false);
      timerRef.current = null;
    }, 3000); 
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setLongPressStatus("Cancelled (Released too early)");
    }
    setIsPressing(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-10 pb-20 px-4 gap-6">
       
        {/* Header */}
        <header>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                System Diagnostics
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Build v0.4.0 • Shield-ET</p>
        </header>

        {/* 1. Component Playground */}
        <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Component Tests</h2>
            
            {/* Long Press Test */}
            <Card className="border border-zinc-800 bg-zinc-900/50">
                <CardBody className="flex flex-row items-center justify-between gap-4">
                     <div 
                        className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 select-none cursor-pointer ${isPressing ? 'bg-red-500/20 scale-95 ring-2 ring-red-500' : 'bg-zinc-800'}`}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onTouchStart={handlePointerDown}
                        onTouchEnd={handlePointerUp}
                        onContextMenu={(e) => e.preventDefault()}
                     >
                         <Fingerprint size={24} className={isPressing ? "text-red-500 animate-pulse" : "text-zinc-500"} />
                     </div>
                     <div className="flex-1">
                         <h3 className="font-bold text-sm">Long Press Trigger</h3>
                         <p className="text-xs text-zinc-500 mb-1">Hold icon for 3 seconds.</p>
                         <Chip size="sm" variant="flat" color={longPressStatus === "Triggered!" ? "success" : "default"}>
                             {longPressStatus}
                         </Chip>
                     </div>
                </CardBody>
            </Card>

            {/* Direct Modal Trigger */}
            <div className="grid grid-cols-2 gap-3">
                <Button 
                    startContent={<Lock size={16}/>} 
                    onPress={onOpen}
                    variant="flat"
                    className="bg-zinc-800 text-white"
                >
                    Test Pin Modal
                </Button>
                
                <Button 
                    startContent={<DoorOpen size={16}/>} 
                    color="danger" 
                    variant="shadow"
                    onPress={quickExit}
                >
                    Test Quick Exit
                </Button>
            </div>
        </section>

        {/* 2. Security Context State */}
        <section className="space-y-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Safety Context</h2>
             <div className="grid grid-cols-2 gap-3">
                 <Card className="bg-zinc-900 border border-zinc-800">
                     <CardBody className="py-3">
                         <span className="text-xs text-zinc-500">Is New User?</span>
                         <p className={`font-mono font-bold ${isNewUser ? "text-primary" : "text-zinc-300"}`}>
                             {isNewUser ? "YES" : "NO"}
                         </p>
                     </CardBody>
                 </Card>
                 <Card className="bg-zinc-900 border border-zinc-800">
                     <CardBody className="py-3">
                         <span className="text-xs text-zinc-500">Is Secure?</span>
                         <p className={`font-mono font-bold ${isSecure ? "text-green-400" : "text-red-400"}`}>
                             {isSecure ? "UNLOCKED" : "LOCKED"}
                         </p>
                     </CardBody>
                 </Card>
             </div>
        </section>

        {/* 3. Session & Telegram Info */}
        <section className="space-y-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Environment & Auth</h2>
             
             <Card className="bg-zinc-900/50">
                 <CardBody className="gap-2">
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-zinc-400">Appwrite Session:</span>
                         <code className="bg-black px-1 py-0.5 rounded text-zinc-300 max-w-[150px] truncate">{userSession}</code>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-zinc-400">Telegram SDK:</span>
                         <span className={telegramStatus === "Detected" ? "text-green-500" : "text-orange-500"}>{telegramStatus}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-zinc-400">Viewport:</span>
                         <span>h: {viewportHeight}px / expanded: {isExpanded ? 'Y' : 'N'}</span>
                     </div>
                     
                     <Divider className="my-2 bg-zinc-800" />
                     
                     <div className="flex gap-2 justify-end">
                         <Button size="sm" variant="light" color="primary" onPress={checkSession}>Refresh</Button>
                         <Button size="sm" variant="light" color="warning" onPress={loginAnon}>Anon Login</Button>
                         <Button size="sm" variant="light" color="danger" onPress={deleteSession}>Nuclear Wipe</Button>
                     </div>
                     
                     {error && <p className="text-xs text-red-400 mt-2 bg-red-900/20 p-2 rounded">{error}</p>}
                 </CardBody>
             </Card>
        </section>

        <PinModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
}
