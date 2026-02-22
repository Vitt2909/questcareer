import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components';
import * as React from 'react';

interface RecoveryModeProps {
  name: string;
  questTitle: string;
  estimatedMinutes: number;
  xpReward: number;
  appUrl: string;
}

export const RecoveryModeEmail = ({
  name = 'Aluno',
  questTitle = 'Revisão rápida de CSS',
  estimatedMinutes = 10,
  xpReward = 20,
  appUrl = 'http://localhost:3000',
}: RecoveryModeProps) => (
  <Html>
    <Head />
    <Preview>Retomada fácil — 15 minutos é suficiente</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>🔄 Retomada tranquila</Text>

        <Text style={paragraph}>Oi {name},</Text>
        <Text style={paragraph}>
          Sem pressão. Sua próxima quest é rápida:
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{questTitle}</Text>
          <Text style={cardMeta}>
            ⏱ {estimatedMinutes} min · ⚡ {xpReward} XP
          </Text>
        </Section>

        <Text style={paragraph}>
          Você pode voltar ao ritmo normal quando estiver pronto.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}/dashboard`}>
            Começar agora →
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

RecoveryModeEmail.PreviewProps = {
  name: 'João',
  questTitle: 'Revisão rápida de CSS',
  estimatedMinutes: 10,
  xpReward: 20,
  appUrl: 'http://localhost:3000',
} satisfies RecoveryModeProps;

export default RecoveryModeEmail;

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
