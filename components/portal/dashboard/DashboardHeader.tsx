"use client";

import React from "react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Globe } from "lucide-react";
import { useSafety } from "../../../context/SafetyContext";
import { useHaptic } from "../../../hooks/useHaptic";

export const DashboardHeader = () => {
    const { t, language, setLanguage } = useSafety();
    const { triggerHaptic } = useHaptic();

    const [greetingKey, setGreetingKey] = React.useState<any>('greeting_default');

    React.useEffect(() => {
        // Randomize greeting on mount to avoid hydration mismatch
        const keys = ['greeting_default', 'greeting_guardian', 'greeting_protected', 'greeting_priority'];
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setGreetingKey(randomKey);
    }, []);

    return (
       <header className="flex justify-between items-center">
           <div className="flex flex-col">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Shield-ET</span>
               
               {/* Randomized Greeting */}
               <h1 className="text-xl font-bold text-white my-1 tracking-tight">
                   {t(greetingKey)}
               </h1>

               <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs font-semibold text-green-500/80 font-mono tracking-wider uppercase">{t('badge_encrypted')}</span>
               </div>
           </div>
           
           <Dropdown classNames={{ content: "bg-zinc-900 border border-zinc-700 min-w-[200px]" }}>
              <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm" className="text-zinc-500 hover:text-white" onPress={() => triggerHaptic('light')}>
                      <Globe size={20} />
                  </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Language" 
                onAction={(key) => {
                    triggerHaptic('medium');
                    setLanguage(key as any);
                }}
                selectedKeys={new Set([language])}
                selectionMode="single"
                itemClasses={{
                    base: "text-zinc-300 data-[hover=true]:bg-zinc-800 data-[hover=true]:text-white",
                    selectedIcon: "text-green-500"
                }}
              >
                  <DropdownItem key="en">English</DropdownItem>
                  <DropdownItem key="am">Amharic (አማርኛ)</DropdownItem>
                  <DropdownItem key="om">Oromifa</DropdownItem>
              </DropdownMenu>
           </Dropdown>
       </header>
    );
};
