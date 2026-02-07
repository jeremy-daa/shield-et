import React, { createContext, useContext, useMemo } from 'react';
import { useSafetyPlan, SafetyStep, PredefinedPlan } from '../hooks/portal/useSafetyPlan';
import { useEmergencyBag, EmergencyItem } from '../hooks/portal/useEmergencyBag';
import { useSecurityAudit, SecurityTask } from '../hooks/portal/useSecurityAudit';

interface SafetyProgressContextType {
    plan: {
        loading: boolean;
        steps: SafetyStep[];
        activePlanId: string | null;
        predefinedPlans: PredefinedPlan[];
        adoptPredefinedPlan: (id: string) => Promise<void>;
        toggleStep: (id: string, status: 'todo' | 'done') => Promise<void>;
        resetPlan: () => Promise<void>;
        addStep: (label: string) => Promise<void>;
        deleteStep: (id: string) => Promise<void>;
        progress: number;
    };
    bag: {
        loading: boolean;
        items: EmergencyItem[];
        toggleItem: (id: string, packed: boolean) => Promise<void>;
        addItem: (name: string, category?: string, isEssential?: boolean) => Promise<void>;
        deleteItem: (id: string) => Promise<void>;
        reorderItems: (items: EmergencyItem[]) => Promise<void>;
        progress: number;
    };
    audit: {
        loading: boolean;
        tasks: SecurityTask[];
        criticalPending: number;
        toggleTask: (id: string, done: boolean) => Promise<void>;
        progress: number;
    };
    totalReadiness: number;
}

const SafetyProgressContext = createContext<SafetyProgressContextType | undefined>(undefined);

export const SafetyProgressProvider = ({ children }: { children: React.ReactNode }) => {
    // Invoke Hooks
    const planHook = useSafetyPlan();
    const bagHook = useEmergencyBag();
    const auditHook = useSecurityAudit();

    // Global Progress Calculation
    const totalReadiness = useMemo(() => {
        // Weights: Plan (50%), Bag (25%), Audit (25%) ??
        // "Within the Safety Steps, if the plan is "Urgent," the weight should shift to 50% for steps and 25% for the other two."
        
        let planWeight = 0.4; // Default
        let bagWeight = 0.3;
        let auditWeight = 0.3;

        // Check active plan category?
        // We need to fetch the active plan details to know if it's Urgent?
        // The hook activePlanId doesn't give the category directly unless we find it in predefinedPlans.
        if (planHook.activePlanId && planHook.predefinedPlans.length > 0) {
            const currentPlan = planHook.predefinedPlans.find(p => p.$id === planHook.activePlanId);
            if (currentPlan?.category === 'urgent') {
                planWeight = 0.5;
                bagWeight = 0.25;
                auditWeight = 0.25;
            }
        }

        const score = (planHook.progress * planWeight) + (bagHook.progress * bagWeight) + (auditHook.progress * auditWeight);
        
        // Haptic Milestones
        if (score >= 50 && score < 51) {
             // notificationOccurred('success') - Debounce needed?
             // Since this runs on every render, we shouldn't trigger side effects here directly without refs.
             // Skipping haptic trigger here to avoid loop/spam. Handled by separate effect if needed.
        }

        return Math.round(score);

    }, [planHook.progress, bagHook.progress, auditHook.progress, planHook.activePlanId, planHook.predefinedPlans]);

    return (
        <SafetyProgressContext.Provider value={{
            plan: planHook,
            bag: bagHook,
            audit: auditHook,
            totalReadiness
        }}>
            {children}
        </SafetyProgressContext.Provider>
    );
};

export const useSafetyProgress = () => {
    const ctx = useContext(SafetyProgressContext);
    if (!ctx) throw new Error("useSafetyProgress must be used within SafetyProgressProvider");
    return ctx;
};
