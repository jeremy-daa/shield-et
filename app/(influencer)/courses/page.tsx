"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Tabs, Tab, Skeleton } from "@heroui/react";
import { BookOpen, Plus, Search, ArrowLeft } from "lucide-react";
import { getCourses, type Course } from "@/lib/course-helpers";
import { useSafety } from "@/context/SafetyContext";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "safety", label: "Safety" },
  { value: "legal", label: "Legal" },
  { value: "mental_health", label: "Mental Health" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
];

// Skeleton loading component for course cards
function CourseCardSkeleton() {
  return (
    <Card className="bg-zinc-900 border border-zinc-800">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg" />
      </CardHeader>
      <CardBody className="p-4 space-y-3">
        <Skeleton className="w-3/4 h-6 rounded" />
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-full h-4 rounded" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-4 rounded" />
        </div>
      </CardBody>
    </Card>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const { t } = useSafety();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tab, setTab] = useState<"all" | "published" | "drafts">("all");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    // Tab filter
    if (tab === "published" && !course.is_published) return false;
    if (tab === "drafts" && course.is_published) return false;

    // Category filter
    if (categoryFilter !== "all" && course.category !== categoryFilter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title_en.toLowerCase().includes(query) ||
        course.description_en?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-10 h-10 rounded-lg hidden sm:block" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-48 h-8 rounded" />
                <Skeleton className="w-64 h-4 rounded" />
              </div>
            </div>
            <Skeleton className="w-full sm:w-40 h-11 rounded-lg" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="w-full sm:w-1/2 h-11 rounded-lg" />
            <Skeleton className="w-full sm:w-1/4 h-11 rounded-lg" />
          </div>

          {/* Tabs Skeleton */}
          <Skeleton className="w-full h-12 rounded-lg mb-6" />

          {/* Course Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.back()}
              className="text-zinc-400 hover:text-white transition-colors min-w-10 w-10 h-10 sm:min-w-12 sm:w-12 sm:h-12 hidden sm:flex"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                My Courses
              </h1>
              <p className="text-zinc-400 text-sm md:text-base mt-1">
                Manage your educational content
              </p>
            </div>
          </div>
          <Button
            color="success"
            className="font-bold flex items-center gap-2 w-full sm:w-auto h-11 sm:h-12 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all border-2 border-gray-300 bg-zinc-800"
            startContent={<Plus size={20} />}
            onPress={() => router.push("/courses/new")}
          >
            Create Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search size={18} className="text-zinc-500" />}
            className="w-full sm:flex-1"
            classNames={{
              input: "bg-zinc-950 text-base",
              inputWrapper:
                "bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors h-11 sm:h-12",
            }}
            isClearable
            onClear={() => setSearchQuery("")}
          />
          <Select
            placeholder="Filter by category"
            selectedKeys={[categoryFilter]}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-64"
            classNames={{
              trigger:
                "bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors h-11 sm:h-12",
              value: "text-base",
            }}
          >
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value}>{cat.label}</SelectItem>
            ))}
          </Select>
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key as any)}
          className="mb-6"
          classNames={{
            tabList: "bg-zinc-900 p-1 rounded-lg w-full sm:w-auto",
            cursor: "bg-emerald-500 shadow-md",
            tab: "data-[hover-unselected=true]:opacity-70 h-10 sm:h-11 px-4 sm:px-6 transition-all",
            tabContent: "group-data-[selected=true]:text-white font-medium",
          }}
          fullWidth={false}
        >
          <Tab
            key="all"
            title={
              <span className="flex items-center gap-2">
                <span>All</span>
                <span className="text-xs bg-zinc-800 group-data-[selected=true]:bg-emerald-600 px-2 py-0.5 rounded-full transition-colors">
                  {courses.length}
                </span>
              </span>
            }
          />
          <Tab
            key="published"
            title={
              <span className="flex items-center gap-2">
                <span>Published</span>
                <span className="text-xs bg-zinc-800 group-data-[selected=true]:bg-emerald-600 px-2 py-0.5 rounded-full transition-colors">
                  {courses.filter((c) => c.is_published).length}
                </span>
              </span>
            }
          />
          <Tab
            key="drafts"
            title={
              <span className="flex items-center gap-2">
                <span>Drafts</span>
                <span className="text-xs bg-zinc-800 group-data-[selected=true]:bg-emerald-600 px-2 py-0.5 rounded-full transition-colors">
                  {courses.filter((c) => !c.is_published).length}
                </span>
              </span>
            }
          />
        </Tabs>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="bg-zinc-900/50 border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardBody className="text-center py-16 sm:py-20 lg:py-24">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BookOpen size={40} className="text-zinc-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {searchQuery || categoryFilter !== "all"
                  ? "No courses match your filters"
                  : "You haven't created any courses yet"}
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search criteria or filters to find what you're looking for"
                  : "Get started by creating your first safety or educational course for your audience"}
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Button
                  color="success"
                  size="lg"
                  startContent={<Plus size={20} />}
                  onPress={() => router.push("/courses/new")}
                  className="font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                >
                  Create Your First Course
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredCourses.map((course, index) => (
              <Card
                key={course.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
                isPressable
                onPress={() => router.push(`/courses/${course.id}`)}
              >
                <CardHeader className="p-0 overflow-hidden">
                  {course.thumbnail_url ? (
                    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-zinc-800">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title_en}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-48 sm:h-52 bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center group-hover:from-zinc-750 group-hover:to-zinc-850 transition-all">
                      <BookOpen
                        size={56}
                        className="text-zinc-700 group-hover:text-zinc-600 transition-colors"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardBody className="p-5 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors leading-tight">
                    {course.title_en}
                  </h3>
                  {course.description_en && (
                    <p className="text-zinc-400 text-sm sm:text-base line-clamp-2 mb-4 leading-relaxed">
                      {course.description_en}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span
                      className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${
                        course.is_published
                          ? "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25"
                          : "bg-orange-500/15 text-orange-400 group-hover:bg-orange-500/25"
                      }`}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                    {course.category && (
                      <span className="text-xs sm:text-sm text-zinc-500 capitalize font-medium">
                        {course.category.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
