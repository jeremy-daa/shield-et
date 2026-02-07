import { Button } from "@heroui/react";
import { Phone, Navigation } from "lucide-react";
import { useSafety } from "@/context/SafetyContext";
import { SupportResource } from "./types";

export const DetailPrimaryActions = ({ res }: { res: SupportResource }) => {
    const { t } = useSafety();
    
    return (
        <div className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-1.5 flex gap-2 backdrop-blur-sm">
             <Button 
                size="lg"
                className="flex-1 h-12 bg-white text-black font-bold text-sm shadow-[0_2px_15px_rgba(255,255,255,0.1)] rounded-2xl"
                onPress={() => window.open(`tel:${res.phone}`)}
             >
                 <div className="flex items-center gap-2">
                    <Phone size={16} className="fill-current" />
                    <span className="mt-0.5">{t('call_now' as any) || 'Call Now'}</span>
                 </div>
             </Button>
             
             <Button 
                size="lg"
                className="flex-1 h-12 bg-zinc-800 text-zinc-200 font-medium text-sm border border-zinc-700/50 hover:bg-zinc-700 transition-colors rounded-2xl"
                onPress={() => {
                     const query = res.lat && res.lng ? `${res.lat},${res.lng}` : encodeURIComponent(`${res.name} ${res.location}`);
                     window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                }}
             >
                 <div className="flex items-center gap-2">
                    <Navigation size={16} />
                    <span className="mt-0.5">{t('navigate' as any) || 'Navigate'}</span>
                 </div>
             </Button>
         </div>
    );
};
