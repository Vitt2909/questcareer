import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components';
import * as React from 'react';

interface SkillProgress {
  name: string;
  level: string;
}

interface NextQuest {
  title: string;
  estimatedMinutes: number;
  xpReward: number;
}

interface WeeklyDigestProps {
  name: string;
  roleName: string;
  xpSemana: number;
  questsCompletadas: number;
  streakDias: number;
  skillsAvancadas: SkillProgress[];
  proximaQuest: NextQuest | null;
  appUrl: string;
}

export const WeeklyDigestEmail = ({
  name = 'Aluno',
  roleName = 'Desenvolvedor Front-end',
  xpSemana = 150,
  questsCompletadas = 5,
  streakDias = 3,
  skillsAvancadas = [],
  proximaQuest = null,
  appUrl = 'http://localhost:3000',
}: WeeklyDigestProps) => (
  <Html>
    <Head />
    <Preview>Sua semana em {roleName}: confira o que você conquistou</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>📊 Resumo semanal</Text>

        <Text style={paragraph}>Oi {name},</Text>
        <Text style={paragraph}>
          Veja o que você conquistou esta semana como <strong>{roleName}</strong>:
        </Text>

        {/* Stats row */}
        <Section style={statsRow}>
          <Section style={statCard}>
            <Text style={statEmoji}>⚡</Text>
            <Text style={statValue}>{xpSemana}</Text>
            <Text style={statLabel}>XP ganhos</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statEmoji}>✅</Text>
            <Text style={statValue}>{questsCompletadas}</Text>
            <Text style={statLabel}>quests concluídas</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statEmoji}>🔥</Text>
            <Text style={statValue}>{streakDias}</Text>
            <Text style={statLabel}>dias seguidos</Text>
          </Section>
        </Section>

        {/* Skills */}
        {skillsAvancadas.length > 0 && (
          <>
            <Text style={sectionTitle}>Skills que avançaram esta semana:</Text>
            <Section style={skillsList}>
              {skillsAvancadas.map((skill, i) => (
                <span key={i} style={skillBadge}>
                  {skill.name} · {skill.level}
                </span>
              ))}
            </Section>
          </>
        )}

        {/* Next quest */}
        {proximaQuest && (
          <>
            <Text style={sectionTitle}>Próxima quest:</Text>
            <Section style={card}>
              <Text style={cardTitle}>{proximaQuest.title}</Text>
              <Text style={cardMeta}>
                ⏱ {proximaQuest.estimatedMinutes} min · ⚡ {proximaQuest.xpReward} XP
              </Text>
            </Section>
          </>
        )}

        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}/dashboard`}>
            Continuar minha jornada →
          </Button>
        </Section>

        <Hr style={divider} />
        <Text style={footer}>
          QuestCareer — Para cancelar notificações,{' '}
          <a href={`${appUrl}/profile#notifications`} style={footerLink}>
            acesse seu perfil
          </a>
        </Text>
      </Container>
    </Body>
  </Html>
);

WeeklyDigestEmail.PreviewProps = {
  name: 'João',
  roleName: 'Desenvolvedor Front-end',
  xpSemana: 210,
  questsCompletadas: 7,
  streakDias: 5,
  skillsAvancadas: [
    { name: 'HTML', level: 'intermediate' },
    { name: 'CSS', level: 'basic' },
  ],
  proximaQuest: { title: 'Flexbox na prática', estimatedMinutes: 20, xpReward: 35 },
  appUrl: 'http://localhost:3000',
} satisfies WeeklyDigestProps;

export default WeeklyDigestEmail;

// ─── Styles ──────────────────────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px 24px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1a1a2e',
  marginBottom: '4px',
};

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
};

const statsRow: React.CSSProperties = {
  display: 'flex' as const,
  gap: '12px',
  margin: '20px 0',
};

const statCard: React.CSSProperties = {
  flex: '1',
  backgroundColor: '#f0f4ff',
  borderRadius: '12px',
  padding: '16px 12px',
  textAlign: 'center' as const,
  border: '1px solid #e0e7ff',
};

const statEmoji: React.CSSProperties = {
  fontSize: '20px',
  margin: '0 0 4px 0',
};

const statValue: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1a1a2e',
  margin: '0',
};

const statLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#666666',
  margin: '2px 0 0 0',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1a1a2e',
  margin: '24px 0 8px 0',
};

const skillsList: React.CSSProperties = {
  display: 'flex' as const,
  flexWrap: 'wrap' as const,
  gap: '8px',
  marginBottom: '8px',
};

const skillBadge: React.CSSProperties = {
  backgroundColor: '#e0e7ff',
  color: '#3730a3',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '500',
};

const card: React.CSSProperties = {
  backgroundColor: '#f0f4ff',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '8px 0 16px',
  border: '1px solid #e0e7ff',
};

const cardTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1a1a2e',
  margin: '0 0 4px 0',
};

const cardMeta: React.CSSProperties = {
  fontSize: '13px',
  color: '#666666',
  margin: '0',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const divider: React.CSSProperties = {
  borderColor: '#e5e5e5',
  margin: '24px 0 16px',
};

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#999999',
  textAlign: 'center' as const,
};

const footerLink: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
