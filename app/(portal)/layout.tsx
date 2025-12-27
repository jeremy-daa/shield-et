"use client";

import React from "react";
import { Navbar, NavbarContent, Button, Link } from "@heroui/react";
import { Home, Lock, Map, FolderHeart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Map", icon: Map, href: "/dashboard/map" },
    { name: "Vault", icon: Lock, href: "/dashboard/vault" },
    { name: "Hub", icon: FolderHeart, href: "/dashboard/hub" },
  ];

  return (
    <div className="h-screen w-full bg-[#0a0a12] text-foreground flex flex-col overflow-hidden relative">
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 relative">
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
             const isActive = pathname === item.href;
             const Icon = item.icon;
             
             return (
                 <Link key={item.name} href={item.href} className="w-full">
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
    </div>
  );
}
