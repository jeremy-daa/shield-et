import React from 'react';
import SupportDetail from "@/components/portal/dashboard/SupportDetail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SupportDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SupportDetail resourceId={id} />;
}
