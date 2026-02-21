export const RecoveryModeTemplate = (name: string) => `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>💪 Modo Recuperação Ativado</h2>
  <p>Olá, ${name}!</p>
  <p>Notamos que você ficou um tempo fora. Sem problemas! Ativamos o <strong>modo recuperação</strong> com quests mais curtas para você voltar ao ritmo.</p>
  <p>Cada pequeno passo conta. Vamos juntos! 🚀</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;">Voltar ao QuestCareer</a>
</div>
`;
