'use client';

import { useSafetyProgress } from "@/context/SafetyProgressContext";
import { useSafety } from "@/context/SafetyContext";
import { Button, Input, Switch } from "@heroui/react";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, PenSquare, FileText, Wallet, Pill, User, Baby, Package, Star, GripVertical, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ESSENTIAL_ITEMS } from "@/lib/emergency_bag";
import { Reorder, useDragControls } from "framer-motion";

const CATEGORY_CONFIG: Record<string, { icon: any, color: string, bg: string, border: string, label: string }> = {
    docs: { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Documents" },
    cash: { icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Cash" },
    medical: { icon: Pill, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Medical" },
    personal: { icon: User, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Personal" },
    kids: { icon: Baby, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", label: "Kids" },
    default: { icon: Package, color: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", label: "Other" }
};

interface SortableProps {
    item: any;
    bag: any;
    getTranslatedName: (item: any) => string;
    isEditing: boolean;
}

function SortableItem({ item, bag, getTranslatedName, isEditing }: SortableProps) {
    const controls = useDragControls();
    
    return (
        <Reorder.Item 
            value={item} 
            dragListener={false} 
            dragControls={controls} 
            className="relative z-10"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-y' }}
        >
            <div 
                onClick={() => !isEditing && bag.toggleItem(item.id, item.is_packed)}
                className={`p-3 rounded-2xl border flex items-center justify-between shadow-sm transition-colors cursor-pointer active:scale-[0.99]
                ${item.is_packed && !isEditing ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
            >
                
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Handle - Stop Propagation to prevent Toggle */}
                    <div 
                        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing shrink-0 p-3 -ml-2 touch-none text-zinc-600 hover:text-white transition-colors"
                        style={{ touchAction: 'none' }}
                    >
                        <GripVertical size={20} />
                    </div>

                    {/* Check Circle - Visual Only (Parent Handles Click) */}
                    {!isEditing && (
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                ${item.is_packed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}
                         >
                            {item.is_packed && <CheckCircle2 size={12} className="text-black" />}
                         </div>
                    )}
                    
                    <span className={`font-medium text-sm truncate pr-2 pointer-events-none 
                            ${item.is_packed && !isEditing ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}
                    >
                        {getTranslatedName(item)}
                    </span>
                    {item.is_essential && <Star size={12} className="text-yellow-500 fill-yellow-500/20 shrink-0" />}
                </div>
                
                {/* Delete Button - Stop Propagation */}
                {isEditing && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => bag.deleteItem(item.id)} className="shrink-0">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </Reorder.Item>
    );
}

interface SortableCategoryProps {
    cat: string;
    items: any[];
    t: any;
    bag: any;
    handleReorderItems: (cat: string, items: any[]) => void;
    getTranslatedName: (item: any) => string;
    isEditing: boolean;
}

function SortableCategory({ cat, items, t, bag, handleReorderItems, getTranslatedName, isEditing }: SortableCategoryProps) {
    const controls = useDragControls();
    const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.default;
    const Icon = config.icon;

    return (
        <Reorder.Item 
            value={cat} 
            dragListener={false} 
            dragControls={controls} 
            className="relative z-0 mb-4"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-y' }}
        >
            {/* Category Header with Handle */}
            <div className="flex items-center justify-between mb-3 pl-1 pr-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md ${config.bg} ${config.color}`}>
                        <Icon size={14} />
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${config.color}`}>
                        {t(cat as any) || cat}
                    </h3>
                </div>
                
                <div 
                    onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
                    className="p-3 -mr-2 cursor-grab active:cursor-grabbing touch-none text-zinc-700 hover:text-white transition-colors"
                    style={{ touchAction: 'none' }}
                >
                    <GripVertical size={20} />
                </div>
            </div>

            {/* Nested Items Group */}
            <Reorder.Group axis="y" values={items} onReorder={(newItems) => handleReorderItems(cat, newItems)} className="flex flex-col gap-2">
                {items.map(item => (
                    <SortableItem key={item.id} item={item} bag={bag} getTranslatedName={getTranslatedName} isEditing={isEditing} />
                ))}
            </Reorder.Group>
        </Reorder.Item>
    )
}

export default function EmergencyBagPage() {
    const { bag, audit } = useSafetyProgress();
    const router = useRouter();
    const { t, language } = useSafety();
    const [isEditing, setIsEditing] = useState(false);
    
    // Add Item State
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemCategory, setNewItemCategory] = useState("personal");
    const [newItemEssential, setNewItemEssential] = useState(false);

    // Sorting State
    const [orderedCategoryKeys, setOrderedCategoryKeys] = useState<string[]>([]);
    
    // Derived Grouping
    const groupedItems = useMemo(() => {
        const groups: Record<string, typeof bag.items> = {};
        bag.items.forEach(item => {
            const cat = item.category || 'personal';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [bag.items]);

    // Initialize/Sync Category Order based on DB sortOrder
    useEffect(() => {
        const keys = Object.keys(groupedItems).sort((a, b) => {
            const minA = Math.min(...groupedItems[a].map(i => i.sort_order || 9999));
            const minB = Math.min(...groupedItems[b].map(i => i.sort_order || 9999));
            if (minA === minB) return 0;
            return minA - minB;
        });
        if (keys.join(',') !== orderedCategoryKeys.join(',')) {
             setOrderedCategoryKeys(keys);
        }
    }, [groupedItems]);

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        await bag.addItem(newItemName, newItemCategory, newItemEssential);
        setNewItemName("");
        setNewItemEssential(false);
        setIsAdding(false);
    }

    const getTranslatedName = (item: any) => {
        const match = ESSENTIAL_ITEMS.find(e => e.itemName_en === item.item_name);
        if (match) {
            if (language === 'am') return match.itemName_am;
            if (language === 'om' && match.itemName_or) return match.itemName_or;
        }
        return item.item_name;
    };

    // Reorder Handlers
    const handleReorderCategories = (newOrder: string[]) => {
        setOrderedCategoryKeys(newOrder);
        const flattened: typeof bag.items = [];
        newOrder.forEach(cat => {
            if (groupedItems[cat]) {
                flattened.push(...groupedItems[cat]);
            }
        });
        bag.reorderItems(flattened);
    };

    const handleReorderItems = (catKey: string, newItems: typeof bag.items) => {
        const flattened: typeof bag.items = [];
        orderedCategoryKeys.forEach(cat => {
            if (cat === catKey) {
                flattened.push(...newItems);
            } else if (groupedItems[cat]) {
                flattened.push(...groupedItems[cat]);
            }
        });
        bag.reorderItems(flattened);
    };

    return (
        <div className="min-h-screen bg-black pb-32 px-6 pt-[calc(env(safe-area-inset-top)+20px)] flex flex-col gap-6 overscroll-none">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button isIconOnly variant="light" onPress={() => router.back()} className="text-zinc-400 -ml-2">
                    <ArrowLeft />
                </Button>
                
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                     <ShoppingBag size={24} className="text-emerald-500" />
                </div>

                <div>
                    <h1 className="text-xl font-bold text-white leading-tight">{t('emergency_bag' as any) || 'Emergency Bag'}</h1>
                    <p className="text-zinc-400 text-[10px] leading-tight">{t('bag_subtitle' as any) || 'Essentials to grab and go.'}</p>
                </div>

                {/* Progress Number */}
                <div className="ml-auto flex flex-col items-end">
                    <span className="text-2xl font-black text-emerald-500 leading-none">{bag.progress}%</span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase">{t('status_packed' as any) || "Packed"}</span>
                </div>
            </div>

            {/* Progress Bar (Only when not editing) */}
            {!isEditing && (
                 <div className="flex flex-col gap-1 w-full">
                     <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bag.progress}%` }} />
                     </div>
                     {/* Audit Progress (Reference) */}
                     <div className="flex flex-col gap-1 mt-1 opacity-50">
                         <div className="flex justify-between items-center px-0.5">
                             <span className="text-[9px] font-bold uppercase text-zinc-600">{t('security_audit' as any) || 'Security Audit'}</span>
                         </div>
                         <div className="w-full h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${audit.progress}%` }} />
                         </div>
                     </div>
                 </div>
            )}
            
            {/* Action Row */}
            <div className="flex justify-end gap-2">
                 <button 
                    onClick={() => setIsAdding(true)}
                    className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800"
                 >
                    <Plus size={12} />
                    {t('add_item' as any) || "Add"}
                 </button>

                 <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors border
                        ${isEditing ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "text-zinc-500 hover:text-zinc-300 border-transparent"}`}
                 >
                    {isEditing ? (
                        <>{t('save' as any) || "Done"}</>
                    ) : (
                        <>
                            <PenSquare size={12} />
                            {t('manage_plan' as any) || "Manage"}
                        </>
                    )}
                 </button>
            </div>

            {/* List - Always Sortable */}
            <Reorder.Group axis="y" values={orderedCategoryKeys} onReorder={handleReorderCategories} className="flex flex-col gap-6">
                {orderedCategoryKeys.map(cat => {
                    const items = groupedItems[cat] || [];
                    return (
                        <SortableCategory 
                            key={cat} 
                            cat={cat} 
                            items={items} 
                            t={t} 
                            bag={bag} 
                            handleReorderItems={handleReorderItems} 
                            getTranslatedName={getTranslatedName}
                            isEditing={isEditing}
                        />
                    );
                })}
            </Reorder.Group>

            {/* Add Item Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
                        <h3 className="text-lg font-bold text-white mb-4">{t('add_item' as any) || "Add New Item"}</h3>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Item Name</label>
                                <Input 
                                    placeholder="e.g. Flashlight" 
                                    value={newItemName}
                                    onValueChange={setNewItemName}
                                    classNames={{ inputWrapper: "bg-black border border-zinc-800" }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(CATEGORY_CONFIG).filter(([k]) => k !== 'default').map(([key, conf]) => {
                                         const isSelected = newItemCategory === key;
                                         const Icon = conf.icon;
                                         return (
                                             <button 
                                                key={key}
                                                onClick={() => setNewItemCategory(key)}
                                                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all
                                                    ${isSelected ? `${conf.bg} ${conf.border} ${conf.color}` : "bg-black border-zinc-800 text-zinc-500 hover:bg-zinc-900"}`}
                                             >
                                                <Icon size={16} />
                                                <span className="text-[9px] font-bold uppercase">{conf.label}</span>
                                             </button>
                                         )
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-black border border-zinc-800 rounded-xl">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Mark as Essential</span>
                                    <span className="text-[10px] text-zinc-500">Crucial for survival</span>
                                </div>
                                <Switch size="sm" isSelected={newItemEssential} onValueChange={setNewItemEssential} color="warning" />
                            </div>

                            <div className="flex gap-3 mt-2">
                                <Button className="flex-1 bg-zinc-800 text-white" onPress={() => setIsAdding(false)}>
                                    {t('cancel' as any) || "Cancel"}
                                </Button>
                                <Button className="flex-1 bg-emerald-500 text-black font-bold" onPress={handleAddItem}>
                                    {t('save' as any) || "Add"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {bag.loading && <p className="text-center text-zinc-500">{t('loading' as any) || 'Loading...'}</p>}
        </div>
    );
}
