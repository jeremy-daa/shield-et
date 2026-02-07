"use client";

import React, { useState, useEffect } from "react";
import { getSupportResources } from "../../../lib/appwrite";
import { Models } from "appwrite";

// Components
import { DashboardHeader } from "../../../components/portal/dashboard/DashboardHeader";
import { HighStressActions } from "../../../components/portal/dashboard/HighStressActions";
import { VaultGrid } from "../../../components/portal/dashboard/VaultGrid";
import { RecentResources } from "../../../components/portal/dashboard/RecentResources";
import { EducationTabs } from "../../../components/portal/dashboard/EducationTabs";
import { QuickExitFab } from "../../../components/portal/QuickExitFab";

interface SupportResource extends Models.Document {
  name: string;
  category: string;
  phone: string;
  description?: string;
}

export default function DashboardPage() {
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  useEffect(() => {
    // 1. Force Fullscreen and Expand on Mount
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        try {
            window.Telegram.WebApp.requestFullscreen?.();
            window.Telegram.WebApp.expand?.();
        } catch (e) {
            console.warn("Fullscreen/Expand failed", e);
        }
    }

    // 2. Fetch resources
    const fetchResources = async () => {
        try {
            const data = await getSupportResources();
            setResources(data.documents as unknown as SupportResource[]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingResources(false);
        }
      };
      fetchResources();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 p-4 pb-32 overscroll-contain">
       <DashboardHeader />
       
       <HighStressActions />

       <section className="flex flex-col gap-4">
           {/* Tier 2: Vault & Map Grid */}
           <VaultGrid />
           
           {/* Tier 2: Recent Resources
           <RecentResources resources={resources} isLoading={isLoadingResources} /> */}
       </section>

       <EducationTabs />
       
       <QuickExitFab />
    </div>
  );
}
