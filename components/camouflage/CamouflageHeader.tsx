"use client";

import React, { useRef, useState } from "react";
import { useDisclosure } from "@heroui/react";
import { PinModal } from "./PinModal";

export const CamouflageHeader = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const handlePointerDown = (e: React.SyntheticEvent) => {
    // Prevent double firing (touch + mouse) or multi-touch
    if (timerRef.current) return;
    
    console.log("Input Start:", e.type);
    setIsPressing(true);
    
    timerRef.current = setTimeout(() => {
      console.log("Long Press Complete - Opening Modal");
      onOpen();
      setIsPressing(false);
      timerRef.current = null; // Mark as completed so Up doesn't try to clear it
    }, 3000); 
  };

  const handlePointerUp = (e: React.SyntheticEvent) => {
    console.log("Input End/Leave:", e.type);
    if (timerRef.current) {
      console.log("Timer cleared");
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
            className="relative select-none cursor-default active:scale-95 transition-transform"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onContextMenu={(e) => { e.preventDefault(); console.log("Context menu prevented"); }}
        >
          <div className={`transition-opacity duration-300 ${isPressing ? "opacity-50" : "opacity-100"}`}>
             <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
                <span className="w-8 h-8 bg-foreground text-background flex items-center justify-center rounded-lg font-serif">S</span>
                <span>Shield News</span>
             </h1>
          </div>
        </div>
        
        <div className="text-xs text-zinc-500 font-mono">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
      <PinModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </header>
  );
};
