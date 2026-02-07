import React from "react";
import { CamouflageHeader } from "../../components/camouflage/CamouflageHeader";
import { NewsFeed } from "../../components/camouflage/NewsFeed";
import { TelegramMinimizer } from "../../components/camouflage/TelegramMinimizer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shield News - Daily Updates",
  description: "Stay updated with the latest headlines and weather.",
};

export default function CamouflagePage() {
  return (
    <main className="min-h-screen bg-background">
      <TelegramMinimizer />
      <CamouflageHeader />
      <NewsFeed />
    </main>
  );
}
