'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { AuditHeader } from "@/components/portal/safety-plan/audit/AuditHeader";
import { AuditProgress } from "@/components/portal/safety-plan/audit/AuditProgress";
import { AuditTaskList } from "@/components/portal/safety-plan/audit/AuditTaskList";

export default function SecurityAuditPage() {
    const { audit } = useSafetyProgress();
    const { t } = useSafety();

    return (
        <div className="min-h-screen bg-black pb-24 px-6 pt-[calc(env(safe-area-inset-top)+20px)] flex flex-col gap-6">
            <AuditHeader />
            <AuditProgress />
            <AuditTaskList />
            
            {audit.loading && <p className="text-center text-zinc-500">{t('loading' as any) || 'Loading...'}</p>}
        </div>
    );
}
