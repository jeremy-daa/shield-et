import { Button } from "@heroui/react";
import { LocateFixed, MapPin, Navigation } from "lucide-react";
import { useSafety } from "@/context/SafetyContext";
import { SupportResource } from "./types";

export const DetailMapSection = ({ res }: { res: SupportResource }) => {
    const { t } = useSafety();
    
    return (
        <div className="flex flex-col gap-3 w-full mt-2">
            <div className="flex items-center mb-1">
                 <div className="w-fit flex items-center gap-2 py-2 px-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                    <LocateFixed size={12} className="text-zinc-500 shrink-0" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        {t('location_map' as any) || 'Location Map'}
                    </span>
                 </div>
            </div>
            
            <div 
                style={{ height: '350px' }}
                className="w-full h-[400px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 relative group shadow-2xl shadow-black/50"
            >
                {res.lat && res.lng ? (
                    <>
                        <iframe 
                            className="w-full h-full opacity-60 grayscale-[0.8] contrast-125 invert-[0.9] hue-rotate-180 transition-opacity duration-500 group-hover:opacity-80" 
                            src={`https://maps.google.com/maps?q=${res.lat},${res.lng}&hl=en&z=15&output=embed`}
                            loading="lazy"
                            title="Map View"
                        />
                        
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40 bg-zinc-950">
                        <MapPin size={32} className="text-zinc-600 mb-2" />
                        <span className="text-xs uppercase tracking-widest text-zinc-700 font-bold">No Map Data Available</span>
                    </div>
                )}
            </div>
        </div>
    );
};
