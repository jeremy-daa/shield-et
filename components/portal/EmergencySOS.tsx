"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { Scale, ShieldAlert, Ambulance, Phone, X } from "lucide-react";
import { useSafety } from "../../context/SafetyContext";
import { useHaptic } from "../../hooks/useHaptic";
import { logEmergencyCall } from "../../lib/supabase-helpers";

interface EmergencySOSProps {
    isOpen: boolean;
    onClose: () => void;
}

type EmergencyOption = {
    id: string;
    labelKey: string;
    number: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    borderColor: string;
};

export const EmergencySOS = ({ isOpen, onClose }: EmergencySOSProps) => {
    const { t } = useSafety();
    const { triggerHaptic } = useHaptic();
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const options: EmergencyOption[] = [
        { 
            id: 'legal',
            labelKey: 'sos_legal',
            number: '7711',
            icon: Scale,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20'
        },
        { 
            id: 'police',
            labelKey: 'sos_police',
            number: '991',
            icon: ShieldAlert,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        { 
            id: 'medical',
            labelKey: 'sos_medical',
            number: '907',
            icon: Ambulance,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        }
    ];

    useEffect(() => {
        if (isOpen) {
            triggerHaptic('warning');
        } else {
            setConfirmingId(null);
        }
    }, [isOpen]);

    const handlePress = (opt: EmergencyOption) => {
        if (confirmingId === opt.id) {
            // CONFIRMED
            triggerHaptic('light');
            
            // Log in background
            console.log("[EmergencySOS] Logging call to Appwrite...");
            setTimeout(() => {
                 logEmergencyCall(opt.number, opt.labelKey)
                    .then(() => console.log("[EmergencySOS] Call logged successfully"))
                    .catch(e => console.error("[EmergencySOS] Failed to log call", e));
            }, 100);

            // Attempt: Standard Window Open (Blank)
            // '_blank' is often required to trigger external handlers (tel:) from inside 
            // restrictive WebViews (like Telegram) as it forces a new context.
            const url = `tel:${opt.number}`;
            console.log(`[EmergencySOS] Attempting window.open('${url}', '_blank')`);
            
            // Try '_blank' first as it's the most aggressive "external" trigger
            const opened = window.open(url, '_blank');
            
            // Fallback if that somehow failed immediately (returned null)
            if (!opened) {
                 console.log("[EmergencySOS] _blank blocked. Trying location.href");
                 window.location.href = url;
            }

            setConfirmingId(null);
            onClose();
        } else {
            // FIRST TAP
            triggerHaptic('medium');
            setConfirmingId(opt.id);
            
            // Auto-reset confirmation after 3s if not tapped
            setTimeout(() => {
                setConfirmingId(prev => (prev === opt.id ? null : prev));
            }, 3000);
        }
    };

    return (
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onClose}
          placement="bottom"
          size="full"
          classNames={{
              base: "bg-[#18181b] m-0 rounded-t-[32px]",
              body: "p-6",
              backdrop: "bg-black/90 backdrop-blur-md"
          }}
          motionProps={{
              variants: {
                  enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
                  exit: { y: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
              }
          }}
          hideCloseButton
        >
            <ModalContent className="h-screen w-screen m-0 rounded-none bg-transparent pt-24">
                {(onClose) => (
                    <ModalBody className="h-full flex flex-col justify-between p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <h2 className="text-xl font-bold text-red-500 tracking-widest uppercase">
                                    {t('sos_title')}
                                </h2>
                            </div>
                            <Button isIconOnly variant="light" onPress={onClose} className="rounded-full">
                                <X size={24} className="text-zinc-500" />
                            </Button>
                        </div>

                        {/* Options */}
                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            {options.map((opt) => {
                                const isConfirming = confirmingId === opt.id;
                                const Icon = opt.icon;

                                return (
                                    <Button
                                        key={opt.id}
                                        className={`h-24 relative overflow-hidden transition-all duration-300 ${isConfirming ? 'bg-red-600 border-red-500' : `${opt.bg} ${opt.borderColor} border`}`}
                                        onPress={() => handlePress(opt)}
                                    >
                                        <div className="flex flex-row items-center gap-4 w-full px-4">
                                            {isConfirming ? (
                                                <div className="w-full flex flex-col items-center justify-center animate-pulse">
                                                    <span className="text-xl font-black text-white uppercase tracking-wider">{t('sos_confirm')}</span>
                                                    <span className="text-xs text-white/80">{opt.number}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={`p-3 rounded-full bg-black/20 ${opt.color}`}>
                                                        <Icon size={32} />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className={`text-lg font-bold ${opt.color}`}>{t(opt.labelKey as any)}</span>
                                                        <span className="text-sm text-zinc-500 flex items-center gap-1">
                                                            <Phone size={12}/> {opt.number}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                        
                        <Button variant="ghost" color="default" onPress={onClose} className="w-full h-14 text-zinc-500">
                            {t('sos_cancel')}
                        </Button>
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
};
