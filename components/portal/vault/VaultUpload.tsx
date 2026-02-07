"use client";

import React, { useState, useRef } from "react";
import { Modal, ModalContent, ModalBody, Button, Input, Textarea, Spinner } from "@heroui/react";
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useHaptic } from "../../../hooks/useHaptic";
import { uploadEvidence } from "../../../lib/appwrite";
import { useRouter } from "next/navigation";
import { useSafety } from "../../../context/SafetyContext";

interface VaultUploadProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VaultUpload = ({ isOpen, onClose }: VaultUploadProps) => {
    const { triggerHaptic } = useHaptic();
    const router = useRouter();
    const { t } = useSafety();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [threatLevel, setThreatLevel] = useState(1);
    const [incidentType, setIncidentType] = useState("physical");
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const INCIDENT_TYPES = [
        { id: "physical", label: t('incident_type_physical') },
        { id: "emotional", label: t('incident_type_emotional') },
        { id: "financial", label: t('incident_type_financial') },
        { id: "sexual", label: t('incident_type_sexual') },
        { id: "other", label: t('incident_type_other') },
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setSuccess(false);

            // Create preview if it's an image
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
            triggerHaptic('light');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setUploading(true);
        triggerHaptic('medium');

        const type = file.type.startsWith('audio/') ? 'audio' : 'image';
        const result = await uploadEvidence(file, type, {
            description: description || `Manual Upload: ${file.name}`,
            threatLevel: threatLevel,
            incidentType: incidentType
        });

        if (result) {
            setSuccess(true);
            triggerHaptic('success');
            setTimeout(() => {
                router.refresh();
                // We keep modal open to show the disclaimer
            }, 500);
        } else {
            triggerHaptic('error');
            alert("Upload failed. Please check connection.");
        }
        setUploading(false);
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setDescription("");
        setIncidentType("harassment");
        setSuccess(false);
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={(open) => !open && handleReset()} 
            className="bg-black border border-zinc-800"
            size="full"
            hideCloseButton
            motionProps={{
                variants: {
                    enter: { y: 0, opacity: 1 },
                    exit: { y: 100, opacity: 0 }
                }
            }}
        >
            <ModalContent className="h-full w-full mx-0 my-0 rounded-none">
                <ModalBody className="p-6 pt-24 pb-12 flex flex-col items-center justify-between h-full bg-black">
                    
                    {/* Header */}
                    <div className="w-full flex items-center justify-between mb-8">
                        <h2 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
                            <UploadCloud size={18} className="text-purple-500"/>
                            Secure Upload
                        </h2>
                        <Button isIconOnly variant="light" onPress={handleReset} className="text-zinc-500">
                            <X size={24} />
                        </Button>
                    </div>

                    {!success ? (
                        <>
                            {/* Upload Form */}
                            <div className="w-full flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                                
                                {/* File Picker Area */}
                                <div 
                                    className={`w-full h-48 flex-shrink-0 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all ${
                                        file ? "border-purple-500/50 bg-purple-900/10" : "border-zinc-800 bg-zinc-900/30"
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {preview ? (
                                        <img src={preview} className="h-full w-full object-contain rounded-xl" />
                                    ) : file ? (
                                        <div className="flex flex-col items-center gap-2 text-purple-400">
                                            <CheckCircle2 size={32} />
                                            <span className="text-xs font-mono">{file.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                                            <ImageIcon size={32} />
                                            <span className="text-xs font-bold uppercase">Tap to Select File</span>
                                            <span className="text-[10px] font-mono">IMAGES / AUDIO ONLY</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*,audio/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                {/* Metadata Inputs */}
                                <div className="space-y-5 pb-4">
                                    
                                    {/* Incident Type Grid */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 pl-1">Incident Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {INCIDENT_TYPES.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setIncidentType(type.id)}
                                                    className={`p-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                                                        incidentType === type.id
                                                        ? "bg-zinc-800 text-white border-zinc-600"
                                                        : "bg-zinc-950 text-zinc-600 border-zinc-900"
                                                    }`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 pl-1">Description</label>
                                        <Textarea 
                                            placeholder="Describe context, location, subjects..." 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            minRows={3}
                                            classNames={{
                                                input: "bg-zinc-900 text-zinc-300 font-mono text-sm",
                                                inputWrapper: "bg-zinc-900 border-zinc-800 group-data-[focus=true]:border-purple-500/50"
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 pl-1">Threat Level</label>
                                        <div className="flex justify-between bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => { setThreatLevel(lvl); triggerHaptic('light'); }}
                                                    className={`h-8 w-1/5 rounded-md text-xs font-bold transition-all ${
                                                        threatLevel === lvl 
                                                        ? 'bg-purple-600 text-white shadow-lg' 
                                                        : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button 
                                className="w-full font-bold text-black"
                                color="secondary"
                                size="lg"
                                isDisabled={!file || uploading}
                                isLoading={uploading}
                                onPress={handleUpload}
                            >
                                {uploading ? "ENCRYPTING & UPLOADING..." : "UPLOAD TO SECURE VAULT"}
                            </Button>
                        </>
                    ) : (
                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-300">
                            
                            <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                <CheckCircle2 size={48} />
                            </div>
                            
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white tracking-widest">UPLOAD COMPLETE</h3>
                                <p className="text-zinc-400 text-xs font-mono">Evidence secured in encryption vault.</p>
                            </div>

                            <div className="w-full bg-red-900/10 border border-red-500/30 rounded-xl p-6 flex flex-col gap-4 mt-8">
                                <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs border-b border-red-500/20 pb-2">
                                    <AlertTriangle size={16} />
                                    Critical Safety Protocol
                                </div>
                                <p className="text-red-200/80 text-sm leading-relaxed">
                                    This file has been successfully uploaded to the cloud vault. <br/><br/>
                                    <span className="font-bold text-white">IMMEDIATELY DELETE</span> the original file from your device's local gallery/storage to prevent physical discovery.
                                </p>
                            </div>

                            <Button 
                                className="w-full mt-auto font-bold" 
                                variant="flat" 
                                color="default"
                                onPress={handleReset}
                            >
                                CLOSE & SECURE
                            </Button>
                        </div>
                    )}

                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
