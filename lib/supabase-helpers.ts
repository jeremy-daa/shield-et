/**
 * Supabase Database & Storage Helper Functions
 * Replaces lib/appwrite.ts functionality
 */

import { supabase } from './supabase';
import type { Database } from './supabase';

type EvidenceRow = Database['public']['Tables']['evidence_metadata']['Row'];
type EvidenceInsert = Database['public']['Tables']['evidence_metadata']['Insert'];

// ============================================================================
// SUPPORT RESOURCES
// ============================================================================

export async function getSupportResources() {
  const { data, error } = await supabase
    .from('support_directory')
    .select('*')
    .eq('verified', true)
    .order('name');

  if (error) {
    console.error('[getSupportResources] Error:', error);
    throw error;
  }

  return { documents: data };
}

// ============================================================================
// EMERGENCY LOGGING
// ============================================================================

export async function logEmergencyCall(number: string, label: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('[logEmergencyCall] No valid session');
    return null;
  }

  const { data, error } = await supabase
    .from('evidence_metadata')
    .insert({
      user_id: session.user.id,
      file_id: 'no-file-call-log',
      incident_type: 'other',
      description: `Emergency SOS Call: ${label} (${number}). Device: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'}`,
      timestamp: new Date().toISOString(),
      threat_level: 5,
      is_archived: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[logEmergencyCall] Error:', error);
    return null;
  }

  return data;
}

// ============================================================================
// EVIDENCE UPLOAD
// ============================================================================

export async function uploadEvidence(
  file: File | Blob,
  type: 'image' | 'audio',
  metadata?: {
    description?: string;
    threatLevel?: number;
    incidentType?: 'physical' | 'emotional' | 'financial' | 'sexual' | 'other';
  }
) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('[uploadEvidence] No valid session');
    return false;
  }

  try {
    // 1. Determine file extension from MIME type
    const mime = file.type;
    let ext = 'bin';
    if (mime.includes('image/jpeg')) ext = 'jpg';
    else if (mime.includes('image/png')) ext = 'png';
    else if (mime.includes('image/webp')) ext = 'webp';
    else if (mime.includes('audio/webm')) ext = 'webm';
    else if (mime.includes('audio/ogg')) ext = 'ogg';
    else if (mime.includes('audio/mp4')) ext = 'm4a';
    else if (mime.includes('audio/wav')) ext = 'wav';
    else if (mime.includes('audio/mpeg')) ext = 'mp3';

    // 2. Generate unique file ID
    const fileId = `${session.user.id}/${type}_${Date.now()}.${ext}`;

    // 3. Upload to Supabase Storage
    const uploadFile = file instanceof File
      ? file
      : new File([file], `${type}_${Date.now()}.${ext}`, { type: mime });

    const { error: uploadError } = await supabase.storage
      .from('evidence-vault')
      .upload(fileId, uploadFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[uploadEvidence] Upload error:', uploadError);
      return false;
    }

    // 4. Create metadata record
    const defaultDesc = `Stealth ${type} capture. Device: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'}`;

    console.log('[uploadEvidence] Attempting to insert metadata:', {
      user_id: session.user.id,
      file_id: fileId,
      incident_type: metadata?.incidentType || 'other',
    });

    const { data: insertData, error: insertError } = await supabase
      .from('evidence_metadata')
      .insert({
        user_id: session.user.id,
        file_id: fileId,
        incident_type: metadata?.incidentType || 'other',
        description: metadata?.description || defaultDesc,
        timestamp: new Date().toISOString(),
        threat_level: metadata?.threatLevel || null,
        is_archived: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[uploadEvidence] Metadata insert error:', insertError);
      console.error('[uploadEvidence] Error details:', JSON.stringify(insertError, null, 2));
      // Try to clean up uploaded file
      await supabase.storage.from('evidence-vault').remove([fileId]);
      return false;
    }

    console.log('[uploadEvidence] ✅ Evidence uploaded successfully:', insertData.id);
    return true;
  } catch (e) {
    console.error('[uploadEvidence] Unexpected error:', e);
    return false;
  }
}

// ============================================================================
// EVIDENCE MANAGEMENT
// ============================================================================

export async function deleteEvidenceFile(fileId: string) {
  try {
    if (!fileId || fileId === 'no-file-call-log') return false;

    const { error } = await supabase.storage
      .from('evidence-vault')
      .remove([fileId]);

    if (error) {
      console.error('[deleteEvidenceFile] Error:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[deleteEvidenceFile] Error:', e);
    return false;
  }
}

export async function updateEvidenceDetails(
  documentId: string,
  data: Partial<{
    description: string;
    threat_level: number;
    incident_type: 'physical' | 'emotional' | 'financial' | 'sexual' | 'other';
  }>
) {
  try {
    const { error } = await supabase
      .from('evidence_metadata')
      .update(data)
      .eq('id', documentId);

    if (error) {
      console.error('[updateEvidenceDetails] Error:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[updateEvidenceDetails] Error:', e);
    return false;
  }
}

export async function deleteEvidence(documentId: string, fileId: string) {
  try {
    // 1. Delete metadata record
    const { error: deleteError } = await supabase
      .from('evidence_metadata')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('[deleteEvidence] Metadata delete error:', deleteError);
      return false;
    }

    // 2. Delete file from storage (if valid)
    if (fileId && fileId !== 'no-file-call-log') {
      const { error: storageError } = await supabase.storage
        .from('evidence-vault')
        .remove([fileId]);

      if (storageError) {
        // Log but don't fail - file might already be deleted
        console.warn('[deleteEvidence] File delete warning:', storageError);
      }
    }

    return true;
  } catch (e) {
    console.error('[deleteEvidence] Error:', e);
    return false;
  }
}

// ============================================================================
// FILE ACCESS
// ============================================================================

export async function getFileUrl(fileId: string, download = false): Promise<string | null> {
  if (fileId === 'no-file-call-log') return null;

  const { data } = supabase.storage
    .from('evidence-vault')
    .getPublicUrl(fileId, {
      download: download
    });

  return data.publicUrl;
}

export async function getSecureFileBlob(fileId: string): Promise<Blob | null> {
  if (fileId === 'no-file-call-log') return null;

  const { data, error } = await supabase.storage
    .from('evidence-vault')
    .download(fileId);

  if (error) {
    console.error('[getSecureFileBlob] Error:', error);
    return null;
  }

  return data;
}
