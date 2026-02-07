"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { VaultGallery } from "../../../../components/portal/vault/VaultGallery";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useSafety } from "../../../../context/SafetyContext";

import { VaultUpload } from "../../../../components/portal/vault/VaultUpload";
import { UploadCloud } from "lucide-react";

export default function VaultPage() {
    const router = useRouter();
    const { t } = useSafety();
    const [isUploadOpen, setIsUploadOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-black pb-24 pt-[calc(env(safe-area-inset-top)+20px)] px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" onPress={() => router.back()} className="text-zinc-400">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                       <h1 className="text-xl font-bold text-white tracking-widest">{t('badge_encrypted') || "EVIDENCE VAULT"}</h1>
                       <p className="text-xs text-zinc-500 font-mono">{t('vault_subtitle')}</p>
                    </div>
                </div>
                <Button 
                    isIconOnly 
                    radius="full"
                    className="bg-zinc-800 border border-zinc-700 text-purple-400 w-12 h-12 shadow-[0_0_15px_rgba(168,85,247,0.1)] active:scale-95 flex items-center justify-center p-0"
                    onPress={() => setIsUploadOpen(true)}
                >
                    <UploadCloud size={24} strokeWidth={2.5} />
                </Button>
            </div>

            {/* Gallery */}
            <VaultGallery />
            
            <VaultUpload isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </div>
    );
};
