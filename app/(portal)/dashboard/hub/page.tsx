"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Skeleton } from "@heroui/react";
import { BookOpen, Search, ArrowLeft } from "lucide-react";
import { getCourses, type Course } from "@/lib/course-helpers";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "safety", label: "Safety" },
  { value: "legal", label: "Legal" },
  { value: "mental_health", label: "Mental Health" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
];

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

export default function ConsumerHubPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // Fetch only published courses
      const data = await getCourses({ publishedOnly: true });
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
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
      <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded" />
            <Skeleton className="w-64 h-4 rounded" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="w-full sm:w-1/2 h-11 rounded-lg" />
            <Skeleton className="w-full sm:w-1/4 h-11 rounded-lg" />
          </div>

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
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors mb-4"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </Button>
          
          <h1 className="text-3xl lg:text-4xl font-bold bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Learning Hub
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Essential safety guides and educational resources
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search size={18} className="text-zinc-500" />}
            className="w-full sm:flex-1"
            classNames={{
              input: "bg-zinc-950 text-base",
              inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors h-11 sm:h-12",
            }}
            isClearable
            onClear={() => setSearchQuery("")}
          />
          <Select
            placeholder="Category"
            selectedKeys={[categoryFilter]}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-64"
            classNames={{
              trigger: "bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors h-11 sm:h-12",
              value: "text-base",
              popoverContent: "bg-zinc-900 border border-zinc-800",
            }}
          >
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="bg-zinc-900/50 border border-dashed border-zinc-800">
            <CardBody className="text-center py-24">
              <div className="w-20 h-20 bg-linear-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BookOpen size={40} className="text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No guides found
              </h3>
              <p className="text-zinc-400 max-w-md mx-auto">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters to find what you're looking for"
                  : "We're currently updating our learning resources. Check back soon!"}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredCourses.map((course, index) => (
              <Card
                key={course.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                isPressable
                onPress={() => router.push(`/dashboard/hub/${course.id}`)}
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
                      <BookOpen size={56} className="text-zinc-700 group-hover:text-zinc-600 transition-colors" />
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
                    <span className="text-xs sm:text-sm text-emerald-500 font-medium">
                       Start Learning →
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
