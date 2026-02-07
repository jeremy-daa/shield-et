"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal, ModalContent, ModalBody, InputOtp } from "@heroui/react";
import { useSafety } from "../../context/SafetyContext";

export const PinModal = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) => {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { triggerAuthFlow } = useSafety();

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setIsError(false);
    }
  }, [isOpen]);

  const handleComplete = async (value?: string) => {
    if (!value) return;

    console.log("[PinModal] PIN entered, calling triggerAuthFlow...");

    try {
      // NEW: Single auth flow - handles both new users and existing users
      const success = await triggerAuthFlow(value);

      if (success) {
        console.log("[PinModal] ✅ Auth successful");
        onOpenChange(false);
        setPin("");
        setIsError(false);
      } else {
        console.error("[PinModal] ❌ Auth failed - wrong PIN");
        setIsError(true);
        setPin("");
        setTimeout(() => setIsError(false), 2000);
      }
    } catch (e) {
      console.error("[PinModal] Exception during auth:", e);
      setIsError(true);
      setPin("");
      setTimeout(() => setIsError(false), 2000);
    }
  };

  const getTitle = () => {
    if (isError) return "SYSTEM ERROR";
    return "SECURITY VERIFICATION";
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      hideCloseButton
      isDismissable={true}
      backdrop="blur"
      id="pin-modal-root"
      classNames={{
        wrapper:
          "fixed inset-0 z-[9999] flex items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-sm",
        base: "m-auto relative z-[10000]",
        backdrop: "hidden",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div
                id="pin-modal-container"
                className="flex flex-col items-center gap-4 py-8 px-12 bg-black/90 border border-zinc-800 shadow-2xl rounded-2xl w-auto mx-auto max-w-[90vw]"
              >
                <div className="text-center text-sm tracking-[0.2em] uppercase font-bold text-zinc-400">
                  {getTitle()}
                </div>

                <InputOtp
                  length={4}
                  value={pin}
                  onValueChange={setPin}
                  onComplete={handleComplete}
                  errorMessage={null}
                  isInvalid={isError}
                  classNames={{
                    segment:
                      "w-12 h-12 text-xl border-zinc-700 bg-zinc-900 text-white font-mono flex items-center justify-center",
                    segmentWrapper: "flex gap-2",
                  }}
                  autoFocus
                />

                {/* Stealthy Error Message */}
                <div
                  className={`h-4 text-[10px] font-mono text-center select-none transition-colors duration-300 ${isError ? "text-red-500" : "text-zinc-600"}`}
                >
                  {isError
                    ? "CORE_DUMP: AUTH_MISMATCH_0x99"
                    : `ID: ${Math.random().toString(36).substring(7).toUpperCase()}`}
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
