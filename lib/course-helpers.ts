/**
 * Supabase Database & Storage Helper Functions
 * Replaces lib/appwrite.ts functionality
 */

import { supabase } from './supabase';
import type { Database } from './supabase';

type EvidenceRow = Database['public']['Tables']['evidence_metadata']['Row'];
type EvidenceInsert = Database['public']['Tables']['evidence_metadata']['Insert'];

// ============================================================================
// TYPE DEFINITIONS FOR COURSES
// ============================================================================

export type UserRole = 'user' | 'influencer' | 'admin';

export interface UserProfile {
  id: string;
  user_role: UserRole;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  influencer_id: string;
  title_en: string;
  title_am: string | null;
  title_or: string | null;
  description_en: string | null;
  description_am: string | null;
  description_or: string | null;
  thumbnail_url: string | null;
  category: 'safety' | 'legal' | 'mental_health' | 'financial' | 'other' | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title_en: string;
  title_am: string | null;
  title_or: string | null;
  description_en: string | null;
  description_am: string | null;
  description_or: string | null;
  content_en: string | null;
  content_am: string | null;
  content_or: string | null;
  video_url: string | null;
  sort_order: number;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateCourseData = Pick<Course, 
  'title_en' | 'title_am' | 'title_or' | 
  'description_en' | 'description_am' | 'description_or' | 
  'thumbnail_url' | 'category' | 'difficulty_level'
>;

export type CreateLessonData = Pick<Lesson,
  'title_en' | 'title_am' | 'title_or' |
  'description_en' | 'description_am' | 'description_or' |
  'content_en' | 'content_am' | 'content_or' |
  'video_url' | 'sort_order' | 'duration_minutes'
>;

// ============================================================================
// USER PROFILE FUNCTIONS
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';

export async function getUserProfile(userId?: string, supabaseClient?: SupabaseClient): Promise<UserProfile | null> {
  const client = supabaseClient || supabase;
  const uid = userId || (await client.auth.getSession()).data.session?.user?.id;
  
  if (!uid) {
    console.error('[getUserProfile] No user ID provided');
    return null;
  }

  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) {
    console.error('[getUserProfile] Error:', error);
    return null;
  }

  return data;
}

export async function createUserProfile(
  userId: string,
  role: UserRole = 'user',
  displayName?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      user_role: role,
      display_name: displayName || null,
    });

  if (error) {
    console.error('[createUserProfile] Error:', error);
    return false;
  }

  return true;
}

export async function updateUserProfile(
  data: Partial<Pick<UserProfile, 'display_name' | 'bio' | 'avatar_url'>>
): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('[updateUserProfile] No valid session');
    return false;
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(data)
    .eq('id', session.user.id);

  if (error) {
    console.error('[updateUserProfile] Error:', error);
    return false;
  }

  return true;
}

// ============================================================================
// COURSE FUNCTIONS
// ============================================================================

export async function getCourses(filters?: {
  category?: string;
  influencerId?: string;
  publishedOnly?: boolean;
}): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.influencerId) {
    query = query.eq('influencer_id', filters.influencerId);
  }

  if (filters?.publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getCourses] Error:', error);
    return [];
  }

  return data || [];
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('[getCourseById] Error:', error);
    return null;
  }

  return data;
}

export async function createCourse(courseData: CreateCourseData): Promise<Course | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('[createCourse] No valid session');
    return null;
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      influencer_id: session.user.id,
      ...courseData,
    })
    .select()
    .single();

  if (error) {
    console.error('[createCourse] Error:', error);
    return null;
  }

  return data;
}

export async function updateCourse(
  courseId: string,
  updates: Partial<Course>
): Promise<boolean> {
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId);

  if (error) {
    console.error('[updateCourse] Error:', error);
    return false;
  }

  return true;
}

export async function deleteCourse(courseId: string): Promise<boolean> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    console.error('[deleteCourse] Error:', error);
    return false;
  }

  return true;
}

// ============================================================================
// LESSON FUNCTIONS
// ============================================================================

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[getLessonsByCourse] Error:', error);
    return [];
  }

  return data || [];
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error('[getLessonById] Error:', error);
    return null;
  }

  return data;
}

export async function createLesson(
  courseId: string,
  lessonData: CreateLessonData
): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      ...lessonData,
    })
    .select()
    .single();

  if (error) {
    console.error('[createLesson] Error:', error);
    return null;
  }

  return data;
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<Lesson>
): Promise<boolean> {
  const { error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId);

  if (error) {
    console.error('[updateLesson] Error:', error);
    return false;
  }

  return true;
}

export async function deleteLesson(lessonId: string): Promise<boolean> {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    console.error('[deleteLesson] Error:', error);
    return false;
  }

  return true;
}

// ============================================================================
// PROGRESS TRACKING FUNCTIONS
// ============================================================================

export async function markLessonComplete(lessonId: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('[markLessonComplete] No valid session');
    return false;
  }

  const { error } = await supabase
    .from('user_course_progress')
    .upsert({
      user_id: session.user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,lesson_id'
    });

  if (error) {
    console.error('[markLessonComplete] Error:', error);
    return false;
  }

  return true;
}

export async function getUserProgress(courseId: string): Promise<Map<string, UserCourseProgress>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('[getUserProgress] No valid session');
    return new Map();
  }

  // Get all lessons for the course
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId);

  if (lessonsError || !lessons) {
    console.error('[getUserProgress] Error fetching lessons:', lessonsError);
    return new Map();
  }

  const lessonIds = lessons.map(l => l.id);

  // Get progress for these lessons
  const { data, error } = await supabase
    .from('user_course_progress')
    .select('*')
    .eq('user_id', session.user.id)
    .in('lesson_id', lessonIds);

  if (error) {
    console.error('[getUserProgress] Error:', error);
    return new Map();
  }

  // Create a map for quick lookup
  const progressMap = new Map<string, UserCourseProgress>();
  data?.forEach(progress => {
    progressMap.set(progress.lesson_id, progress);
  });

  return progressMap;
}

export async function getCourseProgress(courseId: string): Promise<{
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return { totalLessons: 0, completedLessons: 0, percentage: 0 };
  }

  // Get total lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId);

  const totalLessons = lessons?.length || 0;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0, percentage: 0 };
  }

  if (!lessons || lessons.length === 0) {
    return { totalLessons: 0, completedLessons: 0, percentage: 0 };
  }
  const lessonIds = lessons.map(l => l.id);

  // Get completed lessons
  const { data: progress } = await supabase
    .from('user_course_progress')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('completed', true)
    .in('lesson_id', lessonIds);

  const completedLessons = progress?.length || 0;
  const percentage = Math.round((completedLessons / totalLessons) * 100);

  return { totalLessons, completedLessons, percentage };
}
