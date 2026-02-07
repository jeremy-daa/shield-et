"use client";

import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab, Button } from "@heroui/react";
import { PlayCircle, ShieldCheck, FileText, Image as ImageIcon, BookOpen, Settings, X } from "lucide-react";
import { useSafety } from "../../../context/SafetyContext";
import { useHaptic } from "../../../hooks/useHaptic";
import { motion, AnimatePresence } from "framer-motion";

export const EducationTabs = () => {
    const { t, language, setLanguage, calendar, setCalendar } = useSafety();
    const { triggerHaptic } = useHaptic();
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
       <>
           <Tabs 
             aria-label="Options" 
             color="primary" 
             variant="underlined"
             classNames={{
                 tabList: "gap-6 w-full relative rounded-none p-0 border-b border-zinc-800",
                 cursor: "w-full bg-purple-500",
                 tab: "max-w-fit px-0 h-12",
                 tabContent: "group-data-[selected=true]:text-purple-500"
             }}
             onSelectionChange={() => triggerHaptic('light')}
           >
               <Tab
                 key="education"
                 title={
                     <div className="flex items-center space-x-2">
                         <BookOpen size={16}/>
                         <span>{t('tab_education')}</span>
                     </div>
                 }
               >
                   <Card 
                        isPressable
                        onPress={() => { triggerHaptic('light'); setIsVideoOpen(true); }}
                        className="mt-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
                   >
                       <CardBody className="flex flex-row items-center gap-4">
                           <PlayCircle size={32} className="text-purple-500" />
                           <div className="flex flex-col items-start">
                               <span className="font-bold text-white text-left">{t('safety_guides_title')}</span>
                               <span className="text-xs text-zinc-400 text-ellipsis line-clamp-1 text-left">{t('safety_guides_desc')}</span>
                           </div>
                       </CardBody>
                   </Card>
               </Tab>
               <Tab
                 key="settings"
                 title={
                     <div className="flex items-center space-x-2">
                         <Settings size={16}/>
                         <span>{t('tab_settings')}</span>
                     </div>
                 }
               >
                   <Card className="mt-1 bg-zinc-900 border border-zinc-800">
                       <CardBody className="gap-6">
                           
                           {/* Language */}
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Language</label>
                               <div className="flex gap-2">
                                   {(['en', 'am', 'om'] as const).map((lang) => (
                                       <button 
                                         key={lang}
                                         onClick={() => { triggerHaptic('light'); setLanguage(lang); }}
                                         className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all border ${
                                             language === lang 
                                             ? 'bg-purple-500 text-white border-purple-500' 
                                             : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                         }`}
                                       >
                                         {lang === 'am' ? 'አማ' : (lang === 'om' ? 'Oromifaa' : 'ENG')}
                                       </button>
                                   ))}
                               </div>
                           </div>
    
                           {/* Calendar */}
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date Format</label>
                               <div className="flex gap-2">
                                   <button 
                                     onClick={() => { triggerHaptic('light'); setCalendar('ec'); }}
                                     className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all border flex items-center gap-2 ${
                                         calendar === 'ec' 
                                         ? 'bg-green-600 text-white border-green-600' 
                                         : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                     }`}
                                   >
                                     <span>🇪🇹</span> Ethiopian
                                   </button>
                                   <button 
                                     onClick={() => { triggerHaptic('light'); setCalendar('gc'); }}
                                     className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all border flex items-center gap-2 ${
                                         calendar === 'gc' 
                                         ? 'bg-blue-600 text-white border-blue-600' 
                                         : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                     }`}
                                   >
                                     <span>🌍</span> Gregorian
                                   </button>
                               </div>
                           </div>
    
                           <div className="h-px bg-zinc-800 my-2" />
                           <p className="text-zinc-600 font-mono text-[10px] text-center">SHIELD-ET v1.0.0 (Secure Build)</p>
                       </CardBody>
                   </Card>
               </Tab>
           </Tabs>

           {/* Video Overlay */}
           <AnimatePresence>
                {isVideoOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 backdrop-blur-xl"
                    >
                        {/* Video Container */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 relative z-20"
                        >
                            <video 
                                controls 
                                autoPlay 
                                playsInline
                                className="w-full h-full object-contain"
                                src="/videos/intro.mp4"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </motion.div>
                        
                        {/* Text and Close Button */}
                        <p className="text-zinc-500 text-sm mt-6 font-mono tracking-widest uppercase mb-6 text-center">
                            {t('safety_orientation' as any) || 'Safety Orientation'}
                        </p>
                        
                        <Button 
                            variant="flat" 
                            color="default"
                            onPress={() => setIsVideoOpen(false)}
                            className="bg-zinc-800 text-white font-bold uppercase tracking-wider px-8 py-6 h-auto min-w-[120px]"
                        >
                            {t('action_close' as any) || 'Close'}
                        </Button>
                    </motion.div>
                )}
           </AnimatePresence>
       </>
    );
};
