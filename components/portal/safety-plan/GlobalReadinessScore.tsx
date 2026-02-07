'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { CircularProgress, Card, CardBody, Divider } from "@heroui/react";
import { Shield, ShieldCheck, Trophy, Zap, Backpack, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";

export const GlobalReadinessScore = () => {
    const { totalReadiness, bag, audit, plan } = useSafetyProgress();
    const { t } = useSafety();

    const levelData = useMemo(() => {
        // Simplified Logic: Text Color (Bright) + Background Base Color (Hex class equivalent)
        // Using '400' shades for visible text on dark backgrounds
        if (totalReadiness === 100) return { 
            name: t('level_sentinel' as any) || "Sentinel", 
            color: "text-emerald-400", 
            hex: "bg-emerald-500",
            icon: ShieldCheck 
        };
        if (totalReadiness >= 75) return { 
            name: t('level_guardian' as any) || "Guardian", 
            color: "text-yellow-400", 
            hex: "bg-yellow-500",
            icon: Shield 
        };
        if (totalReadiness >= 50) return { 
            name: t('level_vanguard' as any) || "Vanguard", 
            color: "text-purple-400", 
            hex: "bg-purple-500",
            icon: Zap 
        };
        if (totalReadiness >= 25) return { 
            name: t('level_scout' as any) || "Scout", 
            color: "text-blue-400", 
            hex: "bg-blue-500",
            icon: Backpack 
        };
        return { 
            name: t('level_rookie' as any) || "Rookie", 
            color: "text-zinc-400", 
            hex: "bg-zinc-500",
            icon: AlertTriangle 
        };
    }, [totalReadiness, t]);

    const LevelIcon = levelData.icon;

    return (
        <Card className="border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden p-1.5">
            {/* Simple Ambient Glow - Static Large Blur */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-15 pointer-events-none ${levelData.hex}`} />
            
            <CardBody className="py-2 px-4 flex flex-col items-center relative z-10 text-center w-full">
                {/* Level Badge */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center mb-4"
                >
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700/50 bg-zinc-900/50 mb-2">
                        <Trophy size={12} className={levelData.color} />
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${levelData.color}`}>
                            {t('security_level' as any) || "Security Level"} {Math.floor(totalReadiness / 25) + 1}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <LevelIcon size={20} className={levelData.color} />
                        <h2 className={`text-2xl font-black uppercase tracking-tight italic ${levelData.color} drop-shadow-sm`}>
                            {levelData.name}
                        </h2>
                    </div>
                </motion.div>

                {/* Score Circle & Pulse */}
                <div className="relative mb-6 flex justify-center w-full items-center">
                    {/* Simplified Pulse - Soft Glow Behind Circle */}
                    <div className={`absolute w-24 h-24 rounded-full animate-pulse blur-2xl opacity-20 ${levelData.hex}`} />

                    <CircularProgress 
                        classNames={{
                            svg: "w-32 h-32 drop-shadow-lg",
                            indicator: `stroke-current ${levelData.color}`,
                            track: "stroke-zinc-800/50",
                            value: "text-3xl font-black text-white",
                        }}
                        value={totalReadiness}
                        strokeWidth={3}
                        showValueLabel={true}
                        formatOptions={{ style: "percent" }}
                    />
                </div>

                <Divider className="bg-zinc-800 mb-4" />

                {/* Detailed Breakdown */}
                <div className="w-full grid grid-cols-3 gap-2">
                    <StatBlock 
                        label={t('supplies' as any) || "Supplies"} 
                        value={bag.progress} 
                        icon={Backpack} 
                        color="text-blue-500" 
                    />
                    <StatBlock 
                        label={t('security_audit' as any) || "Audit"} 
                        value={audit.progress} 
                        icon={ShieldCheck} 
                        color="text-purple-500" 
                    />
                    <StatBlock 
                        label={t('action_plan' as any) || "Action Plan"}
                        value={plan.steps.length > 0 ? Math.round((plan.steps.filter(s => s.status === 'done').length / plan.steps.length) * 100) : 0} 
                        icon={Zap} 
                        color="text-orange-500" 
                    />
                </div>
            </CardBody>
        </Card>
    );
};

const StatBlock = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) => (
    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
        <Icon size={14} className={`mb-1 ${color}`} />
        <span className="text-xl font-bold text-white leading-none">{value}%</span>
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider leading-none">{label}</span>
        
        {/* Mini Bar */}
        <div className="w-full h-1 bg-zinc-900 rounded-full mt-1.5 overflow-hidden">
            <div className={`h-full opacity-60 ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);
