"use client";

import React from "react";
import { Navbar, NavbarContent, Button, Link } from "@heroui/react";
import { LayoutGrid, ShieldCheck, MapPin, PlayCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { useHaptic } from "../../hooks/useHaptic";

import { useSafety } from "../../context/SafetyContext";
import { QuickExitFab } from "../../components/portal/QuickExitFab";
import { SafetyProgressProvider } from "../../context/SafetyProgressContext";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { triggerHaptic } = useHaptic();
  const { t } = useSafety();

  const navItems = [
    { name: t('nav_home') || "Home", icon: LayoutGrid, href: "/dashboard" },
    { name: t('nav_vault') || "Vault", icon: ShieldCheck, href: "/dashboard/vault" },
    { name: t('nav_support') || "Support", icon: MapPin, href: "/dashboard/map" },
    { name: t('tab_education') || "Education", icon: PlayCircle, href: "/dashboard/hub" },
  ];

  return (
    <SafetyProgressProvider>
        <div className="h-screen w-full bg-black text-foreground flex flex-col overflow-hidden relative">
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 relative pt-[calc(env(safe-area-inset-top)+80px)]">
            {children}
        </main>

        {/* Bottom Navigation Bar */}
        <Navbar 
            className="fixed bottom-0 top-auto z-50 h-[unset] pb-[calc(env(safe-area-inset-bottom)+20px)] bg-black/80 backdrop-blur-xl border-t border-white/5"
            classNames={{
                wrapper: "px-0 h-16 justify-center"
            }}
        >
            <NavbarContent className="gap-0 w-full justify-evenly">
            {navItems.map((item) => {
                // Logic for active state:
                // 1. Exact match always works
                // 2. StartsWith works for subroutes (e.g. /dashboard/vault/123), EXCEPT for root /dashboard which matches everything
                const isRoot = item.href === "/dashboard";
                const isActive = isRoot 
                    ? pathname === "/dashboard" 
                    : pathname.startsWith(item.href);

                const Icon = item.icon;
                
                return (
                    <Link key={item.href} href={item.href} className="w-full" onPress={() => triggerHaptic('light')}>
                        <Button 
                            variant="light" 
                            className={`w-full h-full flex flex-col gap-1 items-center justify-center rounded-none bg-transparent hover:bg-white/5 ${isActive ? "text-purple-400" : "text-zinc-500"}`}
                            radius="none"
                            isIconOnly={false}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Button>
                    </Link>
                );
            })}
            </NavbarContent>
        </Navbar>

        {/* Persistent Quick Exit FAB */}
        <QuickExitFab />
        </div>
    </SafetyProgressProvider>
  );
}
