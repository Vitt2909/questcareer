export const WeeklyDigestTemplate = (
    name: string,
    stats: { questsCompleted: number; xpEarned: number; streak: number }
) => `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>📊 Resumo Semanal</h2>
  <p>Olá, ${name}! Aqui está seu progresso da semana:</p>
  <ul>
    <li>✅ Quests completadas: <strong>${stats.questsCompleted}</strong></li>
    <li>⭐ XP ganho: <strong>${stats.xpEarned}</strong></li>
    <li>🔥 Streak: <strong>${stats.streak} dias</strong></li>
  </ul>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;">Ver Dashboard</a>
</div>
`;
