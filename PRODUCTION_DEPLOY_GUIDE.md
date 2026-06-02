# AIFLUENT CRM — Guia de Deploy em Producao

## Variaveis de Ambiente Necessarias

| Variavel | Obrigatoria | Exemplo |
|----------|-------------|---------|
| `DATABASE_URL` | SIM | `postgresql://user:pass@host/db?sslmode=require` |
| `AUTH_SECRET` | SIM | Gerar com `openssl rand -base64 32` |
| `SEED_ADMIN_PASSWORD` | SIM (1o deploy) | Senha forte para admin (min 6 chars) |
| `SEED_GESTOR_PASSWORD` | Opcional | Senha para gestor |
| `SEED_OPERADOR_PASSWORD` | Opcional | Senha para operador |
| `WHATSAPP_PHONE_NUMBER_ID` | Opcional | ID do numero na Meta Business |
| `WHATSAPP_ACCESS_TOKEN` | Opcional | Token da WhatsApp Cloud API |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Opcional | ID da conta business |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Opcional | Token para verificacao do webhook |

## Passo a Passo — Neon (PostgreSQL Gratuito)

1. Criar conta em https://neon.tech
2. Criar projeto "aifluent"
3. Copiar a connection string (formato: `postgresql://user:pass@host/db?sslmode=require`)
4. Usar como `DATABASE_URL`

## Passo a Passo — Vercel

1. Acessar https://vercel.com/dashboard
2. Selecionar projeto AIFLUENT
3. Ir em Settings > Environment Variables
4. Adicionar:
   - `DATABASE_URL` = connection string do Neon
   - `AUTH_SECRET` = resultado de `openssl rand -base64 32`
   - `SEED_ADMIN_PASSWORD` = sua senha de admin
5. Clicar em "Redeploy" no ultimo commit

## Apos o Deploy

1. Acessar a URL da Vercel
2. Na tela de login, usar: `admin@aifluent.com` + senha definida em SEED_ADMIN_PASSWORD
3. O sistema cria automaticamente o admin no primeiro login
4. Verificar `/api/health` — deve retornar `{"status":"healthy","checks":{"database":true}}`

## Checklist Pos-Deploy

- [ ] Login funciona
- [ ] Dashboard carrega (mostra 0 leads inicialmente)
- [ ] Criar um lead de teste
- [ ] Lead aparece na listagem
- [ ] Pipeline mostra colunas
- [ ] Arrastar lead entre colunas funciona
- [ ] Criar tarefa funciona
- [ ] Criar negocio funciona
- [ ] `/api/health` retorna healthy

## Modulos Disponiveis no Lancamento

| Modulo | Status |
|--------|--------|
| Dashboard | Operacional |
| Leads | Operacional |
| Pipeline Kanban | Operacional |
| Negocios | Operacional |
| Tarefas | Operacional |
| Campanhas | Operacional |
| Equipe | Operacional |
| WhatsApp | Operacional (precisa token Meta) |
| Assistente IA | Operacional |

## Modulos em Desenvolvimento (ocultos do menu)

Inbox, Telefonia, Disparos, Templates, Meta Ads, Automacoes,
Produtividade, Relatorios, Seguranca, Configuracoes, Integracoes
