import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserProfile } from "@/lib/course-helpers";

export default async function InfluencerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Check if user has influencer role
  const profile = await getUserProfile(session.user.id, supabase);
  
  if (!profile || profile.user_role !== "influencer") {
    redirect("/dashboard"); // Regular users go to dashboard
  }

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
