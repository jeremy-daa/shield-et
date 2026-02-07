"use client";

import React from "react";
import { Button } from "@heroui/react";
import { DoorOpen } from "lucide-react";
import { useSafety } from "../../context/SafetyContext";
import { useHaptic } from "../../hooks/useHaptic";

export const QuickExitFab = () => {
    const { quickExit } = useSafety();
    const { triggerHaptic } = useHaptic();

    const handleExit = () => {
        triggerHaptic('success');
        quickExit();
    };

    return (
       <div className="fixed bottom-24 right-4 z-[99]">
           <Button
              isIconOnly
              color="danger"
              variant="shadow"
              className="w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.4)] animate-pulse-slow active:scale-95 transition-transform flex items-center justify-center p-0 text-zinc-300"
              onPointerDown={handleExit}
           >
               <DoorOpen size={24} />
           </Button>
       </div>
    );
};
