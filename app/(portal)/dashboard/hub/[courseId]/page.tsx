"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Accordion, AccordionItem, Skeleton, Chip } from "@heroui/react";
import { ArrowLeft, PlayCircle, BookOpen, Clock } from "lucide-react";
import { getCourseById, getLessonsByCourse, type Course, type Lesson } from "@/lib/course-helpers";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId)
      ]);
      setCourse(courseData);
      // Filter only published lessons for consumers? 
      // Usually yes, but maybe show them as "Coming Soon"? 
      // For now, let's filter purely published lessons.
      setLessons(lessonsData.filter(l => l.is_published));
    } catch (error) {
      console.error("Failed to load course data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-6 pb-24 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-full h-64 rounded-2xl" />
          <div className="space-y-4">
             <Skeleton className="w-3/4 h-8 rounded" />
             <Skeleton className="w-full h-24 rounded" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
        <div className="min-h-screen bg-black text-white p-6 pt-[calc(env(safe-area-inset-top)+20px)] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Course not found</h1>
                <Button onPress={() => router.back()} color="primary" variant="light">
                    Go Back
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 pb-24 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors mb-6"
        >
            <ArrowLeft size={24} />
        </Button>

        {/* Hero Section */}
        <div className="mb-8">
            {course.thumbnail_url ? (
                <div className="relative w-full aspect-video md:aspect-21/9 rounded-2xl overflow-hidden mb-6 bg-zinc-900 border border-zinc-800 shadow-2xl shadow-emerald-900/10">
                    <img 
                        src={course.thumbnail_url} 
                        alt={course.title_en}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                         <div className="flex flex-wrap gap-2 mb-3">
                            {course.category && (
                                <Chip size="sm" color="success" variant="flat" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
                                    {course.category.replace('_', ' ')}
                                </Chip>
                            )}
                            <Chip size="sm" variant="flat" className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 backdrop-blur-md">
                                {lessons.length} Lessons
                            </Chip>
                         </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                            {course.title_en}
                        </h1>
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">{course.title_en}</h1>
                    <div className="flex gap-2 text-zinc-400 text-sm">
                        <span>{course.category?.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{lessons.length} Lessons</span>
                    </div>
                </div>
            )}

            {course.description_en && (
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 md:p-6 mb-8 text-zinc-300 leading-relaxed">
                    {course.description_en}
                </div>
            )}
        </div>

        {/* Curriculum / Lessons */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <BookOpen className="text-emerald-500" size={24} />
                Course Content
            </h2>
            
            {lessons.length === 0 ? (
                <Card className="bg-zinc-900 border-dashed border-zinc-800">
                    <CardBody className="py-12 text-center text-zinc-500">
                        No lessons available for this course yet.
                    </CardBody>
                </Card>
            ) : (
                <Accordion 
                    variant="splitted" 
                    className="px-0"
                    itemClasses={{
                        base: "group mb-3",
                        title: "text-zinc-100 font-medium",
                        subtitle: "text-zinc-500",
                        trigger: "px-4 py-3 bg-zinc-900 data-[hover=true]:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors",
                        content: "p-4 bg-zinc-900/50 border-x border-b border-zinc-800 rounded-b-xl -mt-2",
                        indicator: "text-zinc-400"
                    }}
                >
                    {lessons.map((lesson, index) => (
                        <AccordionItem 
                            key={lesson.id} 
                            aria-label={lesson.title_en}
                            title={
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700">
                                        {index + 1}
                                    </span>
                                    <span>{lesson.title_en}</span>
                                </div>
                            }
                            subtitle={
                                <div className="flex items-center gap-3 text-xs pt-1">
                                    {lesson.duration_minutes && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {lesson.duration_minutes} min
                                        </span>
                                    )}
                                    {lesson.video_url && (
                                        <span className="flex items-center gap-1 text-emerald-500">
                                            <PlayCircle size={12} /> Video
                                        </span>
                                    )}
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                {lesson.video_url && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800">
                                        <iframe 
                                            src={(() => {
                                                const url = lesson.video_url;
                                                if (!url) return "";
                                                if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
                                                if (url.includes("youtu.be/")) {
                                                    const id = url.split("youtu.be/")[1]?.split("?")[0];
                                                    return `https://www.youtube.com/embed/${id}`;
                                                }
                                                return url;
                                            })()}
                                            className="w-full h-full" 
                                            allowFullScreen 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    </div>
                                )}
                                
                                {lesson.content_en && (
                                    <div className="prose prose-invert max-w-none text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                        {lesson.content_en}
                                    </div>
                                )}

                                {!lesson.video_url && !lesson.content_en && (
                                    <p className="text-zinc-500 italic text-sm">No content added yet.</p>
                                )}
                            </div>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
      </div>
    </div>
  );
}
