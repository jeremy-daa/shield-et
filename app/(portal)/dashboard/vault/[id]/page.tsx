"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Input, Textarea, Spinner } from "@heroui/react";
import { ArrowLeft, Trash2, Save, AlertTriangle, Mic, Download, EyeOff } from "lucide-react";
import { useHaptic } from "../../../../../hooks/useHaptic";
import { deleteEvidence, deleteEvidenceFile, updateEvidenceDetails } from "../../../../../lib/supabase-helpers";
import { supabase } from "../../../../../lib/supabase";
import { EvidenceItem } from "../../../../../hooks/useVaultData";

import { useSafety } from "../../../../../context/SafetyContext";

export default function EvidenceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { triggerHaptic } = useHaptic();
    const { t, formatDate } = useSafety();
    const [item, setItem] = useState<EvidenceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Secure Image State
    const [secureImageSrc, setSecureImageSrc] = useState<string | null>(null);
    const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Edit Form State
    const [description, setDescription] = useState("");
    const [threatLevel, setThreatLevel] = useState(1);
    const [incidentType, setIncidentType] = useState<
      "physical" | "emotional" | "financial" | "sexual" | "other"
    >("physical");

    const docId = params.id as string;

    // Helper: Get thumbnail URL (small, fast-loading preview)
    const getThumbnailUrl = async (fileId: string) => {
      const { data, error } = await supabase.storage
        .from("evidence-vault")
        .createSignedUrl(fileId, 3600, {
          transform: {
            width: 100,
            height: 100,
            resize: "cover",
            quality: 20,
          },
        });

      if (error) {
        console.error("Thumbnail URL error:", error);
        return null;
      }
      return data.signedUrl;
    };

    // Helper: Fetch Secure Image
    const loadSecureImage = async (fileId: string) => {
      setIsImageLoading(true);

      try {
        // Load thumbnail (signed URL)
        const thumbUrl = await getThumbnailUrl(fileId);
        if (thumbUrl) {
          setThumbnailSrc(thumbUrl);
        }

        // Load full image (signed URL)
        const { data, error } = await supabase.storage
          .from("evidence-vault")
          .createSignedUrl(fileId, 3600);

        if (error) {
          console.error("Failed to create signed URL:", error);
          return;
        }

        if (data?.signedUrl) {
          setSecureImageSrc(data.signedUrl);
        }
      } catch (e: any) {
        console.error("Secure Image Load Failed", e);
      } finally {
        setIsImageLoading(false);
      }
    };

    const INCIDENT_TYPES = [
      { id: "physical", label: t("incident_type_physical") },
      { id: "emotional", label: t("incident_type_emotional") },
      { id: "financial", label: t("incident_type_financial") },
      { id: "sexual", label: t("incident_type_sexual") },
      { id: "other", label: t("incident_type_other") },
    ];

    // Fetch Evidence Item
    useEffect(() => {
      const fetchItem = async () => {
        try {
          const { data, error } = await supabase
            .from("evidence_metadata")
            .select("*")
            .eq("id", docId)
            .single();

          if (error) throw error;

          if (data) {
            setItem(data);
            setDescription(data.description);
            setThreatLevel(data.threat_level || 1);
            setIncidentType(data.incident_type);

            // Trigger Secure Image Load
            if (data.file_id && data.file_id !== "no-file-call-log") {
              await loadSecureImage(data.file_id);
            }
          }
        } catch (e: any) {
          console.error("Failed to load evidence", e);
          router.replace("/dashboard/vault");
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }, [docId, router]);

    const updateDetails = async () => {
      if (!item) return;
      setSaving(true);
      triggerHaptic("light");

      const success = await updateEvidenceDetails(docId, {
        description,
        threat_level: Number(threatLevel),
        incident_type: incidentType,
      });

      if (success) {
        setItem({
          ...item,
          description,
          threat_level: threatLevel,
          incident_type: incidentType,
        });
        triggerHaptic("success");
      } else {
        triggerHaptic("error");
      }
      setSaving(false);
    };

    const handleDownload = async () => {
      if (!item || !item.file_id || item.file_id === "no-file-call-log") return;

      const warning =
        t("download_confirm") ||
        "WARNING: This file will be saved to your device unencrypted.\\n\\nAre you sure?";
      if (!window.confirm(warning)) return;

      triggerHaptic("medium");
      try {
        const { data, error } = await supabase.storage
          .from("evidence-vault")
          .download(item.file_id);

        if (error || !data) {
          throw new Error("Failed to download file");
        }

        const filename =
          item.file_id.split("/").pop() || `evidence-${Date.now()}.bin`;
        const file = new File([data], filename, { type: data.type });

        // Try Web Share API first (Mobile) - may fail if gesture context is lost
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              files: [file],
              title: "Secure Evidence",
              text: "Saving secure evidence file.",
            });
            triggerHaptic("success");
            return;
          } catch (shareError: any) {
            // Share was cancelled or failed, fall through to download
            console.log("Share cancelled or failed, using download fallback");
          }
        }

        // Fallback: Anchor Download
        const downloadUrl = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        triggerHaptic("success");
      } catch (e) {
        console.error("Download failed", e);
        triggerHaptic("error");
        alert("Download failed. Please try again.");
      }
    };

    const handleDeleteFile = async () => {
      if (!item || !item.file_id || item.file_id === "no-file-call-log") return;
      if (!confirm(t("confirm_delete_file"))) return;

      triggerHaptic("warning");
      const success = await deleteEvidenceFile(item.file_id);
      if (success) {
        triggerHaptic("success");
        setSecureImageSrc(null);
        router.back();
      } else {
        triggerHaptic("error");
      }
    };

    const handlePermanentDelete = async () => {
      if (!item) return;
      if (!confirm(t("confirm_delete_record"))) return;

      triggerHaptic("error");
      const success = await deleteEvidence(item.id, item.file_id);
      if (success) {
        triggerHaptic("success");
        router.push("/dashboard/vault");
      } else {
        triggerHaptic("error");
        alert("Failed to delete evidence.");
      }
    };

    if (loading)
      return (
        <div className="h-screen bg-black flex items-center justify-center">
          <Spinner color="white" />
        </div>
      );
    if (!item) return null;

    const isAudio = item.description.toLowerCase().includes("audio");
    const isCall = item.file_id === "no-file-call-log";

    const ThreatSelector = () => (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => setThreatLevel(level)}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
              threatLevel === level
                ? "bg-red-500 text-white border-red-500 scale-110"
                : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-600"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    );

    return (
      <div className="min-h-screen bg-black pb-12 pt-[calc(env(safe-area-inset-top)+20px)] px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
            className="text-zinc-400"
          >
            <ArrowLeft size={24} />
          </Button>
          <div className="text-right">
            <h1 className="text-sm font-bold text-white tracking-[0.2em]">
              {isCall ? t("detail_header_call") : t("detail_header_evidence")}
            </h1>
            <div className="flex items-center justify-end gap-2 text-[10px] text-zinc-600 font-mono uppercase">
              <span>
                {item.incident_type
                  ? t(`incident_type_${item.incident_type}` as any)
                  : t("detail_secure")}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${Number(item.threat_level) > 3 ? "bg-red-500" : "bg-green-500"}`}
              />
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-8">
          {/* MEDIA VIEWER CARD */}
          <div className="relative">
            {!isCall ? (
              <div className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center relative group">
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-1 rounded bg-black/50 backdrop-blur text-[10px] text-zinc-400 font-mono border border-white/10">
                    {isAudio
                      ? t("detail_audio_record")
                      : t("detail_image_capture")}
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-black/50 backdrop-blur text-white border border-white/10 hover:bg-black/70 flex justify-center items-center"
                    onPress={handleDownload}
                  >
                    <Download size={14} />
                  </Button>
                </div>

                {isAudio ? (
                  <div className="flex flex-col items-center gap-6 w-full p-8">
                    <div className="w-20 h-20 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                      <Mic size={32} />
                    </div>
                    <audio
                      controls
                      className="w-full"
                      src={secureImageSrc || ""}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {/* Blurred thumbnail preview - loads instantly */}
                    {thumbnailSrc && (
                      <img
                        src={thumbnailSrc}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-contain max-h-[400px] blur-xl scale-110 opacity-50"
                      />
                    )}

                    {/* Loading spinner */}
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Spinner color="white" />
                      </div>
                    )}

                    {/* Full resolution image - fades in when loaded */}
                    <img
                      src={secureImageSrc || ""}
                      alt="Evidence"
                      className={`relative z-10 w-full h-full object-contain max-h-[400px] cursor-pointer transition-opacity duration-500 ${
                        !isImageLoading ? "opacity-100" : "opacity-0"
                      }`}
                      onClick={() =>
                        secureImageSrc && window.open(secureImageSrc, "_blank")
                      }
                      onLoad={() => setIsImageLoading(false)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-gradient-to-br from-blue-900/10 to-zinc-900 border border-blue-500/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
                <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="text-blue-400/80 font-mono text-sm tracking-widest text-center">
                  {t("detail_sos_log")}
                </h3>
              </div>
            )}
          </div>

          {/* INTELLIGENCE DATA */}
          <div className="space-y-4">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-1">
              {t("detail_intelligence_title")}
            </h3>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">
                    {t("detail_date")}
                  </label>
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-mono">
                    <span className="opacity-70">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">
                    {t("detail_time")}
                  </label>
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-mono">
                    <span className="opacity-70">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block">
                    {t("detail_incident_class")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {INCIDENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setIncidentType(type.id as any)}
                        className={`p-2 rounded text-[9px] font-bold uppercase border transition-all ${
                          incidentType === type.id
                            ? "bg-purple-900/30 text-purple-200 border-purple-500/50"
                            : "bg-black text-zinc-600 border-zinc-900 hover:border-zinc-700"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">
                    {t("detail_threat_assess")}
                  </label>
                  <ThreatSelector />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">
                  {t("detail_notes_label")}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minRows={3}
                  placeholder={t("detail_notes_placeholder")}
                  classNames={{
                    input: "bg-zinc-950 text-zinc-300 font-mono text-sm",
                    inputWrapper:
                      "bg-zinc-950 border-zinc-800 hover:border-zinc-700 group-data-[focus=true]:border-zinc-600",
                  }}
                />
              </div>

              <Button
                className="w-full font-bold bg-white text-black flex items-center justify-center"
                size="md"
                isLoading={saving}
                onPress={updateDetails}
                startContent={!saving && <Save size={18} />}
              >
                {t("detail_update_btn")}
              </Button>
            </div>
          </div>

          {/* DISPOSAL PROTOCOLS */}
          <div className="space-y-4 pt-4">
            <h3 className="text-red-900/50 text-xs font-bold uppercase tracking-widest pl-1 flex items-center gap-2">
              <AlertTriangle size={12} />
              {t("detail_disposal_title")}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {!isCall && (
                <Button
                  className="w-full justify-between h-auto py-3 bg-zinc-900/50 border border-dashed border-zinc-700 text-zinc-300 group hover:bg-black hover:border-red-500/50 hover:text-red-400 transition-all"
                  variant="bordered"
                  onPress={handleDeleteFile}
                  endContent={
                    <div className="p-1.5 rounded bg-zinc-800 text-zinc-500 group-hover:bg-red-900/20 group-hover:text-red-500 transition-colors">
                      <EyeOff size={16} />
                    </div>
                  }
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold tracking-wider uppercase">
                      {t("detail_purge_file_btn")}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono group-hover:text-red-400/60">
                      {t("detail_purge_file_sub")}
                    </span>
                  </div>
                </Button>
              )}

              <Button
                className="w-full flex justify-center items-center bg-red-950/20 border border-red-900/30 text-red-600 font-bold h-12"
                variant="flat"
                onPress={handlePermanentDelete}
                startContent={<Trash2 size={18} />}
              >
                {t("detail_destroy_record_btn")}
              </Button>
            </div>
            <p className="text-[10px] text-zinc-700 text-center px-4">
              {t("detail_disposal_warning")}
            </p>
          </div>
        </div>
      </div>
    );
}
