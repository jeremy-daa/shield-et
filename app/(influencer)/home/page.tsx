"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { BookOpen, Plus, BarChart3, Users, ArrowLeft } from "lucide-react";
import { getCourses, getUserProfile, type Course, type UserProfile } from "@/lib/course-helpers";
import { useSafety } from "@/context/SafetyContext";

export default function InfluencerDashboard() {
  const router = useRouter();
  const { t } = useSafety();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, coursesData] = await Promise.all([
          getUserProfile(),
          getCourses()
        ]);
        
        setProfile(profileData);
        
        // Filter to only show current influencer's courses
        if (profileData) {
          const myCourses = coursesData.filter(c => c.influencer_id === profileData.id);
          setCourses(myCourses);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    draftCourses: courses.filter(c => !c.is_published).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push("/dashboard")}
              className="text-zinc-400 hidden sm:flex"
            >
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Influencer Dashboard</h1>
              <p className="text-zinc-400 text-sm md:text-base mt-1">
                Welcome back, {profile?.display_name || "Influencer"}!
              </p>
            </div>
          </div>
          <Button
            color="success"
            className="font-bold w-full sm:w-auto flex items-center gap-2 bg-zinc-800"
            startContent={<Plus size={20} />}
            onPress={() => router.push("/courses/new")}
          >
            Create Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-zinc-900 border border-zinc-800 shadow-sm">
            <CardBody className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs md:text-sm font-medium uppercase tracking-wider">Total Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900 border border-zinc-800 shadow-sm">
            <CardBody className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs md:text-sm font-medium uppercase tracking-wider">Published</p>
                  <p className="text-2xl font-bold">{stats.publishedCourses}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900 border border-zinc-800 shadow-sm">
            <CardBody className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs md:text-sm font-medium uppercase tracking-wider">Drafts</p>
                  <p className="text-2xl font-bold">{stats.draftCourses}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Your Courses
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{courses.length}</span>
            </h2>
            <Button
              variant="light"
              className="text-emerald-500 font-medium"
              onPress={() => router.push("/courses")}
              size="sm"
            >
              View All
            </Button>
          </div>

          {courses.length === 0 ? (
            <Card className="bg-zinc-900/50 border border-dashed border-zinc-800">
              <CardBody className="text-center py-16">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} className="text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
                <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                  Get started by creating your first safety or educational course for your audience.
                </p>
                <Button
                  color="success"
                  startContent={<Plus size={18} />}
                  onPress={() => router.push("/courses/new")}
                  className="flex items-center gap-2"
                >
                  Create Your First Course
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <Card
                  key={course.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 group"
                  isPressable
                  onPress={() => router.push(`/courses/${course.id}`)}
                >
                  <CardHeader className="p-0 overflow-hidden aspect-video relative">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title_en}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <BookOpen size={48} className="text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-md ${
                          course.is_published
                            ? "bg-green-500/90 text-white"
                            : "bg-orange-500/90 text-white"
                        }`}
                      >
                        {course.is_published ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5 flex flex-col h-full">
                    <div className="flex-1">
                      {course.category && (
                        <p className="text-xs text-emerald-500 font-medium mb-1 uppercase tracking-wider">
                          {course.category.replace("_", " ")}
                        </p>
                      )}
                      <h3 className="font-bold text-lg mb-2 text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {course.title_en}
                      </h3>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">
                        {course.description_en || "No description provided."}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                      <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Edit Course
                      </span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
