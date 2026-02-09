"use client";

import React, { useState } from "react";
import { Card, CardBody, CardFooter, Chip, ScrollShadow } from "@heroui/react";
import type { NewsArticle } from "../../lib/news";
import type { WeatherData } from "../../lib/weather";
import {
  CloudRain,
  Cloud,
  CloudLightning,
  Sun,
  MapPin,
  Droplets,
  ThermometerSun,
  Wind,
  Newspaper,
  Globe,
  ChevronRight,
} from "lucide-react";

interface NewsFeedProps {
  news: NewsArticle[];
  weather: WeatherData | null;
}

const CATEGORIES = [
  "All",
  "Ethiopia",
  "World",
  "Tech",
  "Business",
  "Sports",
  "Health",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000";

const SafeImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(FALLBACK_IMAGE)}
    />
  );
};

export const NewsFeed = ({ news, weather }: NewsFeedProps) => {
  // Use first article as hero if available
  const heroArticle = news[0];
  const listArticles = news.slice(1);

  // Helper for weather icon
  const getWeatherIcon = (text: string) => {
    if (!text) return <Sun className="w-8 h-8 text-yellow-500" />;
    const t = text.toLowerCase();
    if (t.includes("rain") || t.includes("drizzle"))
      return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (t.includes("cloud") || t.includes("overcast"))
      return <Cloud className="w-8 h-8 text-gray-400" />;
    if (t.includes("storm") || t.includes("thunder"))
      return <CloudLightning className="w-8 h-8 text-purple-400" />;
    if (t.includes("mist") || t.includes("fog"))
      return <Wind className="w-8 h-8 text-teal-400" />;
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  return (
    <div className="pb-24 overflow-x-hidden min-h-screen bg-black">
      {/* Weather Widget - Sexy Glass */}
      <div className="px-4 pt-6 mb-8">
        <div className="relative overflow-hidden rounded-4xl bg-zinc-900 border border-zinc-800 shadow-2xl">
          {/* Background Ambience */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          <div className="block relative z-10 p-6">
            {/* Location & Loc */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-1 mb-2">
                  <MapPin size={12} className="text-primary" />{" "}
                  {weather?.location.name || "Addis Ababa"}
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-6xl font-bold text-white tracking-tighter">
                    {weather ? Math.round(weather.current.temp_c) : "--"}°
                  </h2>
                  <div className="flex flex-col">
                    {getWeatherIcon(weather?.current.condition.text || "")}
                    <span className="text-zinc-400 text-xs font-medium mt-1">
                      {weather?.current.condition.text || "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-800/50 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm border border-zinc-700/30">
                <ThermometerSun size={16} className="text-orange-400 mb-1" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                  Feels Like
                </span>
                <span className="text-white font-semibold text-sm">
                  {weather
                    ? `${Math.round(weather.current.feelslike_c)}°`
                    : "--"}
                </span>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm border border-zinc-700/30">
                <Droplets size={16} className="text-blue-400 mb-1" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                  Humidity
                </span>
                <span className="text-white font-semibold text-sm">
                  {weather ? `${weather.current.humidity}%` : "--"}
                </span>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm border border-zinc-700/30">
                <Sun size={16} className="text-yellow-400 mb-1" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                  UV Index
                </span>
                <span className="text-white font-semibold text-sm">
                  {weather ? weather.current.uv : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8 w-screen max-w-full pl-4">
        <ScrollShadow
          orientation="horizontal"
          className="w-full pb-2"
          hideScrollBar
        >
          <div className="flex gap-3 whitespace-nowrap pr-4">
            {CATEGORIES.map((cat, i) => (
              <Chip
                key={cat}
                variant="flat"
                classNames={{
                  base: `bg-zinc-900/80 backend-blur-md border border-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer py-4 px-1 ${i === 0 ? "bg-zinc-800 border-zinc-700" : ""}`,
                  content: "text-sm font-medium text-zinc-300 drop-shadow-sm",
                }}
              >
                {cat}
              </Chip>
            ))}
          </div>
        </ScrollShadow>
      </div>

      <div className="space-y-6 px-4">
        {heroArticle && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Top Story
              </h2>
            </div>

            <div
              className="group relative w-full aspect-[4/3] sm:aspect-video rounded-4xl overflow-hidden shadow-2xl cursor-pointer"
              onClick={() => window.open(heroArticle.url, "_blank")}
            >
              <div className="absolute inset-0 bg-zinc-900">
                <SafeImage
                  src={heroArticle.image_url}
                  alt={heroArticle.title}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="absolute top-4 right-4 z-10">
                <Chip
                  size="sm"
                  color="danger"
                  variant="shadow"
                  className="uppercase font-bold tracking-wider"
                >
                  LIVE
                </Chip>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-primary/20 backdrop-blur-md">
                    {heroArticle.source}
                  </span>
                  <span className="text-zinc-400 text-xs font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-md">
                    {new Date(heroArticle.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3 line-clamp-3 drop-shadow-lg">
                  {heroArticle.title}
                </h3>
                <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed max-w-2xl drop-shadow-md">
                  {heroArticle.description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-zinc-700 rounded-full"></div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Latest News
              </h2>
            </div>
            <ChevronRight className="text-zinc-600" />
          </div>

          <div className="flex flex-col gap-4">
            {listArticles.map((article) => (
              <div
                key={article.uuid}
                className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-3 flex gap-4 overflow-hidden active:scale-[0.98] transition-all duration-300"
                onClick={() => window.open(article.url, "_blank")}
              >
                <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-zinc-800 relative">
                  <SafeImage
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-col justify-between py-1 pr-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {article.source.length > 15
                          ? article.source.substring(0, 15) + "..."
                          : article.source}
                      </span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(article.published_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
