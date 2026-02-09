"use client";

import { useEffect, useState, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Tabs, Tab, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  Edit3,
  AlertCircle,
  Loader2,
  BookOpen,
  Languages,
  ChevronDown,
  PlayCircle,
  CheckCircle,
  X
} from "lucide-react";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  type Course,
  type Lesson,
  type CreateLessonData,
} from "@/lib/course-helpers";

const CATEGORIES = [
  { value: "safety", label: "Safety / Emergency" },
  { value: "legal", label: "Legal Guidance" },
  { value: "mental_health", label: "Mental Health Support" },
  { value: "financial", label: "Financial Independence" },
  { value: "other", label: "General / Other" },
] as const;

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

interface SortableLessonItemProps {
  lesson: Lesson;
  index: number;
  handleToggleLessonPublish: (lesson: Lesson) => void;
  openLessonModal: (lesson: Lesson) => void;
  handleDeleteLesson: (id: string) => void;
}

function SortableLessonItem({ lesson, index, handleToggleLessonPublish, openLessonModal, handleDeleteLesson }: SortableLessonItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={lesson}
      dragListener={false}
      dragControls={controls}
      className="relative z-0 mb-3"
      style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-y' }}
    >
      <div
        className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all"
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Drag Handle & Number */}
          <div className="flex items-center gap-3 min-w-[60px]">
            <div 
                onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
                className="cursor-grab active:cursor-grabbing shrink-0 touch-none text-zinc-600 hover:text-white transition-colors"
                style={{ touchAction: 'none' }}
            >
                <GripVertical size={20} />
            </div>
            <span className="text-xs font-bold text-zinc-500">#{index + 1}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-white truncate text-base">{lesson.title_en}</h3>
                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                    lesson.is_published 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {lesson.is_published ? (
                      <>
                        <CheckCircle size={10} /> Published
                      </>
                    ) : (
                      <>
                        <AlertCircle size={10} /> Draft
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {lesson.description_en && (
              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                {lesson.description_en}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
              {lesson.duration_minutes && (
                <div className="flex items-center gap-1">
                  <PlayCircle size={12} />
                  <span>{lesson.duration_minutes} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen size={12} />
                <span>{(lesson.content_en?.length || 0) > 0 ? "Content added" : "No content"}</span>
              </div>
              {lesson.video_url && (
                 <div className="flex items-center gap-1 text-blue-400">
                   <PlayCircle size={12} />
                   <span>Video linked</span>
                 </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
            <div className="flex w-full sm:w-auto gap-2">
                <button
                    onClick={() => handleToggleLessonPublish(lesson)}
                    className={`flex-1 sm:flex-none p-2 rounded-lg border transition-colors ${
                        lesson.is_published 
                        ? "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10" 
                        : "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                    title={lesson.is_published ? "Unpublish" : "Publish"}
                >
                    {lesson.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                    onClick={() => openLessonModal(lesson)}
                    className="flex-1 sm:flex-none p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Edit"
                >
                    <Edit3 size={16} />
                </button>
                <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="flex-1 sm:flex-none p-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "lessons">("details");

  // Course form state
  const [titleEn, setTitleEn] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [showAmharic, setShowAmharic] = useState(false);
  const [showOromo, setShowOromo] = useState(false);
  const [titleAm, setTitleAm] = useState("");
  const [titleOr, setTitleOr] = useState("");
  const [descAm, setDescAm] = useState("");
  const [descOr, setDescOr] = useState("");

  // Lesson form state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitleEn, setLessonTitleEn] = useState("");
  const [lessonDescEn, setLessonDescEn] = useState("");
  const [lessonContentEn, setLessonContentEn] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonSaving, setLessonSaving] = useState(false);
  
  // Lesson translation state
  const [showLessonAmharic, setShowLessonAmharic] = useState(false);
  const [showLessonOromo, setShowLessonOromo] = useState(false);
  const [lessonTitleAm, setLessonTitleAm] = useState("");
  const [lessonTitleOr, setLessonTitleOr] = useState("");
  const [lessonDescAm, setLessonDescAm] = useState("");
  const [lessonDescOr, setLessonDescOr] = useState("");
  const [lessonContentAm, setLessonContentAm] = useState("");
  const [lessonContentOr, setLessonContentOr] = useState("");

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reorderLessons = async (orderedLessons: Lesson[]) => {
    // Optimistic Update
    setLessons(orderedLessons);

    // Debounce DB updates
    if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
        for (let i = 0; i < orderedLessons.length; i++) {
            const lesson = orderedLessons[i];
            const intendedSort = i + 1;
            
            // Only update if sort order actually changed
            if (lesson.sort_order !== intendedSort) {
                try {
                    await updateLesson(lesson.id, { sort_order: intendedSort });
                    // Throttle to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (e) {
                     console.error("Reorder sync failed for lesson", lesson.title_en, e);
                }
            }
        }
    }, 2000); 
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);

      if (!courseData) {
        setError("Course not found");
        setLoading(false);
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData);

      // Populate course form
      setTitleEn(courseData.title_en);
      setDescEn(courseData.description_en || "");
      setCategory(courseData.category || "");
      setDifficulty(courseData.difficulty_level || "");
      setThumbnailUrl(courseData.thumbnail_url || "");
      setTitleAm(courseData.title_am || "");
      setTitleOr(courseData.title_or || "");
      setDescAm(courseData.description_am || "");
      setDescOr(courseData.description_or || "");

      if (courseData.title_am || courseData.description_am) setShowAmharic(true);
      if (courseData.title_or || courseData.description_or) setShowOromo(true);
    } catch (err) {
      console.error("Failed to load course:", err);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    setError(null);

    if (!titleEn.trim()) {
      setError("English title is required");
      setSaving(false);
      return;
    }

    const success = await updateCourse(courseId, {
      title_en: titleEn,
      title_am: titleAm || null,
      title_or: titleOr || null,
      description_en: descEn || null,
      description_am: descAm || null,
      description_or: descOr || null,
      thumbnail_url: thumbnailUrl || null,
      category: category as any || null,
      difficulty_level: difficulty as any || null,
    });

    if (success) {
      await loadCourseData();
    } else {
      setError("Failed to save changes");
    }

    setSaving(false);
  };

  const handleTogglePublish = async () => {
    if (!course) return;

    const success = await updateCourse(courseId, {
      is_published: !course.is_published,
    });

    if (success) {
      await loadCourseData();
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    const success = await deleteCourse(courseId);
    if (success) {
      router.push("/courses");
    } else {
      setError("Failed to delete course");
    }
  };

  const openLessonModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitleEn(lesson.title_en);
      setLessonDescEn(lesson.description_en || "");
      setLessonContentEn(lesson.content_en || "");
      setLessonVideoUrl(lesson.video_url || "");
      setLessonDuration(lesson.duration_minutes?.toString() || "");
      
      // Translations
      setLessonTitleAm(lesson.title_am || "");
      setLessonTitleOr(lesson.title_or || "");
      setLessonDescAm(lesson.description_am || "");
      setLessonDescOr(lesson.description_or || "");
      setLessonContentAm(lesson.content_am || "");
      setLessonContentOr(lesson.content_or || "");
      
      setShowLessonAmharic(!!(lesson.title_am || lesson.description_am || lesson.content_am));
      setShowLessonOromo(!!(lesson.title_or || lesson.description_or || lesson.content_or));
    } else {
      setEditingLesson(null);
      setLessonTitleEn("");
      setLessonDescEn("");
      setLessonContentEn("");
      setLessonVideoUrl("");
      setLessonDuration("");
      
      // Reset translations
      setLessonTitleAm("");
      setLessonTitleOr("");
      setLessonDescAm("");
      setLessonDescOr("");
      setLessonContentAm("");
      setLessonContentOr("");
      setShowLessonAmharic(false);
      setShowLessonOromo(false);
    }
    onOpen();
  };

  const handleSaveLesson = async () => {
    if (!lessonTitleEn.trim()) return;
    
    setLessonSaving(true);
    
    // In a real app, we'd calculate sort order properly
    const sortOrder = editingLesson ? editingLesson.sort_order : lessons.length + 1;
    
    const lessonData: any = {
      title_en: lessonTitleEn,
      description_en: lessonDescEn || null,
      content_en: lessonContentEn || null,
      title_am: lessonTitleAm || null,
      description_am: lessonDescAm || null,
      content_am: lessonContentAm || null,
      title_or: lessonTitleOr || null,
      description_or: lessonDescOr || null,
      content_or: lessonContentOr || null,
      video_url: lessonVideoUrl || null,
      duration_minutes: lessonDuration ? parseInt(lessonDuration) : null,
      sort_order: sortOrder,
    };

    let success = false;
    
    if (editingLesson) {
      success = await updateLesson(editingLesson.id, lessonData);
    } else {
      // Create new lesson
      const newLesson = await createLesson(courseId, lessonData);
      success = !!newLesson;
    }

    if (success) {
      await loadCourseData();
      onClose();
    }
    
    setLessonSaving(false);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    
    const success = await deleteLesson(lessonId);
    if (success) {
      await loadCourseData();
    }
  };
  
  const handleToggleLessonPublish = async (lesson: Lesson) => {
    const success = await updateLesson(lesson.id, {
      is_published: !lesson.is_published
    });
    
    if (success) {
      await loadCourseData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-zinc-900 border border-red-500/50 max-w-md">
          <CardBody className="text-center py-12">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Button color="default" onPress={() => router.push("/courses")}>
              Back to Courses
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.back()}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                {course?.title_en}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  size="sm"
                  className={course?.is_published ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"}
                >
                  {course?.is_published ? "Published" : "Draft"}
                </Chip>
                {course?.category && (
                  <span className="text-xs text-zinc-500">
                    {CATEGORIES.find(c => c.value === course.category)?.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              className="border-zinc-700 text-zinc-400"
              startContent={course?.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
              onPress={handleTogglePublish}
            >
              {course?.is_published ? "Unpublish" : "Publish"}
            </Button>
            <Button
              color="danger"
              variant="flat"
              isIconOnly
              onPress={handleDeleteCourse}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as any)}
          className="mb-6"
          classNames={{
            tabList: "bg-zinc-900 p-1 rounded-lg",
            cursor: "bg-emerald-500",
            tab: "h-11 px-6",
            tabContent: "group-data-[selected=true]:text-white font-medium",
          }}
        >
          <Tab key="details" title="Course Details" />
          <Tab key="lessons" title={`Lessons (${lessons.length})`} />
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "details" ? (
          <div className="space-y-6">
            {/* Course Details Form */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-emerald-500" size={20} />
                    <h2 className="text-lg font-bold text-nowrap">Basic Information</h2>
                  </div>
                  <Button
                    color="success"
                    size="sm"
                    isLoading={saving}
                    startContent={!saving && <Save size={20} />}
                    onPress={handleSaveCourse}
                    className="font-medium"
                  >
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title-en" className="block text-sm font-medium text-zinc-300 mb-2">
                    Course Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title-en"
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="desc-en" className="block text-sm font-medium text-zinc-300 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    id="desc-en"
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-zinc-300 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-zinc-300 mb-2">
                      Difficulty Level
                    </label>
                    <div className="relative">
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                      >
                        <option value="">Select difficulty</option>
                        {DIFFICULTIES.map((diff) => (
                          <option key={diff.value} value={diff.value}>
                            {diff.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-zinc-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    id="thumbnail"
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Translations Card */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Languages className="text-blue-500" size={20} />
                  <h2 className="text-lg font-bold">Translations</h2>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                <div className="flex gap-4">
                  <Button
                    size="sm"
                    variant={showAmharic ? "solid" : "bordered"}
                    color={showAmharic ? "primary" : "default"}
                    onPress={() => setShowAmharic(!showAmharic)}
                    className={showAmharic ? "bg-blue-600" : "border-zinc-700 text-zinc-400"}
                  >
                    {showAmharic ? "Hide Amharic" : "Add Amharic"}
                  </Button>
                  <Button
                    size="sm"
                    variant={showOromo ? "solid" : "bordered"}
                    color={showOromo ? "primary" : "default"}
                    onPress={() => setShowOromo(!showOromo)}
                    className={showOromo ? "bg-blue-600" : "border-zinc-700 text-zinc-400"}
                  >
                    {showOromo ? "Hide Oromo" : "Add Oromo"}
                  </Button>
                </div>

                {showAmharic && (
                  <div className="space-y-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Amharic</h3>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={titleAm}
                        onChange={(e) => setTitleAm(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                      <textarea
                        value={descAm}
                        onChange={(e) => setDescAm(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {showOromo && (
                  <div className="space-y-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Oromo</h3>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={titleOr}
                        onChange={(e) => setTitleOr(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                      <textarea
                        value={descOr}
                        onChange={(e) => setDescOr(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          /* Lessons Tab */
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-zinc-400">
                Manage your course lessons and content
              </p>
              <Button
                color="success"
                startContent={<Plus size={18} />}
                size="sm"
                className="font-medium"
                onPress={() => openLessonModal()}
              >
                Add Lesson
              </Button>
            </div>

            {lessons.length === 0 ? (
              <Card className="bg-zinc-900/50 border border-dashed border-zinc-800">
                <CardBody className="text-center py-16">
                  <PlayCircle className="mx-auto mb-4 text-zinc-600" size={48} />
                  <h3 className="text-lg font-medium text-white mb-2">No lessons yet</h3>
                  <p className="text-zinc-400 mb-6">
                    Start building your course by adding lessons
                  </p>
                  <Button
                    color="success"
                    startContent={<Plus size={18} />}
                    className="font-medium"
                     onPress={() => openLessonModal()}
                  >
                    Create First Lesson
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Reorder.Group axis="y" values={lessons} onReorder={reorderLessons} className="space-y-3">
                {lessons.map((lesson, index) => (
                  <SortableLessonItem 
                    key={lesson.id} 
                    lesson={lesson} 
                    index={index} 
                    handleToggleLessonPublish={handleToggleLessonPublish}
                    openLessonModal={openLessonModal}
                    handleDeleteLesson={handleDeleteLesson}
                  />
                ))}
              </Reorder.Group>
            )}
            
            {/* Lesson Modal */}
            <Modal 
              isOpen={isOpen} 
              onOpenChange={onOpenChange}
              scrollBehavior="inside"
              classNames={{
                base: "bg-zinc-900 border border-zinc-800 max-h-[90vh] w-full sm:max-w-[600px]",
                header: "border-b border-zinc-800",
                footer: "border-t border-zinc-800",
                closeButton: "hover:bg-zinc-800 active:bg-zinc-800 text-zinc-400",
                body: "p-6 overflow-y-auto",
              }}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-white">
                      {editingLesson ? "Edit Lesson" : "Add New Lesson"}
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Lesson Title <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={lessonTitleEn}
                          onChange={(e) => setLessonTitleEn(e.target.value)}
                          placeholder="e.g. Introduction to Safety"
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                        <textarea
                          value={lessonDescEn}
                          onChange={(e) => setLessonDescEn(e.target.value)}
                          placeholder="Brief summary of what this lesson covers..."
                          rows={2}
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        />
                      </div>

                      {/* Content/Body */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Lesson Content</label>
                        <textarea
                          value={lessonContentEn}
                          onChange={(e) => setLessonContentEn(e.target.value)}
                          placeholder="Main text content for this lesson..."
                          rows={5}
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Video URL */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Video URL (Optional)</label>
                          <input
                            type="url"
                            value={lessonVideoUrl}
                            onChange={(e) => setLessonVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/..."
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                        
                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Duration (minutes)</label>
                          <input
                            type="number"
                            value={lessonDuration}
                            onChange={(e) => setLessonDuration(e.target.value)}
                            placeholder="e.g. 15"
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Translations Section */}
                      <div className="pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-2 mb-4">
                          <Languages className="text-blue-500" size={18} />
                          <h3 className="text-md font-bold text-white">Translations</h3>
                        </div>
                        
                        <div className="flex gap-4 mb-4">
                          <Button
                            size="sm"
                            variant={showLessonAmharic ? "solid" : "bordered"}
                            color={showLessonAmharic ? "primary" : "default"}
                            onPress={() => setShowLessonAmharic(!showLessonAmharic)}
                            className={showLessonAmharic ? "bg-blue-600" : "border-zinc-700 text-zinc-400"}
                          >
                            {showLessonAmharic ? "Hide Amharic" : "Add Amharic"}
                          </Button>
                          <Button
                            size="sm"
                            variant={showLessonOromo ? "solid" : "bordered"}
                            color={showLessonOromo ? "primary" : "default"}
                            onPress={() => setShowLessonOromo(!showLessonOromo)}
                            className={showLessonOromo ? "bg-blue-600" : "border-zinc-700 text-zinc-400"}
                          >
                            {showLessonOromo ? "Hide Oromo" : "Add Oromo"}
                          </Button>
                        </div>

                        {showLessonAmharic && (
                          <div className="space-y-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/50 mb-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Amharic</h3>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                              <input
                                type="text"
                                value={lessonTitleAm}
                                onChange={(e) => setLessonTitleAm(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                              <textarea
                                value={lessonDescAm}
                                onChange={(e) => setLessonDescAm(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                              />
                            </div>
                             <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
                              <textarea
                                value={lessonContentAm}
                                onChange={(e) => setLessonContentAm(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {showLessonOromo && (
                          <div className="space-y-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Oromo</h3>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                              <input
                                type="text"
                                value={lessonTitleOr}
                                onChange={(e) => setLessonTitleOr(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                              <textarea
                                value={lessonDescOr}
                                onChange={(e) => setLessonDescOr(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
                              <textarea
                                value={lessonContentOr}
                                onChange={(e) => setLessonContentOr(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button 
                        color="success" 
                        onPress={handleSaveLesson}
                        isLoading={lessonSaving}
                      >
                        {editingLesson ? "Save Changes" : "Add Lesson"}
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}
