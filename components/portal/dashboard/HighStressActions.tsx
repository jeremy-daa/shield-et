import React, { useState } from "react";
import { Button } from "@heroui/react";
import { Phone, Camera } from "lucide-react";
import { useSafety } from "../../../context/SafetyContext";
import { useHaptic } from "../../../hooks/useHaptic";
import { EmergencySOS } from "../EmergencySOS";
import { SecureCapture } from "../SecureCapture";

export const HighStressActions = () => {
    const { t } = useSafety();
    const { triggerHaptic } = useHaptic();
    const [isSOSOpen, setIsSOSOpen] = useState(false);
    const [isCamOpen, setIsCamOpen] = useState(false);

    const handleCamera = () => {
        triggerHaptic('success');
        setIsCamOpen(true);
    };
    
    const handleHotline = () => {
        triggerHaptic('heavy');
        setIsSOSOpen(true);
    };

    return (
       <>
           <section className="grid grid-cols-2 gap-3">
               {/* SOS Button */}
               <Button 
                 className="h-28 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 hover:border-red-500/20 active:scale-95 transition-all p-4 flex flex-col items-start justify-between group"
                 onPress={handleHotline}
               >
                   <div className="p-2 rounded-lg bg-red-500/5 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                       <Phone size={20} strokeWidth={2.5} />
                   </div>
                   <div className="flex flex-col items-start">
                       <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide group-hover:text-red-400 transition-colors">{t('call_hotline')}</span>
                       <span className="text-[9px] text-zinc-600 font-medium">Emergency</span>
                   </div>
               </Button>

               {/* Secure Capture Button */}
               <Button 
                 className="h-28 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 hover:border-blue-500/20 active:scale-95 transition-all p-4 flex flex-col items-start justify-between group"
                 onPress={handleCamera}
               >
                   <div className="p-2 rounded-lg bg-blue-500/5 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <Camera size={20} strokeWidth={2.5} />
                   </div>
                   <div className="flex flex-col items-start">
                       <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide group-hover:text-blue-400 transition-colors">{t('secure_capture')}</span>
                       <span className="text-[9px] text-zinc-600 font-medium">Evidence</span>
                   </div>
               </Button>
           </section>

           <EmergencySOS isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
           <SecureCapture isOpen={isCamOpen} onClose={() => setIsCamOpen(false)} />
       </>
    );
};
