"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal, ModalContent, ModalBody, Button, Progress } from "@heroui/react";
import { Camera, Mic, CheckCircle, AlertTriangle, X, StopCircle } from "lucide-react";
import { useSafety } from "../../context/SafetyContext";
import { uploadEvidence } from "../../lib/supabase-helpers";
import { useHaptic } from "../../hooks/useHaptic";

interface SecureCaptureProps {
    isOpen: boolean;
    onClose: () => void;
}

type CaptureMode = "photo" | "audio" | null;
type CaptureStatus = "idle" | "capturing" | "uploading" | "success" | "error";

export const SecureCapture = ({ isOpen, onClose }: SecureCaptureProps) => {
    // Hooks
    const { t } = useSafety();
    const { triggerHaptic } = useHaptic();
    
    // State
    const [mode, setMode] = useState<CaptureMode>(null);
    const [status, setStatus] = useState<CaptureStatus>("idle");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        stopAllTracks();
        setMode(null);
        setStatus("idle");
        setAudioDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        audioChunksRef.current = [];
    };

    const stopAllTracks = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    // --- PHOTO LOGIC ---
    const startPhoto = async () => {
        setMode("photo");
        setStatus("capturing");
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (e) {
            console.error("Camera Error:", e);
            setStatus("error");
            triggerHaptic("error");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        triggerHaptic("medium");
        setStatus("uploading");

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);

        // Security: Stop stream immediately
        stopAllTracks();

        canvas.toBlob(async (blob) => {
            if (blob) {
                await processUpload(blob, "image");
            } else {
                setStatus("error");
            }
        }, "image/jpeg", 0.7);
    };

    // --- AUDIO LOGIC ---
    const startAudio = async () => {
        setMode("audio");
        setStatus("capturing");
        setAudioDuration(0);
        audioChunksRef.current = []; // Clear previous

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream); // Keep ref to stop later
            
            // Detect best supported mime type
            const mimeType = [
                'audio/mp4',      // Safari .m4a
                'audio/webm;codecs=opus', 
                'audio/webm',     // Chrome/Firefox .webm
                'audio/ogg;codecs=opus', // Ogg
                'audio/ogg'
            ].find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';

            console.log(`[SecureCapture] Using mimeType: ${mimeType}`);

            const recorder = new MediaRecorder(mediaStream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                // Ensure Blob uses the same mimeType
                const blob = new Blob(audioChunksRef.current, { type: mimeType.split(';')[0] });
                processUpload(blob, "audio");
            };

            recorder.start();
            triggerHaptic("success");

            // Start Timer
            timerRef.current = setInterval(() => {
                setAudioDuration(prev => prev + 1);
            }, 1000);

        } catch (e) {
            console.error("Mic Error:", e);
            setStatus("error");
            triggerHaptic("error");
        }
    };

    const stopAudio = () => {
        triggerHaptic("medium");
        setStatus("uploading");
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Stopping the recorder triggers 'onstop' which handles upload
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        
        // Security: Stop tracks immediately (turn off mic indicator)
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        triggerHaptic("medium");
        setStatus("uploading");
        
        // Determine type mapping
        let type: 'image' | 'audio' = 'image';
        if (file.type.startsWith('audio/')) type = 'audio';
        // Note: For video/docs, we currently map to 'image' bucket/logic but need to differentiate description.
        
        // Use the existing processUpload logic
        await processUpload(file, type);
    };

    // --- COMMON UPLOAD ---
    const processUpload = async (file: Blob, type: 'image' | 'audio') => {
        // Generate Smart Description for Categorization
        let typePrefix = '[IMAGE]';
        if (type === 'audio') typePrefix = '[AUDIO]';
        else if (file.type.includes('video')) typePrefix = '[VIDEO]';
        else if (file.type.includes('pdf')) typePrefix = '[DOC]';
        
        const desc = `${typePrefix} Captured at ${new Date().toLocaleString()}`;

        const success = await uploadEvidence(file, type, { description: desc });
        if (success) {
            setStatus("success");
            triggerHaptic("success");
            setTimeout(onClose, 2000); // Wait 2s then close
        } else {
            setStatus("error");
            triggerHaptic("error");
        }
    };

    // Format seconds to MM:SS
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <Modal 
          isOpen={isOpen} 
          onOpenChange={() => { resetState(); onClose(); }}
          placement="bottom"
          size="full"
          hideCloseButton
          isDismissable={false}
          classNames={{
              base: "bg-black m-0",
              body: "p-0 h-full flex flex-col items-center justify-center pt-24 pb-12",
          }}
          motionProps={{
              variants: {
                  enter: { y: 0, opacity: 1 },
                  exit: { y: "100%", opacity: 0 }
              }
          }}
        >
            <ModalContent>
                {(onClose) => (
                    <ModalBody>
                        <canvas ref={canvasRef} className="hidden" />

                        {/* IDLE: SELECT MODE */}
                        {status === "idle" && (
                            <div className="flex flex-col items-center justify-center w-full h-full px-6 gap-8">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto flex items-center justify-center mb-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"/>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-[0.2em]">SECURE RECORD</h2>
                                    <p className="text-zinc-500 text-xs font-mono uppercase">Select Evidence Format</p>
                                </div>
                                
                                <div className="flex flex-col gap-4 w-full max-w-xs">
                                    <Button 
                                      className="h-24 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all group"
                                      onPress={startPhoto}
                                    >
                                        <div className="flex items-center gap-6 w-full px-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Camera size={24}/>
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="font-bold text-lg text-white">Photo Evidence</span>
                                                <span className="text-xs text-zinc-500">Capture visual proof silently</span>
                                            </div>
                                        </div>
                                    </Button>

                                    <Button 
                                      className="h-24 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all group"
                                      onPress={startAudio}
                                    >
                                        <div className="flex items-center gap-6 w-full px-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Mic size={24}/>
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="font-bold text-lg text-white">Audio Record</span>
                                                <span className="text-xs text-zinc-500">Record conversation securely</span>
                                            </div>
                                        </div>
                                    </Button>

                                    {/* NEW: FILE UPLOAD OPTION */}
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            onChange={(e) => handleFileUpload(e)}
                                            accept="image/*,video/*,audio/*,.pdf"
                                        />
                                        <div className="h-24 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all group rounded-xl flex items-center px-4 relative z-10 pointer-events-none">
                                            <div className="flex items-center gap-6 w-full">
                                                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                                </div>
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="font-bold text-lg text-white">Upload File</span>
                                                    <span className="text-xs text-zinc-500">Import from device storage</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    variant="flat" 
                                    className="w-full max-w-xs text-zinc-500 hover:text-white hover:bg-zinc-900 h-12 mt-4" 
                                    onPress={onClose}
                                >
                                    CANCEL
                                </Button>
                            </div>
                        )}

                        {/* PHOTO CAPTURE UI */}
                        {status === "capturing" && mode === "photo" && (
                             <div className="relative w-full h-full bg-black">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                                <div className="absolute bottom-12 w-full flex justify-center pb-8 gap-8 items-center">
                                    <Button isIconOnly variant="flat" className="rounded-full text-white/50" onPress={resetState}>
                                        <X size={24}/>
                                    </Button>
                                    <Button 
                                      isIconOnly
                                      className="w-20 h-20 rounded-full border-4 border-white bg-transparent hover:bg-white/20 transition-all"
                                      onPress={capturePhoto}
                                    />
                                    <div className="w-10"></div> {/* Spacer */}
                                </div>
                            </div>
                        )}

                        {/* AUDIO CAPTURE UI */}
                        {status === "capturing" && mode === "audio" && (
                            <div className="flex flex-col items-center gap-12 w-full">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center animate-pulse">
                                        <Mic size={48} className="text-purple-500"/>
                                    </div>
                                    <div className="absolute -inset-4 border border-purple-500/20 rounded-full animate-ping opacity-20"/>
                                </div>

                                <div className="text-center space-y-2">
                                    <div className="text-4xl font-mono font-bold text-white tracking-widest">
                                        {formatTime(audioDuration)}
                                    </div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                                        <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Recording Securely</span>
                                    </div>
                                </div>

                                <Button 
                                  color="danger" 
                                  size="lg" 
                                  className="w-48 font-bold shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                                  startContent={<StopCircle/>}
                                  onPress={stopAudio}
                                >
                                    STOP & SAVE
                                </Button>
                            </div>
                        )}

                        {/* UPLOADING STATE */}
                        {status === "uploading" && (
                            <div className="flex flex-col items-center gap-4 w-64">
                                <Progress size="sm" isIndeterminate aria-label="Securing..." className="max-w-md" color="success"/>
                                <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest">Encrypting & Uploading...</span>
                            </div>
                        )}

                        {/* SUCCESS STATE */}
                        {status === "success" && (
                            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                                <CheckCircle size={64} className="text-green-500" />
                                <span className="text-white font-bold text-xl">PROOF SECURED</span>
                                <p className="text-zinc-500 text-xs">Evidence uploaded to vault.</p>
                            </div>
                        )}

                        {/* ERROR STATE */}
                        {status === "error" && (
                            <div className="flex flex-col items-center gap-4">
                                <AlertTriangle size={64} className="text-red-500" />
                                <span className="text-white font-bold">UPLOAD FAILED</span>
                                <Button variant="ghost" onPress={resetState}>Try Again</Button>
                                <Button variant="light" color="danger" onPress={onClose}>Close</Button>
                            </div>
                        )}
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
};
