"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Camera, Mic, MapPin, Scale, DoorOpen, ShieldCheck } from "lucide-react";
import { useSafety } from "../../../context/SafetyContext";

export default function DashboardPage() {
  const { quickExit } = useSafety();
  const handleCamera = () => {
    // Component A: Camera Trigger logic will go here
    console.log("Open Camera");
  };

  const handleExit = () => {
      // Component C: Haptic + Exit
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }
      quickExit();
  };

  const actions = [
      { name: "Secure Photo", icon: Camera, color: "text-blue-400", onClick: handleCamera },
      { name: "Audio Note", icon: Mic, color: "text-purple-400", onClick: () => {} },
      { name: "Emergency Map", icon: MapPin, color: "text-red-400", onClick: () => {} },
      { name: "Legal Help", icon: Scale, color: "text-yellow-400", onClick: () => {} },
  ];
  
  const [greeting, setGreeting] = useState("Stay strong, you are safe here.");

  useEffect(() => {
      const greetings = [
          "Stay strong, you are safe here.",
          "Your voice matters.",
          "Silence is your shield.",
          "Courage is whispering."
      ];
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);

  return (
    <div className="p-4 space-y-6">
       {/* Component B: Header */}
       <header className="flex justify-between items-start mt-4">
           <div>
               <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                   {greeting}
               </h1>
               <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                   <ShieldCheck size={12} className="text-green-400" />
                   <span className="text-[10px] font-bold text-green-400 tracking-wider uppercase">Encrypted & Anonymous</span>
               </div>
           </div>
       </header>

       {/* Component A: Action Grid */}
       <section className="grid grid-cols-2 gap-3">
           {actions.map((action) => {
               const Icon = action.icon;
               return (
                   <Card 
                     key={action.name} 
                     isPressable 
                     onPress={action.onClick}
                     className="bg-zinc-900/40 border border-white/5 backdrop-blur-md"
                   >
                       <CardBody className="flex flex-col items-center justify-center gap-3 py-8">
                           <div className={`p-3 rounded-full bg-white/5 ${action.color}`}>
                               <Icon size={28} />
                           </div>
                           <span className="text-sm font-medium text-zinc-300">{action.name}</span>
                       </CardBody>
                   </Card>
               );
           })}
       </section>

       {/* Component C: Stealth Exit FAB */}
       <div className="fixed bottom-24 right-4 z-[60]">
           <Button
              isIconOnly
              color="danger"
              variant="shadow"
              className="w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.4)]"
              onPress={handleExit}
           >
               <DoorOpen size={24} />
           </Button>
       </div>
    </div>
  );
}
