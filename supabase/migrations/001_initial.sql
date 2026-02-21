-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  locale TEXT DEFAULT 'pt-BR',
  school_class TEXT,
  daily_hours_available NUMERIC(3,1) DEFAULT 1.0,
  months_to_goal INTEGER DEFAULT 12,
  area_of_interest TEXT,
  current_level TEXT DEFAULT 'beginner'
    CHECK (current_level IN ('beginner','has_base','intermediate')),
  is_admin BOOLEAN DEFAULT FALSE,
  recovery_mode BOOLEAN DEFAULT FALSE,
  crisis_mode BOOLEAN DEFAULT FALSE,
  crisis_mode_until TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  notification_prefs JSONB DEFAULT
    '{"quest_reminder":true,"weekly_digest":true,"hour_preference":20}',
  consent_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTRIBUTES
CREATE TABLE attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  analytical NUMERIC(5,2) DEFAULT 0,
  execution NUMERIC(5,2) DEFAULT 0,
  communication NUMERIC(5,2) DEFAULT 0,
  resilience NUMERIC(5,2) DEFAULT 0,
  planning NUMERIC(5,2) DEFAULT 0,
  learning_speed NUMERIC(5,2) DEFAULT 0,
  confidence TEXT DEFAULT 'provisional'
    CHECK (confidence IN ('provisional','confirmed')),
  sessions_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ASSESSMENT RUNS
CREATE TABLE assessment_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  seed TEXT,
  raw_metrics JSONB DEFAULT '{}',
  computed_delta JSONB DEFAULT '{}',
  is_suspicious BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLATFORMS (plataformas de certificado externas)
CREATE TABLE platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  base_url TEXT NOT NULL,
  signup_url TEXT NOT NULL,
  certificate_type TEXT CHECK (
    certificate_type IN ('digital_download','digital_link','email','manual')
  ),
  certificate_instructions TEXT,
  requires_cpf BOOLEAN DEFAULT FALSE,
  requires_phone BOOLEAN DEFAULT FALSE,
  is_free BOOLEAN DEFAULT TRUE,
  avg_course_hours NUMERIC(5,1),
  active BOOLEAN DEFAULT TRUE
);

-- ROLES
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  demand_level TEXT CHECK (demand_level IN ('low','medium','high','very_high')),
  icon TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- SKILLS
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  role_id TEXT REFERENCES roles(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('basic','intermediate','advanced')),
  prerequisites TEXT[] DEFAULT '{}',
  estimated_hours INTEGER DEFAULT 10,
  related_attribute TEXT
);

-- CONTENT RESOURCES
CREATE TABLE content_resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('course','article','video','exercise','documentation')),
  duration_hours NUMERIC(5,1),
  skill_ids TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'pt-BR',
  level TEXT,
  quality_score INTEGER DEFAULT 70,
  platform_id TEXT REFERENCES platforms(id),
  content_type TEXT DEFAULT 'external_article'
    CHECK (content_type IN ('youtube','external_course','external_article','external_exercise')),
  youtube_id TEXT,
  youtube_type TEXT CHECK (youtube_type IN ('video','playlist')),
  active BOOLEAN DEFAULT TRUE
);

-- CAREER PLANS
CREATE TABLE career_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES roles(id),
  phases JSONB DEFAULT '[]',
  total_weeks INTEGER,
  adherence_percent NUMERIC(5,2),
  explanation TEXT,
  selected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILL PROGRESS
CREATE TABLE skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  plan_id UUID REFERENCES career_plans(id),
  status TEXT DEFAULT 'locked'
    CHECK (status IN ('locked','available','in_progress','completed','evidenced')),
  xp_earned INTEGER DEFAULT 0,
  evidence_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  UNIQUE(user_id, skill_id)
);

-- QUESTS
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT,
  resource_id TEXT REFERENCES content_resources(id),
  resource_type TEXT CHECK (resource_type IN ('video','article','exercise','project','quiz')),
  estimated_minutes INTEGER DEFAULT 25,
  xp_reward INTEGER DEFAULT 30,
  difficulty TEXT DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner','intermediate','advanced')),
  is_review BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);

-- USER QUESTS
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL REFERENCES quests(id),
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  xp_granted INTEGER DEFAULT 0,
  time_spent_minutes INTEGER,
  is_recovery BOOLEAN DEFAULT FALSE,
  is_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVIDENCES
CREATE TABLE evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  type TEXT CHECK (type IN ('link','file','github','certificate','quiz_score','reflection')),
  url TEXT,
  file_path TEXT,
  quiz_score NUMERIC(5,2),
  certificate_name TEXT,
  platform_id TEXT REFERENCES platforms(id),
  completion_date DATE,
  reflection TEXT,
  xp_bonus INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIDEO NOTES (rascunhos salvos enquanto assiste)
CREATE TABLE video_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  youtube_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- STUDENT FEEDBACK
CREATE TABLE student_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN
    ('attribute_disagree','quest_too_hard','quest_too_easy','bug','general')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_user_quests_user_date ON user_quests(user_id, scheduled_date);
CREATE INDEX idx_skill_progress_user_skill ON skill_progress(user_id, skill_id);
CREATE INDEX idx_events_user_created ON events(user_id, created_at);
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_profiles_class ON profiles(school_class);
CREATE INDEX idx_content_platform ON content_resources(platform_id);
CREATE INDEX idx_evidences_platform ON evidences(platform_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Policies: aluno acessa apenas seus dados
CREATE POLICY "own_profile" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "own_attributes" ON attributes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_runs" ON assessment_runs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_plans" ON career_plans FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_progress" ON skill_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_quests" ON user_quests FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_evidences" ON evidences FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_notes" ON video_notes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_feedback" ON student_feedback FOR ALL USING (user_id = auth.uid());
CREATE POLICY "insert_events" ON events FOR INSERT WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);

-- Admin vê tudo
CREATE POLICY "admin_profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));
CREATE POLICY "admin_progress" ON skill_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));
CREATE POLICY "admin_quests" ON user_quests FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));
CREATE POLICY "admin_feedback" ON student_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));
CREATE POLICY "admin_events" ON events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- Tabelas públicas (leitura autenticada)
CREATE POLICY "public_roles" ON roles FOR SELECT USING (true);
CREATE POLICY "public_skills" ON skills FOR SELECT USING (true);
CREATE POLICY "public_quests" ON quests FOR SELECT USING (true);
CREATE POLICY "public_content" ON content_resources FOR SELECT USING (true);
CREATE POLICY "public_platforms" ON platforms FOR SELECT USING (true);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER attributes_updated_at
  BEFORE UPDATE ON attributes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER video_notes_updated_at
  BEFORE UPDATE ON video_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-criar profile e attributes ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO attributes (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
