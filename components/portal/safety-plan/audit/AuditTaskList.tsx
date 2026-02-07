'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

const RISK_KEYS = {
    high: 'critical_vulnerabilities',
    medium: 'recommended_actions',
    low: 'good_hygiene'
};

const RISK_COLORS = {
    high: 'text-red-500',
    medium: 'text-orange-500',
    low: 'text-blue-500'
};

export const AuditTaskList = () => {
    const { audit } = useSafetyProgress();
    const { t, language } = useSafety();

    const groupedTasks = useMemo(() => {
        const groups: Record<string, typeof audit.tasks> = { high: [], medium: [], low: [] };
        audit.tasks.forEach(t => {
            if (groups[t.risk_level]) groups[t.risk_level].push(t);
        });
        return groups;
    }, [audit.tasks]);

    const getTaskName = (task: any) => {
        if (language === 'am' && task.task_name_am) return task.task_name_am;
        if (language === 'om' && task.task_name_or) return task.task_name_or;
        return task.task_name_en;
    };

    return (
        <div className="flex flex-col gap-8">
            {(['high', 'medium', 'low'] as const).map((level) => {
                const tasks = groupedTasks[level];
                if (tasks.length === 0) return null;

                return (
                    <div key={level}>
                        <div className="flex items-center gap-2 mb-3 pl-1">
                            {level === 'high' && <ShieldAlert size={14} className="text-red-500" />}
                            <h3 className={`text-xs font-bold uppercase tracking-widest ${RISK_COLORS[level]}`}>
                                {t(RISK_KEYS[level] as any) || level}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            {tasks.map(task => (
                                <div 
                                    key={task.id}
                                    onClick={() => audit.toggleTask(task.id, task.is_completed)}
                                    className={`p-4 rounded-2xl border transition-all active:scale-95 flex items-start gap-4 cursor-pointer
                                        ${task.is_completed ? 'bg-zinc-900/30 border-zinc-800 opacity-60' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'}`}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5
                                        ${task.is_completed ? 'bg-purple-500 border-purple-500' : 'border-zinc-700'}`}>
                                        {task.is_completed && <ShieldCheck size={12} className="text-black" />}
                                    </div>
                                    <div className={task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                                        <p className="font-medium text-sm leading-tight">{getTaskName(task)}</p>
                                        {task.platform && (
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1 block">
                                                {t(task.platform as any) || task.platform}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
