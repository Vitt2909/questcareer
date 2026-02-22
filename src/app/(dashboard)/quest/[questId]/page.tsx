import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { YouTubePlayer } from '@/components/ui/YouTubePlayer';
import { ExternalCoursePage } from '@/components/ui/ExternalCoursePage';

export default async function QuestPage({
    params,
}: {
    params: Promise<{ questId: string }>;
}) {
    const { questId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch user_quest → quest → resource → platform
    const { data: userQuest } = await supabase
        .from('user_quests')
        .select('*, quests(*, content_resources(*, platforms(*)))')
        .eq('id', questId)
        .eq('user_id', user.id)
        .single();

    if (!userQuest) redirect('/');

    const quest = userQuest.quests as Record<string, unknown> | null;
    if (!quest) redirect('/');

    const resource = quest.content_resources as Record<string, unknown> | null;
    const contentType = resource?.content_type as string | null;
    const platform = resource?.platforms as Record<string, unknown> | null;

    // YouTube content
    if (contentType === 'youtube' && resource) {
        const youtubeId = resource.youtube_id as string;
        const isPlaylist = (resource.youtube_type as string) === 'playlist';

        return (
            <div className="max-w-6xl mx-auto">
                <YouTubePlayer
                    questId={questId}
                    videoId={youtubeId}
                    isPlaylist={isPlaylist}
                    title={quest.title as string}
                    xpReward={(quest.xp_reward as number) ?? 30}
                    estimatedMinutes={(quest.estimated_minutes as number) ?? 25}
                    skillId={quest.skill_id as string}
                />
            </div>
        );
    }

    // External course with platform
    if (contentType === 'external_course' && resource && platform) {
        return (
            <ExternalCoursePage
                questId={questId}
                courseTitle={resource.title as string}
                courseUrl={resource.url as string}
                platform={{
                    id: platform.id as string,
                    name: platform.name as string,
                    logo_url: (platform.logo_url as string) || null,
                    signup_url: platform.signup_url as string,
                    certificate_type: (platform.certificate_type as string) || null,
                    certificate_instructions: (platform.certificate_instructions as string) || null,
                    requires_cpf: (platform.requires_cpf as boolean) || false,
                }}
                skillId={quest.skill_id as string}
                xpReward={(quest.xp_reward as number) ?? 30}
                estimatedMinutes={(quest.estimated_minutes as number) ?? 25}
                durationHours={(resource.duration_hours as number) ?? undefined}
            />
        );
    }

    // All other content types — redirect to resource URL
    const url = (resource?.url as string) || (quest.resource_url as string);
    if (url) {
        redirect(url);
    }

    redirect('/');
}
