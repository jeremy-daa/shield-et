"use client";

import React from "react";
import { Button, Link } from "@heroui/react";

export default function CamouflageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV === 'development';
  const telegramLink = process.env.NEXT_PUBLIC_TELEGRAM_BOT_LINK || "#";

  return (
    <div className="relative min-h-screen">
      {children}
      
      {isDev && (
        <div className="fixed bottom-4 right-4 z-[9999] opacity-75 hover:opacity-100 transition-opacity">
            <Link 
                href={"/debug"}
                size="sm"
                color="warning" 
                className="font-mono text-xs"
            >
                Debug:  
            </Link>
            <Button 
                as={Link}
                href={telegramLink}
                isExternal
                size="sm"
                color="warning" 
                variant="flat"
                className="font-mono text-xs"
            >
                Launch App
            </Button>
        </div>
      )}
    </div>
  );
}
