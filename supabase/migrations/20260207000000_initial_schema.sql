-- Shield-ET Initial Schema Migration
-- This creates all tables, indexes, and RLS policies

-- =====================================================
-- 1. SUPPORT DIRECTORY (Public Resources)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.support_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('shelter', 'legal', 'medical', 'counseling', 'hotline')),
  phone VARCHAR(20) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  description_am VARCHAR(1000) NOT NULL,
  description_en VARCHAR(1000) NOT NULL,
  description_or VARCHAR(1000) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_category ON public.support_directory(category);
CREATE INDEX IF NOT EXISTS idx_support_location ON public.support_directory(location);

ALTER TABLE public.support_directory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON public.support_directory;
CREATE POLICY "Public read access" ON public.support_directory FOR SELECT USING (true);

-- =====================================================
-- 2. EVIDENCE METADATA (User-scoped)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.evidence_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL,
  incident_type VARCHAR(20) NOT NULL CHECK (incident_type IN ('physical', 'emotional', 'financial', 'sexual', 'other')),
  description VARCHAR(2000) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  threat_level INTEGER CHECK (threat_level BETWEEN 1 AND 10),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_user ON public.evidence_metadata(user_id);

ALTER TABLE public.evidence_metadata ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own evidence" ON public.evidence_metadata;
CREATE POLICY "Users manage own evidence" ON public.evidence_metadata
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. SAFETY PLANS (One per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_pin VARCHAR(128) NOT NULL,
  code_word VARCHAR(100),
  trusted_contact VARCHAR(20),
  active_template_id UUID,
  safe_room_desc VARCHAR(500),
  is_plan_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_safety_plans_user ON public.safety_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_template ON public.safety_plans(active_template_id);

ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own safety plan" ON public.safety_plans;
CREATE POLICY "Users manage own safety plan" ON public.safety_plans
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. EMERGENCY BAG (User items)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.emergency_bag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  is_packed BOOLEAN NOT NULL DEFAULT false,
  is_essential BOOLEAN NOT NULL DEFAULT false,
  category VARCHAR(20) DEFAULT 'personal' CHECK (category IN ('docs', 'cash', 'personal', 'kids', 'medical', 'other')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_bag_user ON public.emergency_bag(user_id, is_packed);

ALTER TABLE public.emergency_bag ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own emergency bag" ON public.emergency_bag;
CREATE POLICY "Users manage own emergency bag" ON public.emergency_bag
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. SAFETY STEPS (User roadmap tasks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.safety_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_step_id UUID NOT NULL,
  label_en VARCHAR(256) NOT NULL,
  label_am VARCHAR(255),
  label_or VARCHAR(255),
  status VARCHAR(10) DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  priority INTEGER DEFAULT 0,
  module VARCHAR(20) DEFAULT 'exit' CHECK (module IN ('exit', 'digital', 'legal', 'kids')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_steps_user ON public.safety_steps(user_id, priority);

ALTER TABLE public.safety_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own safety steps" ON public.safety_steps;
CREATE POLICY "Users manage own safety steps" ON public.safety_steps
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. SECURITY AUDIT (User security tasks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name_en VARCHAR(255) NOT NULL,
  task_name_am VARCHAR(255),
  task_name_or VARCHAR(255),
  is_completed BOOLEAN DEFAULT false,
  risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  platform VARCHAR(20) DEFAULT 'phone' CHECK (platform IN ('phone', 'social', 'banking', 'email')),
  instructions VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_priority ON public.security_audit(user_id, risk_level DESC, is_completed DESC);

ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own security audit" ON public.security_audit;
CREATE POLICY "Users manage own security audit" ON public.security_audit
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. PREDEFINED PLANS (Public Templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.predefined_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en VARCHAR(100) NOT NULL,
  title_am VARCHAR(100),
  title_or VARCHAR(100),
  category VARCHAR(20) DEFAULT 'urgent' CHECK (category IN ('urgent', 'stealth', 'stay', 'kids')),
  difficulty VARCHAR(20) DEFAULT 'moderate' CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  duration VARCHAR(50),
  description_en VARCHAR(500),
  icon VARCHAR(50) DEFAULT 'shield',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predefined_plans_category ON public.predefined_plans(category);

ALTER TABLE public.predefined_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read predefined plans" ON public.predefined_plans;
CREATE POLICY "Public read predefined plans" ON public.predefined_plans FOR SELECT USING (true);

-- =====================================================
-- 8. PREDEFINED STEPS (Template Steps)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.predefined_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.predefined_plans(id) ON DELETE CASCADE,
  label_en VARCHAR(256) NOT NULL,
  label_am VARCHAR(255),
  label_or VARCHAR(255),
  priority INTEGER DEFAULT 0,
  module VARCHAR(20) DEFAULT 'exit' CHECK (module IN ('exit', 'digital', 'legal', 'kids')),
  is_essential BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predefined_steps_plan ON public.predefined_steps(plan_id, priority);

ALTER TABLE public.predefined_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read predefined steps" ON public.predefined_steps;
CREATE POLICY "Public read predefined steps" ON public.predefined_steps FOR SELECT USING (true);

-- =====================================================
-- 9. MASTER SECURITY TASKS (Security Templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.master_security_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name_en VARCHAR(255) NOT NULL,
  task_name_am VARCHAR(255),
  task_name_or VARCHAR(255),
  platform VARCHAR(20) DEFAULT 'phone' CHECK (platform IN ('phone', 'social', 'banking', 'email')),
  risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  instr_en VARCHAR(500),
  instr_am VARCHAR(500),
  instr_or VARCHAR(500),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_security_priority ON public.master_security_tasks(priority);

ALTER TABLE public.master_security_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read master tasks" ON public.master_security_tasks;
CREATE POLICY "Public read master tasks" ON public.master_security_tasks FOR SELECT USING (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
