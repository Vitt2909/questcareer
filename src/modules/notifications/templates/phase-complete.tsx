export const PhaseCompleteTemplate = (name: string, phaseName: string, nextPhase: string) => `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>🎉 Fase Concluída!</h2>
  <p>Parabéns, ${name}!</p>
  <p>Você completou a fase <strong>${phaseName}</strong>! Agora é hora de avançar para <strong>${nextPhase}</strong>.</p>
  <p>Continue assim! 🏆</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/career/plans" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;">Ver Próxima Fase</a>
</div>
`;
