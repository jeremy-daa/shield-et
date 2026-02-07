'use client';
import { SafetyProgressProvider } from "@/context/SafetyProgressContext";

export default function SafetyPlanLayout({ children }: { children: React.ReactNode }) {
    return (
        <SafetyProgressProvider>
            {children}
        </SafetyProgressProvider>
    );
}
