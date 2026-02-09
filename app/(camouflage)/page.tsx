import React from "react";
import { CamouflageHeader } from "../../components/camouflage/CamouflageHeader";
import { NewsFeed } from "../../components/camouflage/NewsFeed";
import { TelegramMinimizer } from "../../components/camouflage/TelegramMinimizer";
import type { Metadata } from "next";

import { getNews } from "../../lib/news";
import { getWeather } from "../../lib/weather";

export const metadata: Metadata = {
  title: "Shield News - Daily Updates",
  description: "Stay updated with the latest headlines and weather.",
};

export default async function CamouflagePage() {
  const newsData = getNews();
  const weatherData = getWeather();

  const [news, weather] = await Promise.all([newsData, weatherData]);

  console.log("[Server Log] Camouflage Page Loaded");
  console.log("[Server Log] News Data:", JSON.stringify(news, null, 2));

  return (
    <main className="min-h-screen bg-background">
      <TelegramMinimizer />
      <CamouflageHeader />
      <NewsFeed news={news} weather={weather} />
    </main>
  );
}
