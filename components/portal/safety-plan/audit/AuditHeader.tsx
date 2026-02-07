'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { Button } from "@heroui/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export const AuditHeader = () => {
    const { audit } = useSafetyProgress();
    const router = useRouter();
    const { t } = useSafety();

    return (
        <div className="flex items-center gap-3">
            <Button isIconOnly variant="light" onPress={() => router.back()} className="text-zinc-400 -ml-2">
                <ArrowLeft />
            </Button>
            
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                 <ShieldCheck size={24} className="text-purple-500" />
            </div>

            <div>
                <h1 className="text-xl font-bold text-white leading-tight">{t('security_audit' as any) || 'Security Audit'}</h1>
                <p className="text-zinc-400 text-[10px] leading-tight">{t('audit_subtitle' as any) || 'Lock down your digital life.'}</p>
            </div>

            {/* Progress Number */}
            <div className="ml-auto flex flex-col items-end">
                <span className="text-2xl font-black text-purple-500 leading-none">{audit.progress}%</span>
                <span className="text-[9px] font-bold text-zinc-600 uppercase">{t('status_secure' as any) || "Secure"}</span>
            </div>
        </div>
    );
};
