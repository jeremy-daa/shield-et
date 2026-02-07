'use client';

import { useSafety } from "@/context/SafetyContext";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export const SafetyPlanHeader = () => {
    const { t } = useSafety();
    const router = useRouter();

    return (
        <div className="flex items-center gap-3 mb-2">
            <Button isIconOnly variant="light" onPress={() => router.back()} className="text-zinc-400 -ml-2">
                <ArrowLeft />
            </Button>
            
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldCheck size={24} className="text-emerald-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white mb-0.5 leading-none">{t('safety_plan' as any) || 'Safety Plan'}</h1>
                <p className="text-zinc-400 text-sm leading-tight">{t('safety_roadmap' as any) || 'Your master roadmap to safety.'}</p>
            </div>
        </div>
    );
};
