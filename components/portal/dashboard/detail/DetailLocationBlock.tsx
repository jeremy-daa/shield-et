import { MapPin, Map, LocateFixed } from "lucide-react";
import { useSafety } from "@/context/SafetyContext";
import { SupportResource } from "./types";

export const DetailLocationBlock = ({ res }: { res: SupportResource }) => {
    const { t } = useSafety();

    return (
        <div className="flex flex-col gap-3 w-full">
             <div className="flex items-center mb-1">
                 <div className="w-fit flex items-center gap-2 py-2 px-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                    <MapPin size={12} className="text-zinc-500 shrink-0" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        {t('location_details' as any) || 'Location Details'}
                    </span>
                 </div>
             </div>
             
             <div className="flex gap-4 p-4 rounded-3xl bg-zinc-900 border border-zinc-800/50 items-start">
                 <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-500 mt-0.5">
                     <MapPin size={20} />
                 </div>
                 <div className="flex flex-col gap-1 overflow-hidden">
                     <span className="text-zinc-200 text-sm font-medium leading-tight py-0.5">{res.address || t('address_not_available' as any) || "Address not available"}</span>
                     
                     <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                         <Map size={12} />
                         <span>{res.location}</span>
                     </div>
                     
                     {res.lat && res.lng && (
                         <div className="flex items-center gap-2 text-xs font-mono w-fit mt-1 text-zinc-300">
                             <LocateFixed size={12} />
                             <span className="tracking-tight font-bold">{res.lat.toFixed(5)}, {res.lng.toFixed(5)}</span> 
                         </div>
                     )}
                 </div>
             </div>
         </div>
    );
};
