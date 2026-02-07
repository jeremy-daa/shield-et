import SupportDirectory from "@/components/portal/dashboard/SupportDirectory";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Network | Shield',
  description: 'Find verified support resources nearby.',
};

export default function SupportPage() {
  return <SupportDirectory />;
}
