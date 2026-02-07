import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSafety } from '@/context/SafetyContext';
import { ESSENTIAL_ITEMS } from '@/lib/emergency_bag';

export interface EmergencyItem {
    id: string;
    user_id: string;
    item_name: string;
    is_packed: boolean;
    is_essential: boolean;
    category: 'docs' | 'cash' | 'personal' | 'kids' | 'medical';
    sort_order?: number;
}

export const useEmergencyBag = () => {
    const { userId } = useSafety();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<EmergencyItem[]>([]);
    const [progress, setProgress] = useState(0);

    const initializeBag = async (uid: string) => {
        try {
            const itemsToInsert = ESSENTIAL_ITEMS.map((item, index) => ({
                user_id: uid,
                item_name: item.itemName_en,
                is_packed: false,
                is_essential: item.isEssential,
                category: item.category,
                sort_order: index + 1
            }));

            const { error } = await supabase
                .from('emergency_bag')
                .insert(itemsToInsert);

            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Failed to init bag", e);
            return false;
        }
    };

    const fetchItems = useCallback(async () => {
        if (!userId) return;
        try {
            const { data: res, error } = await supabase
                .from('emergency_bag')
                .select('*')
                .eq('user_id', userId)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            
            if (!res || res.length === 0) {
                const initialized = await initializeBag(userId);
                if (initialized) {
                    // Retry fetch
                    const { data: retried, error: retryError } = await supabase
                        .from('emergency_bag')
                        .select('*')
                        .eq('user_id', userId)
                        .order('sort_order', { ascending: true });

                    if (retryError) throw retryError;
                    if (retried) {
                        setItems(retried);
                        calculateProgress(retried);
                    }
                }
            } else {
                setItems(res);
                calculateProgress(res);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const calculateProgress = (current: EmergencyItem[]) => {
        if (current.length === 0) {
            setProgress(0);
            return;
        }
        const packed = current.filter(i => i.is_packed).length;
        setProgress(Math.round((packed / current.length) * 100));
    };

    const toggleItem = async (itemId: string, isPacked: boolean) => {
        const newValue = !isPacked;
        const updated = items.map(i => i.id === itemId ? { ...i, is_packed: newValue } : i);
        setItems(updated);
        calculateProgress(updated);
        
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }

        try {
            const { error } = await supabase
                .from('emergency_bag')
                .update({ is_packed: newValue })
                .eq('id', itemId);

            if (error) throw error;
        } catch (e) {
            console.error(e);
            fetchItems();
        }
    };

    const addItem = async (name: string, category: string = 'personal', isEssential: boolean = false) => {
        if (!userId) return;
        
        try {
            const { error } = await supabase
                .from('emergency_bag')
                .insert({
                    user_id: userId,
                    item_name: name,
                    is_packed: false,
                    is_essential: isEssential,
                    category,
                    sort_order: items.length + 1
                });

            if (error) throw error;
            fetchItems();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteItem = async (id: string) => {
        const filtered = items.filter(i => i.id !== id);
        setItems(filtered);
        calculateProgress(filtered);
        try {
            const { error } = await supabase
                .from('emergency_bag')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (e) {
            console.error(e);
            fetchItems();
        }
    };

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, []);

    const reorderItems = async (orderedItems: EmergencyItem[]) => {
        // Optimistic Update: Update UI immediately AND update internal sortOrder to match new positions
        const optimisticItems = orderedItems.map((item, index) => ({
             ...item,
             sort_order: index + 1
        }));
        setItems(optimisticItems);
        
        // Debounce DB updates
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(async () => {
            // Process updates sequentially using the ORIGINAL items (with old sortOrders) to detect changes
            for (let i = 0; i < orderedItems.length; i++) {
                const item = orderedItems[i];
                const intendedSort = i + 1;
                
                if (item.sort_order !== intendedSort) {
                    try {
                        const { error } = await supabase
                            .from('emergency_bag')
                            .update({ sort_order: intendedSort })
                            .eq('id', item.id);

                        if (error) throw error;
                        // Throttle
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (e) {
                         console.error("Reorder sync failed for item", item.item_name, e);
                    }
                }
            }
        }, 2000); 
    };


    useEffect(() => {
        if (userId) fetchItems();
    }, [userId, fetchItems]);

    return {
        loading,
        items,
        progress,
        toggleItem,
        addItem,
        deleteItem,
        reorderItems,
        refresh: fetchItems
    };
};
