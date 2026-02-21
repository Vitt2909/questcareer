// Career Plan Generator
// Generates a personalized career plan based on user attributes and role data

import { getRedis } from '@/lib/redis';
import { ROLE_DATA, type SeedPhase } from '@/lib/seed/career-data';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CareerPlanPhase {
    name: string;
    weeks: number;
    skills: { id: string; name: string; estimated_hours: number }[];
    resources: { id: string; title: string; provider: string; content_type: string; url: string }[];
    checkpoint?: string;
    evidence?: string;
}

export interface CareerPlan {
    roleId: string;
    roleName: string;
    roleIcon: string;
    phases: CareerPlanPhase[];
    totalWeeks: number;
    adherencePercent: number;
    explanation: string;
}

const CACHE_TTL = 86400; // 24h

export async function generateCareerPlan(
    supabase: SupabaseClient,
    userId: string,
    roleId: string
): Promise<CareerPlan> {
    // Check Redis cache
    const redis = getRedis();
    const cacheKey = `plan:${userId}:${roleId}`;

    if (redis) {
        try {
            const cached = await redis.get<CareerPlan>(cacheKey);
            if (cached) return cached;
        } catch {
            // Redis unavailable — continue without cache
        }
    }

    // 1. Fetch profile + attributes
    const { data: profile } = await supabase
        .from('profiles')
        .select('daily_hours_available, months_to_goal, current_level')
        .eq('id', userId)
        .single();

    const dailyHours = (profile?.daily_hours_available as number) ?? 1;

    const { data: attrs } = await supabase
        .from('attributes')
        .select('*')
        .eq('user_id', userId)
        .single();

    // 2. Fetch role
    const { data: role } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

    if (!role) throw new Error(`Role not found: ${roleId}`);

    // 3. Get role data from seed (phases, skills, resources)
    const roleData = ROLE_DATA[roleId];
    if (!roleData) throw new Error(`No seed data for role: ${roleId}`);

    // 4. Calculate adherence_percent
    let skillsWithBonus = 0;
    for (const skill of roleData.skills) {
        if (attrs && skill.related_attribute) {
            const attrVal = (attrs[skill.related_attribute] as number) ?? 0;
            if (attrVal > 65) skillsWithBonus++;
        }
    }
    const adherencePercent = Math.min(100, Math.max(0,
        Number(((skillsWithBonus / roleData.skills.length) * 100).toFixed(1))
    ));

    // 5. Calculate total_weeks
    const totalHours = roleData.skills.reduce((sum, s) => sum + s.estimated_hours, 0);
    const days = totalHours / dailyHours;
    const totalWeeks = Math.ceil(days / (7 * 0.7)); // 0.7 realism factor

    // 6. Build phases
    const phases: CareerPlanPhase[] = roleData.phases.map((phase: SeedPhase) => {
        const phaseSkills = roleData.skills.filter((s) => phase.skills.includes(s.id));
        const phaseResources = roleData.resources.filter((r) =>
            r.skill_ids.some((sid) => phase.skills.includes(sid))
        );

        return {
            name: phase.name,
            weeks: phase.weeks,
            skills: phaseSkills.map((s) => ({
                id: s.id,
                name: s.name,
                estimated_hours: s.estimated_hours,
            })),
            resources: phaseResources.map((r) => ({
                id: r.id,
                title: r.title,
                provider: r.provider,
                content_type: r.content_type,
                url: r.url,
            })),
            checkpoint: phase.checkpoint,
            evidence: phase.evidence,
        };
    });

    // 7. Build explanation
    const months = Math.round(totalWeeks / 4.3);
    const explanation = `${adherencePercent}% das skills deste caminho combinam com seu perfil. Estimamos ${months} meses no seu ritmo de ${dailyHours}h/dia.`;

    const plan: CareerPlan = {
        roleId,
        roleName: role.name as string,
        roleIcon: (role.icon as string) ?? '📦',
        phases,
        totalWeeks,
        adherencePercent,
        explanation,
    };

    // Cache result
    if (redis) {
        try {
            await redis.set(cacheKey, plan, { ex: CACHE_TTL });
        } catch {
            // Redis write failed — non-critical
        }
    }

    return plan;
}
