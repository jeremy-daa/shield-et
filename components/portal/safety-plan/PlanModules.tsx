'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { useRouter } from "next/navigation";
import { Backpack, ShieldCheck, ChevronRight } from "lucide-react";

export const PlanModules = () => {
    const { bag, audit } = useSafetyProgress();
    const router = useRouter();
    const { t } = useSafety();

    const bagCount = bag.items ? bag.items.filter((i: any) => i.isPacked).length : 0;
    const bagTotal = bag.items ? bag.items.length : 0;
    
    const auditCount = audit.tasks ? audit.tasks.filter((t: any) => t.isCompleted).length : 0;
    const auditTotal = audit.tasks ? audit.tasks.length : 0;

    return (
        <div className="flex flex-col gap-2">
            {/* 1. Emergency Bag - Compact Row */}
            <button 
                onClick={() => router.push('/safety-plan/bag')}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex items-center gap-3 transition-all hover:bg-zinc-800/80 hover:border-emerald-500/30 active:scale-[0.98] group"
            >
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]">
                    <Backpack size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                    <div className="flex justify-between items-center mb-1.5">
                        <h3 className="text-white font-bold text-sm leading-none tracking-tight">
                            {t('emergency_bag' as any) || 'Emergency Bag'}
                        </h3>
                        <span className="text-xs font-black text-emerald-500">{bag.progress}%</span>
                    </div>
                    
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-1 mt-1.5">
                        <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${bag.progress}%` }} />
                    </div>

                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wide">
                        {bagCount}/{bagTotal} {t('items_packed' as any) || 'Packed'}
                    </p>
                </div>

                {/* Chevron */}
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </div>
            </button>

            {/* 2. Security Audit - Compact Row */}
            <button 
                onClick={() => router.push('/safety-plan/audit')}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex items-center gap-3 transition-all hover:bg-zinc-800/80 hover:border-purple-500/30 active:scale-[0.98] group"
            >
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 shadow-[0_0_10px_-3px_rgba(168,85,247,0.2)]">
                    <ShieldCheck size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                    <div className="flex justify-between items-center mb-1.5">
                        <h3 className="text-white font-bold text-sm leading-none tracking-tight">
                            {t('security_audit' as any) || 'Security Audit'}
                        </h3>
                        <span className="text-xs font-black text-purple-500">{audit.progress}%</span>
                    </div>
                    
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-1 mt-1.5">
                        <div className="h-full bg-purple-500 transition-all duration-1000 ease-out" style={{ width: `${audit.progress}%` }} />
                    </div>

                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wide">
                        {auditCount}/{auditTotal} {t('tasks_done' as any) || 'Tasks'}
                    </p>
                </div>

                {/* Chevron */}
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-purple-500 transition-colors" />
                </div>
            </button>
        </div>
    );
};
