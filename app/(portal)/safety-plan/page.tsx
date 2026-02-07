'use client';

import { SafetyPlanHeader } from "@/components/portal/safety-plan/SafetyPlanHeader";
import { GlobalReadinessScore } from "@/components/portal/safety-plan/GlobalReadinessScore";
import { SafetyWarnings } from "@/components/portal/safety-plan/SafetyWarnings";
import { PlanModules } from "@/components/portal/safety-plan/PlanModules";
import { ActionPlanSection } from "@/components/portal/safety-plan/ActionPlanSection";

export default function SafetyPlanDashboard() {
    return (
        <div className="min-h-screen bg-black pb-24 px-6 pt-[calc(env(safe-area-inset-top)+20px)] flex flex-col gap-6">
            <SafetyPlanHeader />
            <GlobalReadinessScore />
            <SafetyWarnings />
            <PlanModules />
            <ActionPlanSection />
        </div>
    );
}
