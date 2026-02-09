"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Loader2, 
  BookOpen,
  Languages,
  ChevronDown
} from "lucide-react";
import { createCourse, type CreateCourseData } from "@/lib/course-helpers";

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

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [titleEn, setTitleEn] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  
  // Multilingual toggles
  const [showAmharic, setShowAmharic] = useState(false);
  const [showOromo, setShowOromo] = useState(false);
  const [titleAm, setTitleAm] = useState("");
  const [titleOr, setTitleOr] = useState("");
  const [descAm, setDescAm] = useState("");
  const [descOr, setDescOr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!titleEn.trim()) {
      setError("English title is required.");
      setLoading(false);
      return;
    }

    const courseData: CreateCourseData = {
      title_en: titleEn,
      title_am: titleAm || null,
      title_or: titleOr || null,
      description_en: descEn || null,
      description_am: descAm || null,
      description_or: descOr || null,
      thumbnail_url: thumbnailUrl || null,
      category: category as any || null,
      difficulty_level: difficulty as any || null,
    };

    try {
      const course = await createCourse(courseData);
      
      if (course) {
        // Redirect to course editor/details
        router.push(`/courses/${course.id}`);
      } else {
        setError("Failed to create course. Please try again.");
      }
    } catch (err) {
      console.error("Error creating course:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
              Create New Course
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Start building a new educational resource.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Core Info Card */}
            <Card className="bg-zinc-900 border border-zinc-800 shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-emerald-500" size={20} />
                  <h2 className="text-lg font-bold">Basic Information</h2>
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
                    placeholder="e.g. Digital Safety Basics"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required
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
                    placeholder="Briefly describe what this course covers..."
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  />
                </div>

                {/* Category & Difficulty Row */}
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
                        <option value="" className="bg-zinc-900">Select a category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value} className="bg-zinc-900">
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
                        <option value="" className="bg-zinc-900">Select difficulty</option>
                        {DIFFICULTIES.map((diff) => (
                          <option key={diff.value} value={diff.value} className="bg-zinc-900">
                            {diff.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-zinc-300 mb-2">
                    Thumbnail URL (Optional)
                  </label>
                  <input
                    id="thumbnail"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Paste a link to an image. You can upload images separately later.
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Multilingual Support Card */}
            <Card className="bg-zinc-900 border border-zinc-800 shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Languages className="text-blue-500" size={20} />
                  <h2 className="text-lg font-bold">Translations (Optional)</h2>
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
                  <div className="space-y-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/50 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Amharic Translation</h3>
                    <div>
                      <label htmlFor="title-am" className="block text-sm font-medium text-zinc-300 mb-2">
                        Title (Amharic)
                      </label>
                      <input
                        id="title-am"
                        type="text"
                        placeholder="አርዕስት"
                        value={titleAm}
                        onChange={(e) => setTitleAm(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="desc-am" className="block text-sm font-medium text-zinc-300 mb-2">
                        Description (Amharic)
                      </label>
                      <textarea
                        id="desc-am"
                        placeholder="መግለጫ..."
                        value={descAm}
                        onChange={(e) => setDescAm(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {showOromo && (
                  <div className="space-y-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/50 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Oromo Translation</h3>
                    <div>
                      <label htmlFor="title-or" className="block text-sm font-medium text-zinc-300 mb-2">
                        Title (Oromo)
                      </label>
                      <input
                        id="title-or"
                        type="text"
                        placeholder="Mataduree"
                        value={titleOr}
                        onChange={(e) => setTitleOr(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="desc-or" className="block text-sm font-medium text-zinc-300 mb-2">
                        Description (Oromo)
                      </label>
                      <textarea
                        id="desc-or"
                        placeholder="Ibsa..."
                        value={descOr}
                        onChange={(e) => setDescOr(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="flat"
                color="default"
                onPress={() => router.back()}
                className="text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                color="success"
                type="submit"
                isLoading={loading}
                className="flex items-center gap-2 font-bold px-8 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                startContent={!loading && <Save size={18} />}
              >
                Create Course
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
