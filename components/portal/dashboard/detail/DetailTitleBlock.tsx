import { Button } from "@heroui/react";
import { ShieldCheck, Share2, Copy, Home, Scale, Stethoscope, HeartHandshake, Phone, ArrowLeft } from "lucide-react";
import { useSafety } from "@/context/SafetyContext";
import { SupportResource } from "./types";

const CATEGORY_ICONS = {
  shelter: Home,
  legal: Scale,
  medical: Stethoscope,
  counseling: HeartHandshake,
  hotline: Phone,
};

const CATEGORY_THEMES = {
  shelter: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  legal: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  medical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  counseling: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  hotline: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

export const DetailTitleBlock = ({ 
    res, 
    handleShare, 
    handleCopy,
    onBack 
}: { 
    res: SupportResource, 
    handleShare: () => void, 
    handleCopy: () => void,
    onBack: () => void 
}) => {
    const { t } = useSafety();
    const Icon = CATEGORY_ICONS[res.category] || ShieldCheck;
    const theme = CATEGORY_THEMES[res.category] || CATEGORY_THEMES.hotline;

    return (
        <div className="flex flex-col gap-4 pt-0">
             <div className="flex items-center gap-1">
                <Button 
                    isIconOnly 
                    radius="full" 
                    variant="light" 
                    className="text-zinc-400 -ml-2 data-[hover=true]:text-white min-w-10 w-10 h-10 shrink-0" 
                    onPress={onBack}
                >
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-2xl font-bold text-white leading-tight tracking-tight flex-1">{res.name}</h1>
             </div>

             <div className="flex items-center justify-between gap-2 pl-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className={`py-1 px-4 rounded-full border ${theme.border} ${theme.bg} ${theme.color} flex items-center gap-2`}>
                        <Icon size={18} />
                        <span className="text-xs font-extrabold uppercase tracking-widest">{t(`cat_${res.category}` as any)}</span>
                    </div>
                    {res.verified && (
                        <div className="py-1 px-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 flex items-center gap-2">
                            <ShieldCheck size={16} fill="currentColor" className="text-emerald-500/20" />
                            <span className="text-xs font-bold uppercase tracking-wider">{t('verified' as any) || 'Verified'}</span>
                        </div>
                    )}
                </div>
             </div>
         </div>
    );
};
