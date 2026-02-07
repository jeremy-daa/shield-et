"use client";

import React, { useState } from "react";
import { Card, Image, Spinner } from "@heroui/react";
import { Mic, Calendar, FileType, PlayCircle, Eye, EyeOff, Image as ImageIcon, Video } from "lucide-react";

import { useRouter } from "next/navigation";
import { useVaultData, EvidenceItem } from "../../../hooks/useVaultData";
import { supabase } from "../../../lib/supabase";
import { useHaptic } from "../../../hooks/useHaptic";
import { useSafety } from "../../../context/SafetyContext";

const EvidenceCard = ({ item, onPress, formatDate }: { item: EvidenceItem; onPress: (item: EvidenceItem) => void; formatDate: (d: string, t?: boolean) => string }) => {
    const desc = item.description.toLowerCase();
    const isAudio = desc.includes("audio") || desc.includes("[audio]");
    const isVideo = desc.includes("video") || desc.includes("[video]");
    const isDoc = desc.includes("doc") || desc.includes("[doc]") || desc.includes("pdf");
    
    // Privacy: Blur effect - use Supabase Storage public URL
    const thumbnailUrl = (isAudio || isDoc || item.file_id === 'no-file-call-log')
        ? null 
        : supabase.storage.from('evidence-vault').getPublicUrl(item.file_id).data.publicUrl;

    // Icon Selection
    const TypeIcon = isAudio ? Mic : (isVideo ? Video : (isDoc ? FileType : ImageIcon));

    return (
        <Card 
          isPressable 
          onPress={() => onPress(item)}
          className="bg-zinc-900 border border-zinc-800 h-40 relative overflow-hidden group"
        >
            {/* Type Badge (Top Right) */}
            <div className="absolute top-2 right-2 z-30 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                <TypeIcon size={14} className="text-zinc-300" />
            </div>

            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-full">
                    {isAudio ? <PlayCircle className="text-white"/> : <Eye className="text-white"/>}
                </div>
            </div>

            {/* Content */}
            {isAudio || isDoc ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900/10 gap-2">
                     <TypeIcon className="text-purple-500 w-8 h-8 opacity-50 blur-[2px]" />
                     <span className="text-[10px] text-zinc-500 font-mono blur-[2px]">EVIDENCE</span>
                </div>
            ) : (
                <Image 
                   removeWrapper
                   alt="Evidence"
                   className="z-0 w-full h-full object-cover blur-md scale-110"
                   src={thumbnailUrl || ""}
                />
            )}
            
            {/* Timestamp Overlay */}
            <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm p-2 z-20">
                <p className="text-[10px] text-zinc-400 font-mono flex items-center justify-between w-full">
                    <span>{formatDate(item.timestamp)}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </p>
            </div>
        </Card>
    );
};



export const VaultGallery = () => {
    const { data, loading, refresh } = useVaultData();
    const { triggerHaptic } = useHaptic();
    const { t, formatDate } = useSafety();
    const router = useRouter();

    // --- Categorization Logic ---
    const callLogs = data.filter(item => item.file_id === 'no-file-call-log' || item.description.toLowerCase().includes('call'));
    const mediaFiles = data.filter(item => !callLogs.includes(item));
    
    const audioFiles = mediaFiles.filter(item => item.description.toLowerCase().includes('audio'));
    const imageFiles = mediaFiles.filter(item => !audioFiles.includes(item));

    if (loading) return <div className="flex justify-center p-12"><Spinner color="white" /></div>;

    if (data.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-4">
             <EyeOff size={48} />
             <div className="text-center">
                 <p className="font-mono text-sm uppercase font-bold">{t('vault_empty_title')}</p>
                 <p className="text-xs max-w-[200px] mt-2 opacity-50">{t('vault_empty_desc')}</p>
             </div>
        </div>
    );

    const handlePress = (item: EvidenceItem) => {
        triggerHaptic('light');
        router.push(`/dashboard/vault/${item.id}`);
    };

    return (
        <div className="pb-24 space-y-8">
            {/* 1. Media Evidence */}
            {mediaFiles.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                         <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-purple-500">
                             {t('vault_section_captured')}
                         </h2>
                         <div className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                             <span>{imageFiles.length} IMG</span>
                             <span>/</span>
                             <span>{audioFiles.length} AUD</span>
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {mediaFiles.map((item) => (
                            <EvidenceCard key={item.id} item={item} onPress={handlePress} formatDate={formatDate} />
                        ))}
                    </div>
                </section>
            )}

            {/* 2. Call Logs */}
            {callLogs.length > 0 && (
                <section className="space-y-4">
                     <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-blue-500">
                         {t('vault_section_logs')}
                     </h2>
                     <div className="flex flex-col gap-2">
                        {callLogs.map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
                                onClick={() => handlePress(item)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <FileType size={14} className="text-blue-400"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-zinc-300 text-sm font-bold">{t('detail_header_call')}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">{formatDate(item.timestamp, true)}</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center text-zinc-500">
                                    <Eye size={16} />
                                </div>
                            </div>
                        ))}
                     </div>
                </section>
            )}
        </div>
    );
};
