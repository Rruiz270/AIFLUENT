# AIFLUENT CRM — Plano de Redesign UX/Operacional

**Objetivo:** Elevar produtividade operacional ao nivel Clint sem copiar design.
**Principio:** Vendedor faz tudo em 1 tela. Zero navegacao entre paginas para operacoes do dia-a-dia.

---

## AUDITORIA DO ESTADO ATUAL

### Problemas de UX identificados:

| # | Problema | Impacto | Cliques hoje | Cliques ideal |
|---|---------|---------|-------------|---------------|
| 1 | **Mudar stage do lead requer ir ao Pipeline** | CRITICO — vendedor sai do chat para arrastar card | 3+ (nav + encontrar + drag) | 1 (dropdown no chat) |
| 2 | **Marcar negocio como Ganho/Perdido requer ir ao Pipeline** | CRITICO — operacao mais frequente escondida | 4+ | 1 (botao no chat) |
| 3 | **Sem notas nem historico no chat** | ALTO — vendedor nao tem contexto durante atendimento | Impossivel | 0 (visivel no painel) |
| 4 | **Sidebar de origens flat** | MEDIO — dificil encontrar lista especifica com muitas origens | Scroll | 1 (arvore colapsavel) |
| 5 | **Sem SLA timer** | ALTO — nao ha visibilidade de tempo de espera do lead | N/A | Automatico |
| 6 | **Lead detail abre como modal** | MEDIO — bloqueia a tela, nao permite multitarefa | 2 | 0 (painel lateral) |
| 7 | **Acoes rapidas limitadas a 3** | BAIXO — Clint tem 8, mais contexto sem cliques | 1 | 1 (mas mais opcoes) |

### Fluxo atual do vendedor (WhatsApp):
```
1. Abre /whatsapp
2. Clica na conversa
3. Le a mensagem
4. Responde
5. Quer mover o lead para "Proposta"
6. Abre nova aba → /pipeline
7. Encontra o card do lead (scroll horizontal)
8. Arrasta para "Proposta"
9. Volta para /whatsapp
= 9 passos, 2 paginas, ~30 segundos
```

### Fluxo ideal (apos redesign):
```
1. Abre /whatsapp
2. Clica na conversa
3. Le a mensagem
4. Responde
5. No painel direito, clica dropdown "Prospeccao" → seleciona "Proposta"
= 5 passos, 1 pagina, ~8 segundos
```

**Reducao: 55% menos passos, 73% menos tempo.**

---

## MAPA DE NAVEGACAO PROPOSTO

### Antes (atual):
```
Sidebar
├── Dashboard          → Pagina separada
├── Leads              → Pagina separada (tabela)
├── Pipeline           → Pagina separada (kanban)
├── Negocios           → Pagina separada (lista)
├── WhatsApp           → Pagina separada (chat basico)
├── Campanhas          → Pagina separada
├── Tarefas            → Pagina separada
├── Equipe             → Pagina separada
└── Assistente IA      → Pagina separada
```

### Depois (proposto):
```
Sidebar
├── Dashboard          → Pagina (KPIs + widgets rapidos)
├── Leads              → Pagina (tabela + painel lateral inline)
├── Pipeline           → Pagina (kanban + sidebar hierarquica de origens)
├── Atendimento ★      → CENTRAL DE OPERACAO (3 colunas: lista + chat + painel completo)
├── Campanhas          → Pagina
├── Tarefas            → Pagina
├── Equipe             → Pagina
└── Assistente IA      → Pagina

★ = Unifica WhatsApp + Inbox em uma unica tela de atendimento
```

**Mudanca chave:** "WhatsApp" vira "Atendimento" e se torna a tela principal do vendedor.

---

## WIREFRAMES TEXTUAIS

### TELA: Atendimento (nova central de operacao)

```
┌─────────────────────────────────────────────────────────────────┐
│ ATENDIMENTO                                    [SLA] [Filtros]  │
├──────────┬────────────────────────┬─────────────────────────────┤
│ CONVERSAS│     CHAT               │ PAINEL DO LEAD              │
│          │                        │                             │
│ [Busca]  │ ┌──────────────────┐  │ ┌─────────────────────────┐ │
│          │ │ Herica            │  │ │ 📷 Herica da Paz        │ │
│ [Filtros]│ │ WhatsApp Oficial  │  │ │ 🏷 Home_NEW             │ │
│ Meus(12) │ │ ⏱ 23:45          │  │ │                         │ │
│ Todos(45)│ └──────────────────┘  │ │ 📞 📅 ✉️ ⏰ 🤖 🚩     │ │
│ Nao lidos│                        │ │ (8 acoes rapidas)       │ │
│          │ [Mensagens do chat]    │ ├─────────────────────────┤ │
│ ● Herica │                        │ │ NEGOCIO                 │ │
│   14:24  │ "Vamos sim, eu        │ │ IM > LEADS B2C - ENG    │ │
│   Aguardo│  escolho dar..."      │ │ R$ 0,00                 │ │
│          │                        │ │                         │ │
│ ● Corret.│ "Legal."              │ │ [Ganho] [Perdido] Aberto│ │
│   14:21  │                        │ │                         │ │
│          │ "Vou precisar de      │ │ Stage: [Prospeccao ▼]   │ │
│ ● Marcio │  informacoes..."      │ │                         │ │
│   14:13  │                        │ │ ⏸ Suspender Automacao   │ │
│          │                        │ ├─────────────────────────┤ │
│ ● Giovan.│ "Herica: herica@..."  │ │ ▸ Contato               │ │
│   14:13  │                        │ │ ▸ Negocio               │ │
│          │ "Obrigado! Segue o    │ │ ▸ Notas                 │ │
│          │  link: asaas.com/..." │ │ ▾ Historico             │ │
│          │                        │ │   • Msg WhatsApp 14:24  │ │
│          │ ┌────────────────┐    │ │   • Stage mudou 14:00   │ │
│          │ │ [📎][😀][🎤]  │    │ │   • Lead criado 13:30   │ │
│          │ │ Mensagem...    │    │ │ ▸ Tarefas (2)           │ │
│          │ │          [Enviar]│  │ │ ▸ Conversas (1)         │ │
│          │ └────────────────┘    │ └─────────────────────────┘ │
└──────────┴────────────────────────┴─────────────────────────────┘
```

**Elementos novos no painel direito:**
1. **Botoes Ganho/Perdido/Aberto** — 1 clique para fechar negocio
2. **Stage dropdown** — Mover lead sem ir ao pipeline
3. **Suspender automacao** — Controle individual
4. **Acordeoes colapsaveis**: Contato, Negocio, Notas, Historico, Tarefas, Conversas
5. **SLA timer** no header (verde/amarelo/vermelho)
6. **8 acoes rapidas** em linha (telefone, calendario, email, timer, automacao, flag, contato, negocios)

### TELA: Pipeline (sidebar hierarquica)

```
┌──────────────────────────────────────────────────────────────┐
│ PIPELINE                                                      │
├──────────┬───────────────────────────────────────────────────┤
│ ORIGENS  │ KANBAN                                            │
│          │                                                    │
│ ▾ IM     │ ┌─────────┐ ┌──────────┐ ┌──────────┐           │
│   Ex Alun│ │ Base  17│ │Prosp. 477│ │Conexao486│ ...        │
│   Follow │ │ R$0     │ │ R$3.000  │ │R$36.928  │           │
│   ★ Lead │ ├─────────┤ ├──────────┤ ├──────────┤           │
│     ├ Eng│ │[tag]    │ │[tag]     │ │[tag]     │           │
│     ├ Esp│ │ Nome    │ │ Nome     │ │ Nome     │           │
│     └ B2B│ │💬 msg...│ │💬 msg... │ │💬 msg... │           │
│   Remarket│ │📞💬✉️ R$│ │📞💬✉️ R$│ │📞💬✉️ R$│           │
│   Custom │ └─────────┘ └──────────┘ └──────────┘           │
│          │                                                    │
│ ▸ B2B    │                                                    │
│ ▸ Events │                                                    │
│          │                                                    │
│ VIEWS    │                                                    │
│  Recentes│                                                    │
│  Favorit.│                                                    │
└──────────┴───────────────────────────────────────────────────┘
```

**Elementos novos:**
1. **Arvore hierarquica** com expand/collapse (▾/▸)
2. **Sub-listas** dentro de grupos (IM > English, Spanish, B2B)
3. **Icones coloridos** por grupo
4. **Secao "Views"** com Recentes e Favoritos
5. **Botao "+"** para criar nova lista/grupo

---

## ROADMAP PRIORIZADO

### P0 — Obrigatorio antes do lancamento (Sprint 1-2)

| # | Feature | Impacto | Esforco | Arquivos |
|---|---------|---------|---------|----------|
| **P0.1** | **Painel de negocio no chat** — Botoes Ganho/Perdido/Aberto + stage dropdown + acordeoes (Contato, Negocio, Notas, Historico, Tarefas) | CRITICO — elimina 55% dos cliques | GRANDE | whatsapp/page.tsx, novo componente `lead-operation-panel.tsx` |
| **P0.2** | **Stage dropdown universal** — Selecionar stage em qualquer contexto (chat, lead detail, card hover) sem arrastar | CRITICO — operacao mais frequente | MEDIO | Novo componente `stage-selector.tsx`, integrar em whatsapp, inbox, lead-detail |
| **P0.3** | **Unificar WhatsApp + Inbox em "Atendimento"** — Uma unica tela com canal indicator (WhatsApp/Instagram/Messenger) | ALTO — simplifica navegacao | MEDIO | Renomear/merge whatsapp e inbox pages |
| **P0.4** | **SLA timer** no header do chat — Verde (<5min), Amarelo (5-15min), Vermelho (>15min) | ALTO — visibilidade de urgencia | PEQUENO | Componente `sla-timer.tsx`, integrar no chat header |
| **P0.5** | **Acoes rapidas expandidas** — 8 botoes (📞📅✉️⏰🤖🚩👤📋) no painel do lead | MEDIO — mais contexto sem cliques | PEQUENO | Atualizar painel direito do chat |

**Estimativa Sprint 1-2: ~40 horas de desenvolvimento**

### P1 — Para os primeiros clientes (Sprint 3-4)

| # | Feature | Impacto | Esforco |
|---|---------|---------|---------|
| **P1.1** | Sidebar hierarquica de origens com arvore, icones, sub-listas | ALTO | GRANDE |
| **P1.2** | Multiplos negocios por contato (seletor no painel) | MEDIO | MEDIO |
| **P1.3** | Suspender automacao por contato | MEDIO | PEQUENO |
| **P1.4** | Templates WhatsApp integrado na barra do chat | MEDIO | MEDIO |
| **P1.5** | Visualizacoes salvas (filtros favoritos) | MEDIO | MEDIO |
| **P1.6** | Secao "Recentes" na sidebar | BAIXO | PEQUENO |
| **P1.7** | Badge de pendencias no menu (99+ atendimentos) | MEDIO | PEQUENO |
| **P1.8** | Avatar real do lead (upload/URL) | BAIXO | PEQUENO |

**Estimativa Sprint 3-4: ~30 horas**

### P2 — Diferenciais AIFLUENT (Sprint 5+)

| # | Feature | Diferencial |
|---|---------|------------|
| **P2.1** | IA sugere proximo estagio baseado no historico | Unico no mercado |
| **P2.2** | IA resume conversa em 1 paragrafo | Produtividade |
| **P2.3** | IA gera resposta WhatsApp contextual | Velocidade |
| **P2.4** | IA detecta risco de perda (sentimento negativo) | Retencao |
| **P2.5** | Gamificacao visivel no dashboard (XP, ranking, metas) | Engajamento |
| **P2.6** | Score automatico com ML (nao apenas regras) | Precisao |
| **P2.7** | Integracao pagamento (Asaas/Stripe) no chat | Fechamento rapido |

---

## COMPARATIVO DE IMPACTO

### Antes vs Depois do P0:

| Operacao | Cliques ANTES | Cliques DEPOIS | Reducao |
|----------|-------------|---------------|---------|
| Mover lead de stage no chat | 9 (2 paginas) | 2 (dropdown) | **78%** |
| Marcar negocio como Ganho | 6 (2 paginas) | 1 (botao) | **83%** |
| Ver historico do lead no chat | Impossivel | 0 (visivel) | **100%** |
| Adicionar nota no chat | 4 (modal) | 2 (acordeao) | **50%** |
| Ver valor do negocio no chat | 4 (outra pagina) | 0 (visivel) | **100%** |
| Verificar SLA | Impossivel | 0 (timer visivel) | **100%** |

### Nota projetada apos P0:

| Tela | Antes | Depois P0 | Depois P1 |
|------|-------|-----------|-----------|
| Atendimento/Chat | 40 | **80** | **90** |
| Pipeline/Kanban | 65 | **72** | **85** |
| Painel do Negocio | 30 | **82** | **88** |
| Sidebar de Origens | 35 | 35 | **80** |
| **Media** | **43** | **67** | **86** |

---

## REGRAS DE IMPLEMENTACAO

1. **NAO copiar visual do Clint** — Manter glassmorphism, animacoes Framer Motion, cores sky/blue
2. **Copiar FLUXO operacional** — Mesma produtividade, design proprio
3. **Manter diferenciais** — IA, gamificacao, tema inteligente ficam
4. **Mobile first** — Painel lateral colapsa em mobile, acoes via bottom sheet
5. **Transicao suave** — AnimatePresence em todos os acordeoes e paineis
6. **Dados reais** — Todos os novos componentes buscam de APIs existentes
