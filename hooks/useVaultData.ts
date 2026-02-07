import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface EvidenceItem {
    id: string;
    user_id: string;
    file_id: string;
    incident_type: 'physical' | 'emotional' | 'financial' | 'sexual' | 'other';
    timestamp: string;
    description: string;
    threat_level: number | null;
    is_archived: boolean;
    created_at: string;
}

export const useVaultData = () => {
    const [data, setData] = useState<EvidenceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvidence = async () => {
        console.log("[useVaultData] === FETCH EVIDENCE (SUPABASE) ===" );
        setLoading(true);
        setError(null);
        
        try {
            // Get current user session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session?.user) {
                console.error("[useVaultData] ❌ No valid session");
                throw new Error('Authentication required');
            }

            console.log("[useVaultData] ✅ Valid session, user ID:", session.user.id);

            // Fetch evidence for current user
            const { data: evidence, error: fetchError } = await supabase
                .from('evidence_metadata')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_archived', false)
                .order('timestamp', { ascending: false });

            if (fetchError) {
                console.error("[useVaultData] ❌ Fetch error:", fetchError);
                throw fetchError;
            }

            console.log(`[useVaultData] ✅ Fetched ${evidence?.length || 0} evidence items`);
            setData(evidence || []);
        } catch (e: any) {
            console.error("[useVaultData] Error:", e);
            setError(e.message || 'Failed to fetch evidence');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("[useVaultData] useEffect triggered");
        fetchEvidence();
    }, []);

    return { data, loading, error, refresh: fetchEvidence };
};
