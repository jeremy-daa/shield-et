import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSafety } from '@/context/SafetyContext';

export interface SafetyStep {
    id: string;
    user_id: string;
    template_step_id?: string;
    label_en: string;
    label_am?: string;
    label_or?: string;
    status: 'todo' | 'done';
    priority: number;
    module: 'exit' | 'digital' | 'legal' | 'kids';
    is_essential?: boolean;
}

export interface PredefinedPlan {
    id: string;
    title_en: string;
    description_en: string;
    category: 'urgent' | 'stealth' | 'stay' | 'kids';
    difficulty: 'easy' | 'moderate' | 'hard';
    duration?: string;
    icon?: string;
}

export const useSafetyPlan = () => {
    const { userId } = useSafety();
    const [loading, setLoading] = useState(true);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const [steps, setSteps] = useState<SafetyStep[]>([]);
    const [predefinedPlans, setPredefinedPlans] = useState<PredefinedPlan[]>([]);
    const [progress, setProgress] = useState(0);

    // Fetch User's Plan State
    const fetchUserPlan = useCallback(async () => {
        if (!userId) return;
        try {
            // 1. Get SafetyPlans doc (Settings)
            const { data: plans, error: plansError } = await supabase
                .from('safety_plans')
                .select('*')
                .eq('user_id', userId);

            if (plansError) throw plansError;
            
            if (plans && plans.length > 0) {
                const userPlan = plans[0];
                if (userPlan.is_plan_active && userPlan.active_template_id) {
                    setActivePlanId(userPlan.active_template_id);
                }
            }

            // 2. Fetch SafetySteps
            const { data: stepsRes, error: stepsError } = await supabase
                .from('safety_steps')
                .select('*')
                .eq('user_id', userId)
                .order('priority', { ascending: true });

            if (stepsError) throw stepsError;
            
            if (stepsRes) {
                setSteps(stepsRes);
                calculateProgress(stepsRes);
            }

        } catch (e) {
            console.error("Error fetching user plan:", e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch Predefined Templates
    const fetchTemplates = useCallback(async () => {
        try {
            const { data: res, error } = await supabase
                .from('predefined_plans')
                .select('*');

            if (error) throw error;
            if (res) setPredefinedPlans(res);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const calculateProgress = (currentSteps: SafetyStep[]) => {
        if (currentSteps.length === 0) {
            setProgress(0);
            return;
        }
        const done = currentSteps.filter(s => s.status === 'done').length;
        setProgress(Math.round((done / currentSteps.length) * 100));
    };

    // Adoption Engine
    const adoptPredefinedPlan = async (templateId: string) => {
        if (!userId) return;
        setLoading(true);
        try {
            // A. Fetch Template Steps
            const { data: templateSteps, error: templateError } = await supabase
                .from('predefined_steps')
                .select('*')
                .eq('plan_id', templateId);

            if (templateError) throw templateError;
            if (!templateSteps) return;

            // B. Delete old steps for clean slate
            if (steps.length > 0) {
                const { error: deleteError } = await supabase
                    .from('safety_steps')
                    .delete()
                    .eq('user_id', userId);

                if (deleteError) throw deleteError;
            }

            // C. Clone template steps to user steps
            const userSteps = templateSteps.map(step => ({
                user_id: userId,
                template_step_id: step.id,
                label_en: step.label_en,
                label_am: step.label_am,
                label_or: step.label_or,
                status: 'todo' as const,
                priority: step.priority,
                module: step.module
            }));

            const { error: insertError } = await supabase
                .from('safety_steps')
                .insert(userSteps);

            if (insertError) throw insertError;

            // D. Update User Plan Settings
            const { data: userPlans, error: fetchPlanError } = await supabase
                .from('safety_plans')
                .select('*')
                .eq('user_id', userId);

            if (fetchPlanError) throw fetchPlanError;
            
            if (!userPlans || userPlans.length === 0) {
                // Create new plan record
                const { error: createError } = await supabase
                    .from('safety_plans')
                    .insert({
                        user_id: userId,
                        vault_pin: '', // Empty pin initially, user will set it later
                        active_template_id: templateId,
                        is_plan_active: true
                    });

                if (createError) throw createError;
            } else {
                // Update existing plan
                const { error: updateError } = await supabase
                    .from('safety_plans')
                    .update({
                        active_template_id: templateId,
                        is_plan_active: true
                    })
                    .eq('id', userPlans[0].id);

                if (updateError) throw updateError;
            }

            // Refresh
            await fetchUserPlan();

        } catch (e) {
            console.error("Adoption failed", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleStep = async (stepId: string, currentStatus: 'todo' | 'done') => {
        const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
        
        // Optimistic Update
        const updatedSteps = steps.map(s => s.id === stepId ? { ...s, status: newStatus as 'todo' | 'done' } : s);
        setSteps(updatedSteps);
        calculateProgress(updatedSteps);

        // Haptic
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }

        try {
            const { error } = await supabase
                .from('safety_steps')
                .update({ status: newStatus })
                .eq('id', stepId);

            if (error) throw error;
        } catch (e) {
            console.error("Toggle failed", e);
            // Revert
            fetchUserPlan();
        }
    };

    const resetPlan = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Delete steps
            const { error: deleteError } = await supabase
                .from('safety_steps')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // Update settings
            const { data: userPlans, error: fetchError } = await supabase
                .from('safety_plans')
                .select('*')
                .eq('user_id', userId);

            if (fetchError) throw fetchError;

            if (userPlans && userPlans.length > 0) {
                const { error: updateError } = await supabase
                    .from('safety_plans')
                    .update({
                        active_template_id: null,
                        is_plan_active: false
                    })
                    .eq('id', userPlans[0].id);

                if (updateError) throw updateError;
            }
            
            setSteps([]);
            setActivePlanId(null);
            setProgress(0);
        } catch (e) {
            console.error("Reset failed", e);
        } finally {
            setLoading(false);
        }
    };

    const addStep = async (label: string) => {
        if (!userId) return;
        
        try {
            const { error } = await supabase
                .from('safety_steps')
                .insert({
                    user_id: userId,
                    template_step_id: crypto.randomUUID(), // Generate a UUID for custom steps
                    label_en: label,
                    status: 'todo',
                    priority: steps.length + 1,
                    module: 'exit'
                });

            if (error) throw error;
            fetchUserPlan();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteStep = async (id: string) => {
         const filtered = steps.filter(s => s.id !== id);
         setSteps(filtered);
         calculateProgress(filtered);
         
         try {
             const { error } = await supabase
                .from('safety_steps')
                .delete()
                .eq('id', id);

            if (error) throw error;
         } catch(e) {
             console.error(e);
             fetchUserPlan();
         }
    };

    useEffect(() => {
        if (userId) {
            fetchUserPlan();
            fetchTemplates();
        }
    }, [userId, fetchUserPlan, fetchTemplates]);

    return {
        loading,
        steps,
        progress,
        activePlanId,
        predefinedPlans,
        adoptPredefinedPlan,
        toggleStep,
        resetPlan,
        addStep,
        deleteStep
    };
};
