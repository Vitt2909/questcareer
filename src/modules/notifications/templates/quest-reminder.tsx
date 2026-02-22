import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components';
import * as React from 'react';

interface QuestReminderProps {
  name: string;
  questTitle: string;
  questType: string;
  estimatedMinutes: number;
  xpReward: number;
  appUrl: string;
}

export const QuestReminderEmail = ({
  name = 'Aluno',
  questTitle = 'Introdução ao HTML',
  questType = 'video',
  estimatedMinutes = 25,
  xpReward = 30,
  appUrl = 'http://localhost:3000',
}: QuestReminderProps) => (
  <Html>
    <Head />
    <Preview>Sua quest de hoje está esperando por você</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>🎯 Quest do dia</Text>

        <Text style={paragraph}>Oi {name},</Text>
        <Text style={paragraph}>
          Você ainda não fez sua quest de hoje:
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{questTitle}</Text>
          <Section style={badgeRow}>
            <span style={badge}>{questType}</span>
            <span style={meta}>⏱ {estimatedMinutes} min</span>
            <span style={meta}>⚡ {xpReward} XP</span>
          </Section>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}/dashboard`}>
            Fazer quest agora →
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

QuestReminderEmail.PreviewProps = {
  name: 'João',
  questTitle: 'Introdução ao HTML',
  questType: 'video',
  estimatedMinutes: 25,
  xpReward: 30,
  appUrl: 'http://localhost:3000',
} satisfies QuestReminderProps;

export default QuestReminderEmail;

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

const card: React.CSSProperties = {
  backgroundColor: '#f0f4ff',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
  border: '1px solid #e0e7ff',
};

const cardTitle: React.CSSProperties = {
  fontSize: '17px',
  fontWeight: '600',
  color: '#1a1a2e',
  margin: '0 0 8px 0',
};

const badgeRow: React.CSSProperties = {
  display: 'flex' as const,
  gap: '12px',
  alignItems: 'center',
};

const badge: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '3px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'capitalize' as const,
};

const meta: React.CSSProperties = {
  fontSize: '13px',
  color: '#666666',
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
