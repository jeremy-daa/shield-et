import { Button } from "@heroui/react";
import { Share2, Copy } from "lucide-react";
import { useSafety } from "@/context/SafetyContext";
import { SupportResource } from "./types";

export const DetailFooterActions = ({ 
    res, 
    handleCopy,
    handleShare 
}: { 
    res: SupportResource, 
    handleCopy: () => void,
    handleShare: () => void 
}) => {
    const { t } = useSafety();

    return (
        <div className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-1.5 flex gap-2 backdrop-blur-sm">
            <Button 
                size="lg"
                className="flex-1 h-12 bg-zinc-800 text-zinc-300 font-medium text-sm border border-zinc-700/50 hover:bg-zinc-700 hover:text-white transition-colors rounded-2xl" 
                onPress={handleShare}
            >
                <div className="flex items-center gap-2">
                    <Share2 size={18} />
                    <span className="mt-0.5">{t('share' as any) || 'Share'}</span>
                </div>
            </Button>
            <Button 
                size="lg"
                className="flex-1 h-12 bg-zinc-800 text-zinc-300 font-medium text-sm border border-zinc-700/50 hover:bg-zinc-700 hover:text-white transition-colors rounded-2xl" 
                onPress={handleCopy}
            >
                 <div className="flex items-center gap-2">
                    <Copy size={18} />
                    <span className="mt-0.5">{t('copy_info' as any) || 'Copy Info'}</span>
                </div>
            </Button>
        </div>
    );
};
