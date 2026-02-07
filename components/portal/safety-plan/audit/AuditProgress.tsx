'use client';
import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";

export const AuditProgress = () => {
    const { audit, bag } = useSafetyProgress();
    const { t } = useSafety();

    return (
        <div className="flex flex-col gap-1 w-full">
             <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                 <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${audit.progress}%` }} />
             </div>
             
             {/* Emergency Bag Progress (Reference) */}
             <div className="flex flex-col gap-1 mt-1 opacity-50">
                 <div className="flex justify-between items-center px-0.5">
                     <span className="text-[9px] font-bold uppercase text-zinc-600">{t('emergency_bag' as any) || 'Emergency Bag'}</span>
                 </div>
                 <div className="w-full h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bag.progress}%` }} />
                 </div>
             </div>
        </div>
    );
};
