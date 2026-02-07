'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight } from "lucide-react";

export const SafetyWarnings = () => {
    const { audit } = useSafetyProgress();
    const router = useRouter();
    const { t } = useSafety();

    if (audit.criticalPending === 0) return null;

    return (
        <div onClick={() => router.push('/safety-plan/audit')} className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 cursor-pointer active:scale-95 transition-transform">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <div>
                <h3 className="text-red-400 font-bold text-sm">{t('critical_risks' as any) || 'Critical Security Risks'}</h3>
                <p className="text-red-300/70 text-xs mt-1">{audit.criticalPending} {t('pending_risks' as any) || 'high-risk checks pending.'}</p>
            </div>
            <ChevronRight className="ml-auto text-red-500/50" size={16} />
        </div>
    );
};
