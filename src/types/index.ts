// =============================================
// QuestCareer Pilot — Domain Types
// =============================================

export type CurrentLevel = 'beginner' | 'has_base' | 'intermediate';
export type Confidence = 'provisional' | 'confirmed';
export type DemandLevel = 'low' | 'medium' | 'high' | 'very_high';
export type SkillLevel = 'basic' | 'intermediate' | 'advanced';
export type ContentType = 'youtube' | 'external_course' | 'external_article' | 'external_exercise';
export type ResourceType = 'course' | 'article' | 'video' | 'exercise' | 'documentation';
export type QuestResourceType = 'video' | 'article' | 'exercise' | 'project' | 'quiz';
export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type SkillStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'evidenced';
export type EvidenceType = 'link' | 'file' | 'github' | 'certificate' | 'quiz_score' | 'reflection';
export type CertificateType = 'digital_download' | 'digital_link' | 'email' | 'manual';
export type YouTubeType = 'video' | 'playlist';
export type FeedbackType = 'attribute_disagree' | 'quest_too_hard' | 'quest_too_easy' | 'bug' | 'general';

export interface NotificationPrefs {
  quest_reminder: boolean;
  weekly_digest: boolean;
  hour_preference: number;
}

export interface Profile {
  id: string;
  name: string | null;
  locale: string;
  school_class: string | null;
  daily_hours_available: number;
  months_to_goal: number;
  area_of_interest: string | null;
  current_level: CurrentLevel;
  is_admin: boolean;
  recovery_mode: boolean;
  crisis_mode: boolean;
  crisis_mode_until: string | null;
  last_seen: string | null;
  notification_prefs: NotificationPrefs;
  consent_flags: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Attributes {
  id: string;
  user_id: string;
  analytical: number;
  execution: number;
  communication: number;
  resilience: number;
  planning: number;
  learning_speed: number;
  confidence: Confidence;
  sessions_count: number;
  updated_at: string;
}

export interface AssessmentRun {
  id: string;
  user_id: string;
  game_id: string;
  seed: string | null;
  raw_metrics: Record<string, unknown>;
  computed_delta: Record<string, unknown>;
  is_suspicious: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string | null;
  base_url: string;
  signup_url: string;
  certificate_type: CertificateType | null;
  certificate_instructions: string | null;
  requires_cpf: boolean;
  requires_phone: boolean;
  is_free: boolean;
  avg_course_hours: number | null;
  active: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  demand_level: DemandLevel | null;
  icon: string | null;
  active: boolean;
}

export interface Skill {
  id: string;
  role_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  level: SkillLevel | null;
  prerequisites: string[];
  estimated_hours: number;
  related_attribute: string | null;
}

export interface ContentResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: ResourceType | null;
  duration_hours: number | null;
  skill_ids: string[];
  language: string;
  level: string | null;
  quality_score: number;
  platform_id: string | null;
  content_type: ContentType;
  youtube_id: string | null;
  youtube_type: YouTubeType | null;
  active: boolean;
}

export interface CareerPlan {
  id: string;
  user_id: string;
  role_id: string | null;
  phases: unknown[];
  total_weeks: number | null;
  adherence_percent: number | null;
  explanation: string | null;
  selected_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SkillProgress {
  id: string;
  user_id: string;
  skill_id: string;
  plan_id: string | null;
  status: SkillStatus;
  xp_earned: number;
  evidence_count: number;
  last_activity: string | null;
}

export interface Quest {
  id: string;
  skill_id: string;
  title: string;
  description: string | null;
  resource_url: string | null;
  resource_id: string | null;
  resource_type: QuestResourceType | null;
  estimated_minutes: number;
  xp_reward: number;
  difficulty: QuestDifficulty;
  is_review: boolean;
  active: boolean;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  scheduled_date: string;
  completed_at: string | null;
  skipped: boolean;
  skip_reason: string | null;
  xp_granted: number;
  time_spent_minutes: number | null;
  is_recovery: boolean;
  is_review: boolean;
  created_at: string;
}

export interface Evidence {
  id: string;
  user_id: string;
  skill_id: string;
  type: EvidenceType | null;
  url: string | null;
  file_path: string | null;
  quiz_score: number | null;
  certificate_name: string | null;
  platform_id: string | null;
  completion_date: string | null;
  reflection: string | null;
  xp_bonus: number;
  verified: boolean;
  created_at: string;
}

export interface VideoNote {
  id: string;
  user_id: string;
  quest_id: string;
  youtube_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface StudentFeedback {
  id: string;
  user_id: string | null;
  type: FeedbackType | null;
  content: string;
  context: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  session_id: string | null;
  event_name: string;
  properties: Record<string, unknown>;
  created_at: string;
}
