-- Migration: Influencer Role & Course System
-- Description: Add user profiles with roles, courses, lessons, and progress tracking
-- Date: 2026-02-07

-- ============================================================
-- USER PROFILES WITH ROLE MANAGEMENT
-- ============================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'influencer', 'admin')),
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (but not their role)
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (SELECT user_role FROM user_profiles WHERE id = auth.uid()) = user_role
  );

-- ============================================================
-- COURSES
-- ============================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Multilingual fields (English required, Amharic and Oromo optional)
  title_en TEXT NOT NULL,
  title_am TEXT,
  title_or TEXT,
  description_en TEXT,
  description_am TEXT,
  description_or TEXT,
  
  -- Course metadata
  thumbnail_url TEXT,
  category TEXT CHECK (category IN ('safety', 'legal', 'mental_health', 'financial', 'other')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_courses_influencer ON courses(influencer_id);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_courses_category ON courses(category);

-- RLS Policies for courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true OR influencer_id = auth.uid());

-- Only influencers can create courses
CREATE POLICY "Influencers can create courses"
  ON courses FOR INSERT
  WITH CHECK (
    auth.uid() = influencer_id AND
    (SELECT user_role FROM user_profiles WHERE id = auth.uid()) = 'influencer'
  );

-- Only course owner can update their courses
CREATE POLICY "Course owners can update their courses"
  ON courses FOR UPDATE
  USING (influencer_id = auth.uid())
  WITH CHECK (influencer_id = auth.uid());

-- Only course owner can delete their courses
CREATE POLICY "Course owners can delete their courses"
  ON courses FOR DELETE
  USING (influencer_id = auth.uid());

-- ============================================================
-- LESSONS
-- ============================================================

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  
  -- Multilingual fields (English required, Amharic and Oromo optional)
  title_en TEXT NOT NULL,
  title_am TEXT,
  title_or TEXT,
  description_en TEXT,
  description_am TEXT,
  description_or TEXT,
  content_en TEXT, -- Rich text/markdown content
  content_am TEXT,
  content_or TEXT,
  
  -- Lesson metadata
  video_url TEXT,
  sort_order INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_sort_order ON lessons(course_id, sort_order);

-- RLS Policies for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can view lessons of published courses
CREATE POLICY "Anyone can view lessons of published courses"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND (courses.is_published = true OR courses.influencer_id = auth.uid())
    )
  );

-- Only course owner can insert lessons
CREATE POLICY "Course owners can add lessons"
  ON lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.influencer_id = auth.uid()
    )
  );

-- Only course owner can update lessons
CREATE POLICY "Course owners can update lessons"
  ON lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.influencer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.influencer_id = auth.uid()
    )
  );

-- Only course owner can delete lessons
CREATE POLICY "Course owners can delete lessons"
  ON lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.influencer_id = auth.uid()
    )
  );

-- ============================================================
-- USER COURSE PROGRESS
-- ============================================================

CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique progress per user per lesson
  UNIQUE(user_id, lesson_id)
);

-- Create index for faster queries
CREATE INDEX idx_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_progress_lesson ON user_course_progress(lesson_id);

-- RLS Policies for user_course_progress
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Users can only view their own progress
CREATE POLICY "Users can view their own progress"
  ON user_course_progress FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert their own progress
CREATE POLICY "Users can create their own progress"
  ON user_course_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own progress
CREATE POLICY "Users can update their own progress"
  ON user_course_progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
  BEFORE UPDATE ON user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
