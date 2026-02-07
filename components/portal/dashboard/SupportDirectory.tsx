"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Autocomplete, AutocompleteItem, Button } from "@heroui/react";
import { MapPin, Phone, Home, Scale, Stethoscope, HeartHandshake, ShieldCheck, Search, LocateFixed, Navigation } from "lucide-react";
import { useSafety } from "@/context/SafetyContext";
import { SEARCH_INDEX, CitySearchIndex } from "@/lib/cities";
import { getSupportResources } from "@/lib/supabase-helpers";
import { Models } from "appwrite";
import Fuse from 'fuse.js';

interface SupportResource extends Models.Document {
  id: string;
  name: string;
  category: "shelter" | "legal" | "medical" | "counseling" | "hotline";
  phone: string;
  location: string;
  address?: string;
  description_am: string;
  description_en: string;
  description_or: string;
  verified: boolean;
  lat?: number;
  lng?: number;
}

const CATEGORY_ICONS = {
  shelter: Home,
  legal: Scale,
  medical: Stethoscope,
  counseling: HeartHandshake,
  hotline: Phone,
};

const CATEGORY_COLORS = {
  shelter: "text-orange-500 bg-orange-500/10",
  legal: "text-blue-500 bg-blue-500/10",
  medical: "text-red-500 bg-red-500/10",
  counseling: "text-purple-500 bg-purple-500/10",
  hotline: "text-green-500 bg-green-500/10",
};

export default function SupportDirectory() {
  const router = useRouter();
  const { t, language } = useSafety();
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityKey, setSelectedCityKey] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSupportResources();
        const dbDocs = res.documents as unknown as SupportResource[];
        setResources(dbDocs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Fuse Instance
  const fuse = useMemo(
    () =>
      new Fuse(SEARCH_INDEX, {
        keys: ["n", "loc.am", "loc.om", "a"],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true,
      }),
    [],
  );

  // Filtered Cities based on Input
  const filteredCities = useMemo(() => {
    if (!inputValue) return SEARCH_INDEX.slice(0, 50);
    return fuse.search(inputValue).map((result) => result.item);
  }, [inputValue, fuse]);

  const selectedCity = useMemo(() => {
    return (
      SEARCH_INDEX.find((c) => c.n === selectedCityKey) ||
      SEARCH_INDEX.find((c) => c.n === "Addis Ababa")
    );
  }, [selectedCityKey]);

  const activeLocation = useMemo(() => {
    if (userLocation) return userLocation;
    return selectedCity;
  }, [userLocation, selectedCity]);

  const handleUseLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSelectedCityKey(null);
        setInputValue("Current Location");
        setIsLocating(false);
      },
      () => {
        alert(t("gps_denied") as string);
        setIsLocating(false);
      },
    );
  };

  const sortedResources = useMemo(() => {
    if (!activeLocation) return resources;

    return [...resources].sort((a, b) => {
      const distA = calculateDistance(
        activeLocation.lat,
        activeLocation.lng,
        a.lat || 0,
        a.lng || 0,
      );
      const distB = calculateDistance(
        activeLocation.lat,
        activeLocation.lng,
        b.lat || 0,
        b.lng || 0,
      );

      if (!a.lat) return 1;
      if (!b.lat) return -1;
      return distA - distB;
    });
  }, [resources, activeLocation]);

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const getDescription = (res: SupportResource) => {
    if (language === "am" && res.description_am) return res.description_am;
    if (language === "om" && res.description_or) return res.description_or;
    return res.description_en || t("no_desc");
  };

  const getCityDisplayName = (city: CitySearchIndex) => {
    if (language === "am") return city.loc.am || city.n;
    if (language === "om") return city.loc.om || city.n;
    return city.n;
  };

  return (
    <div className="flex flex-col gap-8 p-5 pb-32 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <MapPin size={16} />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            {t("nav_support")}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {t("support_title")}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-[280px]">
            {t("support_subtitle")}
          </p>
        </div>
      </div>

      {/* City Filter */}
      {/* City Filter */}
      <div className="sticky top-4 z-20 flex flex-col gap-2 bg-zinc-900/90 backdrop-blur-xl p-3 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
            {t("filter_verification_zone")}
          </span>
          <Button
            size="sm"
            variant="light"
            startContent={<LocateFixed size={12} />}
            className={`min-h-7 h-7 px-4 rounded-full flex flex-row items-center justify-center gap-2 text-[10px] font-bold ${userLocation ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-500 bg-zinc-800/50"}`}
            onPress={handleUseLocation}
            isLoading={isLocating}
          >
            {t("btn_use_gps")}
          </Button>
        </div>
        <Autocomplete
          placeholder={
            userLocation
              ? "Using Current Location"
              : t("search_city_placeholder")
          }
          className="max-w-full"
          variant="bordered"
          aria-label="Select City"
          defaultFilter={() => true}
          selectedKey={selectedCityKey}
          onSelectionChange={(key) => {
            const k = key as string;
            if (k) {
              setSelectedCityKey(k);
              setUserLocation(null);
              // Find city to set display name
              const city = SEARCH_INDEX.find((c) => c.n === k);
              if (city) setInputValue(getCityDisplayName(city));
            }
          }}
          onInputChange={(value) => {
            setInputValue(value);
            if (!value) setSelectedCityKey(null);
          }}
          inputValue={inputValue}
          startContent={
            <div className="flex items-center justify-center min-w-8 text-zinc-500 pl-2 mr-1">
              {userLocation ? (
                <LocateFixed size={18} className="text-emerald-500" />
              ) : (
                <Search size={18} />
              )}
            </div>
          }
          inputProps={{
            classNames: {
              input:
                "w-full !bg-transparent !outline-none !ring-0 !ring-offset-0 focus:!ring-0 placeholder:text-zinc-500 text-zinc-100",
              inputWrapper:
                "flex flex-row items-center !bg-zinc-950/50 border border-zinc-800 !shadow-none !outline-none !ring-0 !ring-offset-0 focus-within:!ring-0 focus-within:!border-zinc-700 !min-h-11 h-11 rounded-xl transition-colors",
              innerWrapper: "flex flex-row items-center gap-2 w-full",
            },
          }}
          listboxProps={{
            classNames: {
              base: "bg-zinc-950 border border-zinc-800 rounded-xl p-0",
              list: "p-1",
            },
            itemClasses: {
              base: "text-zinc-300 data-[hover=true]:bg-zinc-900 data-[hover=true]:text-emerald-400 rounded-lg my-0.5",
              title: "font-medium",
            },
          }}
          popoverProps={{
            classNames: {
              content:
                "bg-zinc-950 border border-zinc-800 p-0 rounded-xl shadow-xl",
            },
          }}
        >
          {filteredCities.map((city) => (
            <AutocompleteItem
              key={city.n}
              textValue={getCityDisplayName(city)}
              className="text-zinc-300"
            >
              <div className="flex flex-col">
                <span>{getCityDisplayName(city)}</span>
                {language !== "en" && city.n !== getCityDisplayName(city) && (
                  <span className="text-[10px] text-zinc-500">{city.n}</span>
                )}
              </div>
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <p className="text-[9px] text-zinc-500 px-2 mt-0.5 flex items-start gap-1.5 opacity-60">
          <ShieldCheck size={9} className="mt-0.5" />
          <span>{t("gps_disclaimer")}</span>
        </p>
      </div>

      {/* Results List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
              {t("loading_scanning")}
            </span>
          </div>
        ) : sortedResources.length === 0 ? (
          <div className="text-center py-12 px-6 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <p className="text-zinc-500 font-medium">
              {t("no_resources_found")}
            </p>
            <p className="text-xs text-zinc-600 mt-2">
              {t("try_city_suggestion")}
            </p>
          </div>
        ) : (
          sortedResources.map((res) => {
            const Icon = CATEGORY_ICONS[res.category] || ShieldCheck;
            let distance = null;
            const rLat = res.lat || 0;
            const rLng = res.lng || 0;

            if (activeLocation && rLat && rLng) {
              const d = calculateDistance(
                activeLocation.lat,
                activeLocation.lng,
                rLat,
                rLng,
              );
              distance = d < 100 ? `${d.toFixed(1)}KM` : `>100KM`;
            }

            return (
              <div
                key={res.id}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col gap-3 transition-colors active:scale-[0.99] active:bg-zinc-900/50 cursor-pointer"
                onClick={() => router.push(`/dashboard/map/${res.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={`p-2 rounded-lg ${CATEGORY_COLORS[res.category] || "text-zinc-500 bg-zinc-900"} border border-zinc-900/50`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex items-center gap-3">
                    {activeLocation && distance && (
                      <span className="text-[9px] font-bold font-mono text-emerald-500 bg-emerald-500/10 h-6 px-2 flex items-center justify-center rounded-full border border-emerald-500/20">
                        {distance}
                      </span>
                    )}
                    <Button
                      size="sm"
                      isIconOnly
                      className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg w-8 h-8 flex items-center justify-center p-0 transition-colors"
                      onPress={(e) => {
                        // e is PressEvent, doesn't always have stopPropagation
                        // But we can add onClick handler too or rely on button eating the event?
                        const query =
                          res.lat && res.lng
                            ? `${res.lat},${res.lng}`
                            : encodeURIComponent(`${res.name} ${res.location}`);
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${query}`,
                          "_blank",
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={14} />
                    </Button>
                    <Button
                      size="sm"
                      isIconOnly
                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg w-8 h-8 flex items-center justify-center p-0 transition-colors"
                      onPress={() => window.open(`tel:${res.phone}`)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-200">
                      {res.name}
                    </span>
                    {res.verified && (
                      <ShieldCheck size={12} className="text-emerald-500" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    {t(`cat_${res.category}` as any)}
                  </span>

                  <p className="text-xs text-zinc-400 leading-relaxed mt-1 line-clamp-2">
                    {getDescription(res)}
                  </p>

                  <div className="mt-2 text-[10px] text-zinc-600 font-mono">
                    {res.location}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
