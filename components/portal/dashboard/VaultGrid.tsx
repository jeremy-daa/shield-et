"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Lock, Map, Briefcase, Scale, PlayCircle, ShieldCheck } from "lucide-react";
import { useSafety } from "../../../context/SafetyContext";
import { useSafetyProgress } from "../../../context/SafetyProgressContext";
import { useHaptic } from "../../../hooks/useHaptic";
import { useRouter } from "next/navigation";

export const VaultGrid = () => {
    const { t } = useSafety();
    const { totalReadiness } = useSafetyProgress();
    const { triggerHaptic } = useHaptic();
    const router = useRouter();

    return (
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2 px-1">
               <ShieldCheck size={14} className="text-zinc-500" />
               <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Information Grid</h2>
           </div>
           
           <div className="grid grid-cols-2 gap-3">

               {/* 1. Evidence Vault */}
               <Button 
                 onPress={() => { triggerHaptic('light'); router.push('/dashboard/vault'); }} 
                 className="h-28 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 active:scale-95 transition-all p-3 flex flex-col items-start justify-between group"
               >
                   <div className="w-full flex justify-between items-start">
                       <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                           <Lock size={18} />
                       </div>
                       <span className="text-[9px] font-mono text-purple-500/80 bg-purple-500/5 px-1.5 py-0.5 rounded">2h ago</span>
                   </div>
                   <div className="flex flex-col items-start">
                       <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{t('vault_title')}</span>
                       <span className="text-[9px] text-zinc-500">Secure Storage</span>
                   </div>
               </Button>

               {/* 2. Support Map */}
               <Button 
                 onPress={() => { triggerHaptic('light'); router.push('/dashboard/map'); }} 
                 className="h-28 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 active:scale-95 transition-all p-3 flex flex-col items-start justify-between group"
               >
                   <div className="w-full flex justify-between items-start">
                       <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                           <Map size={18} />
                       </div>
                       <span className="text-[9px] font-mono text-emerald-500/80 bg-emerald-500/5 px-1.5 py-0.5 rounded">1.2 km</span>
                   </div>
                   <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{t('map_preview')}</span>
                        <span className="text-[9px] text-zinc-500">Nearest verified NGO</span>
                   </div>
               </Button>

               {/* 3. Safety Plan */}
               <Button 
                 onPress={() => { triggerHaptic('light'); router.push('/safety-plan'); }} 
                 className="h-28 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 active:scale-95 transition-all p-3 flex flex-col items-start justify-between group"
               >
                   <div className="w-full flex justify-between items-start">
                       <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                           <Briefcase size={18} />
                       </div>
                       <span className="text-[9px] font-mono text-orange-500/80">{totalReadiness}%</span>
                   </div>
                   
                   <div className="w-full flex flex-col items-start gap-1.5">
                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{t('safety_plan' as any) || 'Safety Plan'}</span>
                        {/* Custom Mini Progress */}
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${totalReadiness}%` }} />
                        </div>
                   </div>
               </Button>

               {/* 4. Legal Guide */}
               <Button 
                 onPress={() => triggerHaptic('light')} 
                 className="h-28 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 active:scale-95 transition-all p-3 flex flex-col items-start justify-between group"
               >
                   <div className="w-full flex justify-between items-start">
                       <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                           <Scale size={18} />
                       </div>
                       <PlayCircle size={14} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                   </div>
                   <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{t('chip_legal')}</span>
                        <span className="text-[9px] text-zinc-500">Know Your Rights</span>
                   </div>
               </Button>
           </div>
        </div>
    );
};
