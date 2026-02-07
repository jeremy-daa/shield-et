"use client";

import React from "react";
import { Card, CardBody, Button, Skeleton } from "@heroui/react";
import { Phone } from "lucide-react";
import { useSafety } from "../../../context/SafetyContext";
import { Models } from "appwrite";

interface SupportResource extends Models.Document {
  name: string;
  category: string;
  phone: string;
  description?: string;
}

interface RecentResourcesProps {
    resources: SupportResource[];
    isLoading: boolean;
}

export const RecentResources = ({ resources, isLoading }: RecentResourcesProps) => {
    const { t } = useSafety();

    return (
       <Card className="bg-zinc-900/50 border border-zinc-800/50">
           <CardBody className="p-3 gap-2">
               {isLoading ? (
                   <Skeleton className="rounded-lg h-12 w-full bg-zinc-800"/>
               ) : resources.length > 0 ? (
                   resources.slice(0, 2).map(r => (
                       <div key={r.$id} className="flex justify-between items-center p-2 rounded-lg bg-zinc-800/50">
                           <div className="flex flex-col">
                               <span className="text-sm font-bold text-zinc-300">{r.name}</span>
                               <span className="text-[10px] text-zinc-500">{r.category}</span>
                           </div>
                           <Button size="sm" isIconOnly variant="flat" color="success" onPress={() => window.open(`tel:${r.phone}`, '_self')}>
                               <Phone size={14}/>
                           </Button>
                       </div>
                   ))
               ) : (
                   <div className="text-xs text-center text-zinc-600 py-2">{t('no_resources')}</div>
               )}
           </CardBody>
       </Card>
    );
};
