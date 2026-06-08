export const metadata = {
  title: 'Política de Privacidade — AIFLUENT',
  description: 'Política de Privacidade da plataforma AIFLUENT CRM.',
}

export default function PrivacidadePage() {
  const updated = '08 de junho de 2026'
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-gray-500">
        AIFLUENT CRM · Última atualização: {updated}
      </p>

      <section className="mt-8 space-y-6 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">1. Quem somos</h2>
          <p className="mt-2">
            A AIFLUENT é uma plataforma de CRM que ajuda empresas a captar,
            atender e gerenciar leads e oportunidades comerciais. Esta política
            descreve como tratamos os dados pessoais processados na plataforma.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            2. Dados que coletamos
          </h2>
          <p className="mt-2">
            Tratamos dados de contatos (leads) fornecidos pelas empresas
            clientes ou recebidos por canais integrados, podendo incluir: nome,
            telefone/WhatsApp, e-mail, empresa, interesse, mensagens de
            atendimento e a origem do lead (por exemplo, formulários de anúncios
            do Meta/Facebook Lead Ads e mensagens do WhatsApp).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            3. Como usamos os dados
          </h2>
          <p className="mt-2">
            Os dados são usados exclusivamente para fins de relacionamento
            comercial e atendimento da empresa cliente: registrar o lead,
            organizar o funil de vendas, conduzir o atendimento e gerar
            relatórios. Não vendemos dados pessoais.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            4. Integrações com Meta e WhatsApp
          </h2>
          <p className="mt-2">
            Ao conectar uma conta Meta/Facebook, recebemos os leads dos
            formulários Lead Ads autorizados e mensagens da API do WhatsApp
            Business, com o único objetivo de registrá-los no CRM da empresa
            cliente. O acesso é limitado às permissões concedidas e pode ser
            revogado a qualquer momento.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            5. Compartilhamento e isolamento (multi-tenant)
          </h2>
          <p className="mt-2">
            Cada empresa cliente acessa apenas os próprios dados. Não há
            compartilhamento de dados entre empresas. Provedores de
            infraestrutura (hospedagem e banco de dados) processam dados apenas
            para operar o serviço.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            6. Seus direitos (LGPD)
          </h2>
          <p className="mt-2">
            Titulares de dados podem solicitar acesso, correção, portabilidade e
            exclusão dos seus dados pessoais. A exclusão de dados de um lead pode
            ser solicitada à empresa cliente responsável ou pelo contato abaixo.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            7. Retenção e segurança
          </h2>
          <p className="mt-2">
            Mantemos os dados pelo tempo necessário à finalidade comercial ou
            conforme exigido por lei. Aplicamos medidas técnicas de segurança,
            como criptografia em trânsito, controle de acesso e isolamento por
            organização.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">8. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre privacidade ou solicitações de exclusão de dados:{' '}
            <a
              href="mailto:privacidade@aifluent.com"
              className="text-indigo-600 underline"
            >
              privacidade@aifluent.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
