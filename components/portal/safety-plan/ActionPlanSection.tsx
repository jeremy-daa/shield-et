'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { Button, Input } from "@heroui/react";
import { PenSquare, ShieldCheck, Trash2, Plus } from "lucide-react";
import { useState } from "react";

export const ActionPlanSection = () => {
    const { plan } = useSafetyProgress();
    const { t, language } = useSafety();

    // State for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [newStepLabel, setNewStepLabel] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const handleAddStep = async () => {
        if (!newStepLabel.trim()) return;
        await plan.addStep(newStepLabel);
        setNewStepLabel("");
    };

    const handleReset = async () => {
        if (confirm(t('confirm_reset' as any) || "This will delete your current plan.")) {
            setIsResetting(true);
            await plan.resetPlan();
            setIsEditing(false);
            setIsResetting(false);
        }
    };

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">{t('action_plan' as any) || 'Action Plan'}</h2>
                {plan.activePlanId && (
                    <Button 
                        size="sm" 
                        variant="light" 
                        className={isEditing ? "text-emerald-500" : "text-zinc-400"}
                        onPress={() => setIsEditing(!isEditing)}
                        startContent={!isEditing && <PenSquare size={14} />}
                    >
                        {isEditing ? (t('save' as any) || "Done") : (t('manage_plan' as any) || "Manage")}
                    </Button>
                )}
            </div>

            {!plan.activePlanId ? (
                <div className="flex flex-col gap-3">
                    {/* Custom Plan Option */}
                        <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4" />
                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-white font-bold">{t('create_custom' as any) || "Create Custom Plan"}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-purple-500/20 text-purple-500">
                                Personal
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{t('custom_plan_desc' as any) || "Build your own safety roadmap from scratch."}</p>
                        <Button 
                            className="mt-2 w-full bg-zinc-800 text-white font-bold" 
                            onPress={() => plan.adoptPredefinedPlan('custom')}
                            isLoading={plan.loading}
                        >
                            {t('create_custom' as any) || "Create Custom Plan"}
                        </Button>
                    </div>

                    {/* Templates */}
                    {plan.predefinedPlans.map(template => (
                        <div key={template.id} className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-white font-bold">{template.title_en}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider 
                                    ${template.category === 'urgent' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {template.category}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">{template.description_en}</p>
                            <Button 
                                className="mt-2 w-full bg-white text-black font-bold" 
                                onPress={() => plan.adoptPredefinedPlan(template.id)}
                                isLoading={plan.loading}
                            >
                                {t('adopt_plan' as any) || 'Adopt Plan'}
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                        {/* Steps List */}
                    {plan.steps.map((step, idx) => (
                        <div 
                            key={step.id} 
                            onClick={() => !isEditing && plan.toggleStep(step.id, step.status)}
                            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 
                                ${isEditing ? 'bg-zinc-900 border-zinc-700' : 
                                    step.status === 'done' ? 'bg-zinc-900/50 border-zinc-800/50 opacity-60 cursor-pointer active:scale-95' : 'bg-zinc-900 border-zinc-700 cursor-pointer active:scale-95'}`}
                        >
                            {!isEditing ? (
                                <>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                                        ${step.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                                        {step.status === 'done' && <ShieldCheck size={14} className="text-black" />}
                                    </div>
                                    <div className={step.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                                        <p className="font-medium text-sm">
                                            {(language === 'am' && step.label_am) ? step.label_am : 
                                                (language === 'om' && step.label_or) ? step.label_or : step.label_en}
                                        </p>
                                        <span className="text-xs text-zinc-500 capitalize">{step.module}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-between">
                                        <p className="font-medium text-sm text-zinc-200">{step.label_en}</p>
                                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => plan.deleteStep(step.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Edit Mode Controls */}
                    {isEditing && (
                        <div className="mt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder={t('step_label' as any) || "Step Name"} 
                                    value={newStepLabel}
                                    onValueChange={setNewStepLabel}
                                    className="flex-1"
                                    classNames={{ inputWrapper: "bg-zinc-900 border border-zinc-800" }}
                                />
                                <Button isIconOnly className="bg-emerald-500 text-black" onPress={handleAddStep}>
                                    <Plus size={20} />
                                </Button>
                            </div>

                            <div className="h-px bg-zinc-800 my-2" />
                            
                            <Button 
                                className="w-full border border-red-500/30 text-red-500 bg-red-500/10" 
                                variant="flat" 
                                onPress={handleReset}
                                isLoading={isResetting}
                            >
                                {t('change_template' as any) || "Change Template"}
                            </Button>
                        </div>
                    )}

                    {plan.steps.length === 0 && !isEditing && <p className="text-zinc-500 text-center py-4">No steps loaded.</p>}
                </div>
            )}
        </div>
    );
};
