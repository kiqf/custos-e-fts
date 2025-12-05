# 📌 Análise do Problema e Estratégias de Solução

Este projeto foi criado para substituir um sistema baseado em Excel que gerava erros frequentes, dificuldade de manutenção e problemas de uso simultâneo pela equipe. A aplicação web traz mais confiabilidade, escalabilidade e facilidade de atualização.

---

## 1. 🔍 Análise das Situações-Problema

- Planilhas geravam *conflitos de versão* e perda de informações.
- *Validações frágeis* e fáceis de quebrar.
- Alterações exigiam *manutenção manual*, tornando o processo lento.
- Falta de suporte multiusuário → sobrescritas e inconsistências.
- Ausência de auditoria e histórico de alterações.

*Causa-raiz:* dependência de um sistema manual, sem validações centralizadas, sem controle de concorrência e sem estrutura para expansão.

---

## 2. 🎯 Fatores-Chave para Intervenção

- Necessidade de um *modelo de dados centralizado*.
- Validações confiáveis e padronizadas.
- Suporte a vários usuários simultaneamente.
- Logs e auditoria para rastreamento.
- Processo de atualização mais seguro e escalável.

---

## 3. 🚀 Estratégias Iniciais de Solução

- Criação de uma aplicação web com *validações server-side e client-side*.
- Implementação de *auditoria*, autenticação e controle de acesso.
- Estruturação do banco de dados para reduzir erros e duplicidades.
- Suporte real a múltiplos usuários, eliminando conflitos.
- Planejamento de melhorias futuras como integrações, dashboards e automações.

---

## Tecnologias Utilizadas

- **Frontend**: HTML5, JavaScript (Vanilla), Tailwind CSS (via CDN)
- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite3
- **Segurança**: Helmet, Express Rate Limit
- **IDs**: UUID v4

## Estrutura do Projeto

```
custos-e-fts/
│
├── index.html               # página inicial
│
├── /public                  # arquivos estáticos frontend
│   └── /js
│       ├── /pages           # scripts específicos por página
│       │   ├── cadastrar-insumos.js
│       │   ├── cadastrar-pratos.js
│       │   ├── calculo-custos.js
│       │   ├── fichas-tecnicas.js
│       │   └── resumo-pratos.js
│       ├── /components      # componentes reutilizáveis
│       │   ├── filtros.js
│       │   └── modal.js
│       ├── /utils           # funções utilitárias
│       │   ├── calcular-custos-variaveis.js
│       │   ├── calcular-taxas.js
│       │   ├── formatar-moeda.js
│       │   ├── normalizador.js
│       │   └── validar-campos.js
│       └── main.js          # script de inicialização global
│
├── /src                     # código backend
│   ├── /database            # camada de dados
│   │   ├── database.sqlite  # banco SQLite
│   │   ├── db.js           # configuração do banco
│   │   ├── insumoRepository.js
│   │   ├── pratoRepository.js
│   │   └── schema.sql      # estrutura do banco
│   ├── /views              # páginas HTML
│   │   ├── cadastrar-insumos.html
│   │   ├── cadastrar-pratos.html
│   │   ├── calculo-custos.html
│   │   ├── fichas-tecnicas.html
│   │   └── resumo-pratos.html
│   └── server.js           # servidor Express
│
├── .env.example            # exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

**Nota**: A arquitetura MVCRS (Model-View-Controller-Routes-Services) será implementada em futuras atualizações para melhor organização do código backend.

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/custos-e-fts.git
   cd custos-e-fts
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor**
   ```bash
   npm start
   ```

4. **Acesse a aplicação**
   - Abra seu navegador e vá para: `http://localhost:3001`

### Scripts disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (com nodemon)

## Desenvolvimento

Para desenvolvimento, use:
```bash
npm run dev
```

O servidor será reiniciado automaticamente quando houver mudanças nos arquivos.

# Andamento do Projeto

## O que já foi realizado
- ✅ Estrutura completa do projeto com HTML, JavaScript vanilla, Tailwind CSS e Node.js
- ✅ Sistema de navegação otimizado e responsivo
- ✅ Todas as páginas principais implementadas e funcionais
- ✅ Sistema completo de CRUD para insumos e pratos
- ✅ Banco de dados SQLite com estrutura robusta
- ✅ API REST completa com segurança (Helmet, Rate Limiting)
- ✅ Sistema de importação CSV para insumos e pratos
- ✅ Fichas técnicas com cálculos automáticos
- ✅ Cálculo de custos avançado com múltiplas taxas
- ✅ Sistema de filtros dinâmicos
- ✅ Modais informativos para importação
- ✅ Sistema de notificações visuais
- ✅ Campos de mídia (foto, links) para pratos

## Em desenvolvimento
- 🚧 Custos variáveis (embalagem, descartáveis, lacre)
- 🚧 Relatórios avançados
- 🚧 Dashboard analítico

## Funcionalidades Implementadas
- ✅ **CRUD Completo**: Insumos e pratos com validação
- ✅ **Banco de Dados**: SQLite com UUIDs e relacionamentos
- ✅ **Importação Inteligente**: CSV com criação automática de insumos inexistentes
- ✅ **Fichas Técnicas**: Cálculos automáticos de FC, quantidade bruta e custos
- ✅ **Cálculo de Custos Avançado**:
  - Preço de venda configurável
  - Taxas automáticas (iFood, Simples, Royalties, FUP)
  - Faturamento líquido e percentuais
  - Formatação monetária brasileira
- ✅ **Sistema de Filtros**: Por categoria e operação
- ✅ **Interface Moderna**: Modais informativos e notificações
- ✅ **Mídia para Pratos**: Foto, link documento e vídeo
- ✅ **API Segura**: Express.js com Helmet e Rate Limiting
- ✅ **UX Otimizada**: Loading states e feedback visual

## Próximas Funcionalidades
- 📊 **Dashboard Analítico**: Gráficos de custos e rentabilidade
- 📋 **Relatórios Avançados**: Exportação PDF/Excel
- 💰 **Custos Variáveis**: Embalagem, descartáveis, lacre
- 🔄 **Sincronização**: Backup e restore de dados
- 📱 **PWA**: Aplicativo web progressivo
- 🎯 **Análise de Margem**: Comparativo de rentabilidade
- 📈 **Histórico de Preços**: Controle de variações
- 🏷️ **Etiquetas**: Geração automática de preços

## API Endpoints

### Insumos
- `GET /api/insumos` - Lista todos os insumos
- `GET /api/insumos/:id` - Busca insumo por ID
- `POST /api/insumos` - Cria novo insumo
- `PUT /api/insumos/:id` - Atualiza insumo
- `DELETE /api/insumos/:id` - Remove insumo

### Pratos
- `GET /api/pratos` - Lista todos os pratos (com filtros opcionais)
- `GET /api/pratos/:id` - Busca prato por ID com insumos
- `POST /api/pratos` - Cria novo prato com insumos
- `PUT /api/pratos/:id` - Atualiza prato completo
- `DELETE /api/pratos/:id` - Remove prato
- `POST /api/pratos/importar` - Importa pratos via CSV
- `PUT /api/pratos/:id/preco` - Atualiza preço de venda
- `DELETE /api/pratos/:pratoId/insumos/:insumoId` - Remove insumo do prato

### Filtros
- `GET /api/filtros/categorias` - Lista categorias únicas
- `GET /api/filtros/operacoes` - Lista operações únicas

---