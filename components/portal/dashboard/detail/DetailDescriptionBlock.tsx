import { useSafety } from "@/context/SafetyContext";
import { SupportResource } from "./types";

export const DetailDescriptionBlock = ({ res }: { res: SupportResource }) => {
    const { language, t } = useSafety();
    const description = language === 'am' ? res.description_am : (language === 'om' ? res.description_or : res.description_en);

    return (
        <div className="bg-zinc-900/10 p-4 rounded-2xl border border-zinc-800/30">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">About Organization</h3>
             <p className="text-zinc-300 text-[15px] leading-relaxed font-normal whitespace-pre-wrap">
                {description || t('no_desc')}
             </p>
         </div>
    );
};
