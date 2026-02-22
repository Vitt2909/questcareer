import type { SupabaseClient } from '@supabase/supabase-js';

const PLATFORMS = [
    {
        id: 'santander', name: 'Santander Open Academy',
        logo_url: 'https://app.becas-santander.com/favicon.ico',
        base_url: 'https://app.becas-santander.com',
        signup_url: 'https://app.becas-santander.com/pt/register',
        certificate_type: 'digital_download',
        certificate_instructions: 'Após concluir, vá em "Meus Cursos" → "Certificados" e baixe o PDF.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 20, active: true,
    },
    {
        id: 'bradesco', name: 'Fundação Bradesco',
        logo_url: 'https://www.ev.org.br/favicon.ico',
        base_url: 'https://www.ev.org.br',
        signup_url: 'https://www.ev.org.br/cadastro',
        certificate_type: 'digital_download',
        certificate_instructions: 'Acesse "Minha Área" → "Meus Cursos" → "Emitir Certificado" após 100% de conclusão. Exige CPF.',
        requires_cpf: true, requires_phone: false, is_free: true, avg_course_hours: 15, active: true,
    },
    {
        id: 'mec', name: 'MEC Aprender+',
        logo_url: 'https://aprendermais.mec.gov.br/favicon.ico',
        base_url: 'https://aprendermais.mec.gov.br',
        signup_url: 'https://aprendermais.mec.gov.br/login/signup.php',
        certificate_type: 'digital_download',
        certificate_instructions: 'Conclua o curso e acesse "Histórico de Cursos" para emitir o certificado em PDF.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 10, active: true,
    },
    {
        id: 'evg', name: 'Escola Virtual GOV (EVG)',
        logo_url: 'https://www.escolavirtual.gov.br/favicon.ico',
        base_url: 'https://www.escolavirtual.gov.br',
        signup_url: 'https://www.escolavirtual.gov.br/cadastro',
        certificate_type: 'digital_download',
        certificate_instructions: 'Após concluir, acesse "Meus Certificados" na barra lateral e baixe o PDF.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 12, active: true,
    },
    {
        id: 'dnc', name: 'Escola DNC',
        logo_url: 'https://www.escoladnc.com.br/favicon.ico',
        base_url: 'https://www.escoladnc.com.br',
        signup_url: 'https://www.escoladnc.com.br/cadastro',
        certificate_type: 'digital_link',
        certificate_instructions: 'Ao completar o curso, o certificado aparece automaticamente no seu perfil DNC.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 25, active: true,
    },
    {
        id: 'ebac', name: 'EBAC Online',
        logo_url: 'https://ebaconline.com.br/favicon.ico',
        base_url: 'https://ebaconline.com.br',
        signup_url: 'https://ebaconline.com.br/cadastro',
        certificate_type: 'email',
        certificate_instructions: 'O certificado é enviado automaticamente para o seu email ao concluir.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 18, active: true,
    },
    {
        id: 'sebrae', name: 'Sebrae Cursos Online',
        logo_url: 'https://sebrae.com.br/favicon.ico',
        base_url: 'https://sebrae.com.br/sites/PortalSebrae/cursosonline',
        signup_url: 'https://digital.sebrae.com.br/cadastrar-se',
        certificate_type: 'digital_download',
        certificate_instructions: 'Acesse seu perfil → "Certificados" após concluir todas as aulas.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 16, active: true,
    },
    {
        id: 'inep', name: 'Escola Virtual GOV — INEP',
        logo_url: 'https://www.gov.br/favicon.ico',
        base_url: 'https://educacenso.inep.gov.br',
        signup_url: 'https://www.gov.br/pt-br/temas/conta-gov-br',
        certificate_type: 'digital_link',
        certificate_instructions: 'Faça login com sua conta gov.br. O certificado é emitido ao final de cada módulo.',
        requires_cpf: false, requires_phone: false, is_free: true, avg_course_hours: 8, active: true,
    },
];

export async function seedPlatforms(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('platforms')
        .upsert(PLATFORMS, { onConflict: 'id' })
        .select();

    if (error) throw error;
    return { platforms: data?.length ?? 0 };
}
