"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { DetailTitleBlock } from "./detail/DetailTitleBlock";
import { DetailPrimaryActions } from "./detail/DetailPrimaryActions";
import { DetailLocationBlock } from "./detail/DetailLocationBlock";
import { DetailDescriptionBlock } from "./detail/DetailDescriptionBlock";
import { DetailFooterActions } from "./detail/DetailFooterActions";
import { DetailMapSection } from "./detail/DetailMapSection";
import { SupportResource } from "./detail/types";

export default function SupportDetail({ resourceId }: { resourceId: string }) {
    const router = useRouter();
    const [res, setRes] = useState<SupportResource | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const { data, error } = await supabase
                    .from('support_directory')
                    .select('*')
                    .eq('id', resourceId)
                    .single();
                
                if (error) throw error;
                setRes(data as unknown as SupportResource);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [resourceId]);

    const handleCopy = () => {
        if (!res) return;
        navigator.clipboard.writeText(`${res.name}\\n${res.phone}\\n${res.address || ''} ${res.location}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
 
    const handleShare = () => {
        if (!res) return;
        if (navigator.share) {
            navigator.share({
                title: res.name,
                text: `Contact: ${res.phone}\\nLocation: ${res.location}`,
                url: window.location.href
            });
        } else {
            handleCopy();
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Spinner color="white" /></div>;
    if (!res) return <div className="h-screen flex items-center justify-center bg-black"><p className="text-zinc-500">Not Found</p></div>;

    return (
        <div className="min-h-screen bg-black relative">
            <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-24 flex flex-col gap-8 max-w-xl mx-auto">
                 
                 <DetailTitleBlock res={res} handleShare={handleShare} handleCopy={handleCopy} onBack={() => router.back()} />
                 
                 <DetailPrimaryActions res={res} />
                 
                 <DetailDescriptionBlock res={res} />
                 
                 <div className="flex flex-col gap-6">
                     <DetailFooterActions res={res} handleCopy={handleCopy} handleShare={handleShare} />
                     <DetailLocationBlock res={res} />
                     <DetailMapSection res={res} />
                 </div>
             </div>
        </div>
    );
}
