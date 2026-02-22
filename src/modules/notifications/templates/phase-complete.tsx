import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components';
import * as React from 'react';

interface PhaseSkillPreview {
  name: string;
}

interface PhaseCompleteProps {
  name: string;
  phaseName: string;
  totalHoras: number;
  totalXP: number;
  proximaFase: string;
  proximaFaseSkills: PhaseSkillPreview[];
  appUrl: string;
}

export const PhaseCompleteEmail = ({
  name = 'Aluno',
  phaseName = 'Fundamentos Web',
  totalHoras = 20,
  totalXP = 600,
  proximaFase = 'Projetos Práticos',
  proximaFaseSkills = [],
  appUrl = 'http://localhost:3000',
}: PhaseCompleteProps) => (
  <Html>
    <Head />
    <Preview>Fase {phaseName} concluída — você chegou lá!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>🎉 Fase concluída!</Text>

        <Text style={paragraph}>Oi {name},</Text>
        <Text style={paragraph}>
          Você concluiu a fase <strong>&lsquo;{phaseName}&rsquo;</strong>!
          Isso representa <strong>{totalHoras}h</strong> de aprendizado real.
        </Text>
        <Text style={paragraph}>
          XP total acumulado: <strong>{totalXP}</strong>
        </Text>

        {/* Next phase preview */}
        <Section style={card}>
          <Text style={cardTitle}>Próxima fase: {proximaFase}</Text>
          {proximaFaseSkills.length > 0 && (
            <Section style={skillsList}>
              {proximaFaseSkills.slice(0, 3).map((skill, i) => (
                <span key={i} style={skillBadge}>{skill.name}</span>
              ))}
            </Section>
          )}
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}/dashboard`}>
            Ver meu progresso →
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

PhaseCompleteEmail.PreviewProps = {
  name: 'João',
  phaseName: 'Fundamentos Web',
  totalHoras: 20,
  totalXP: 600,
  proximaFase: 'Projetos Práticos',
  proximaFaseSkills: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'APIs REST' }],
  appUrl: 'http://localhost:3000',
} satisfies PhaseCompleteProps;

export default PhaseCompleteEmail;

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

const skillsList: React.CSSProperties = {
  display: 'flex' as const,
  flexWrap: 'wrap' as const,
  gap: '8px',
};

const skillBadge: React.CSSProperties = {
  backgroundColor: '#e0e7ff',
  color: '#3730a3',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '500',
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
