export const QuestReminderTemplate = (name: string, questTitle: string) => `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>🎯 Lembrete de Quest</h2>
  <p>Olá, ${name}!</p>
  <p>Sua quest <strong>${questTitle}</strong> está te esperando hoje.</p>
  <p>Não deixe para amanhã! Cada quest completada te aproxima do seu objetivo.</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;">Começar Quest</a>
</div>
`;
