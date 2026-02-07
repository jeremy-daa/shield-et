import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSafety } from '@/context/SafetyContext';

export interface SecurityTask {
    id: string;
    user_id: string;
    task_name_en: string;
    task_name_am?: string;
    task_name_or?: string;
    is_completed: boolean;
    risk_level: 'low' | 'medium' | 'high';
    platform?: 'phone' | 'social' | 'banking' | 'email';
    instructions?: string;
}

export const useSecurityAudit = () => {
    const { userId } = useSafety();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<SecurityTask[]>([]);
    const [progress, setProgress] = useState(0);
    const [criticalPending, setCriticalPending] = useState(0);

    const fetchAudit = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // 1. Check User's Audit Collection
            const { data: userTasks, error } = await supabase
                .from('security_audit')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            if (!userTasks || userTasks.length === 0) {
                // Initialize from Master if empty
                await initializeAudit(userId);
            } else {
                setTasks(userTasks);
                calculateStats(userTasks);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const initializeAudit = async (uid: string) => {
        try {
            // Fetch master tasks
            const { data: master, error: masterError } = await supabase
                .from('master_security_tasks')
                .select('*');

            if (masterError) throw masterError;
            if (!master || master.length === 0) return;

            // Create user tasks from master
            const userTasks = master.map(m => ({
                user_id: uid,
                task_name_en: m.task_name_en,
                task_name_am: m.task_name_am,
                task_name_or: m.task_name_or,
                is_completed: false,
                risk_level: m.risk_level,
                platform: m.platform,
                instructions: m.instructions
            }));

            const { error: insertError } = await supabase
                .from('security_audit')
                .insert(userTasks);

            if (insertError) throw insertError;

            // Re-fetch
            const { data: refreshed, error: refreshError } = await supabase
                .from('security_audit')
                .select('*')
                .eq('user_id', uid);

            if (refreshError) throw refreshError;
            if (refreshed) {
                setTasks(refreshed);
                calculateStats(refreshed);
            }
        } catch (e) {
            console.error("Init Audit Failed", e);
        }
    };

    const calculateStats = (current: SecurityTask[]) => {
        if (current.length === 0) {
            setProgress(0);
            setCriticalPending(0);
            return;
        }
        const done = current.filter(t => t.is_completed).length;
        setProgress(Math.round((done / current.length) * 100));
        
        const critical = current.filter(t => t.risk_level === 'high' && !t.is_completed).length;
        setCriticalPending(critical);
    };

    const toggleTask = async (taskId: string, isCompleted: boolean) => {
        const newValue = !isCompleted;

        // Optimistic
        const updated = tasks.map(t => t.id === taskId ? { ...t, is_completed: newValue } : t);
        setTasks(updated);
        calculateStats(updated);

        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }

        try {
            const { error } = await supabase
                .from('security_audit')
                .update({ is_completed: newValue })
                .eq('id', taskId);

            if (error) throw error;
        } catch (e) {
            console.error(e);
            fetchAudit();
        }
    };

    useEffect(() => {
        if (userId) fetchAudit();
    }, [userId, fetchAudit]);

    return {
        loading,
        tasks,
        progress,
        criticalPending,
        toggleTask,
        refresh: fetchAudit
    };
};
