# Resumo Custos

Uma aplicação web para gerenciamento e visualização de custos, desenvolvida com JavaScript vanilla, Node.js e SQLite.

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
├── index.html
├── resumo-pratos.html
├── resumo-insumos.html
├── fichas-tecnicas.html
├── cadastrar-pratos.html
├── cadastrar-insumos.html
│
├── /public
│   ├── /css
│   ├── /js
│   │   ├── /pages           # scripts específicos por página
│   │   │   ├── resumo-pratos.js
│   │   │   ├── resumo-insumos.js
│   │   │   ├── fichas-tecnicas.js
│   │   │   ├── cadastrar-pratos.js
│   │   │   └── cadastrar-insumos.js
│   │   ├── /components      # scripts reaproveitáveis (ex: modais, tabelas)
│   │   │   ├── modal.js
│   │   │   ├── tabela.js
│   │   │   └── alert.js
│   │   ├── /utils           # funções utilitárias genéricas
│   │   │   ├── formatar-moeda.js
│   │   │   ├── calcular-total.js
│   │   │   └── validar-campos.js
│   │   └── main.js          # script de inicialização global
│   └── /assets              # imagens, ícones, etc.
│
├── /src                     # código backend (MVCRS)
│   ├── /models              # lógica de dados
│   ├── /views               # se renderizar templates
│   ├── /controllers         # controle de rotas/fluxos
│   ├── /routes              # rotas da aplicação
│   └── /services            # regras de negócio e integrações
│
├── /tests
└── README.md                 # Documentação
```

Nota: As pastas dentro de `src/`, `public/` e `tests/` foram criadas vazias para organizar a arquitetura MVCRS; os arquivos serão adicionados conforme o desenvolvimento avança.

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
- Estrutura inicial do projeto criada com HTML, JavaScript vanilla e Tailwind CSS.
- Menu de navegação responsivo presente em todas as páginas.
- Páginas criadas: Resumo de Pratos, Resumo de Insumos, Fichas Técnicas, Cadastrar Pratos, Cadastrar Insumos.
- Página inicial redireciona para Resumo de Pratos.
- Formulário dinâmico para cadastro de múltiplos insumos implementado, com campos: Nome, Unidade de Medida, Preço e Rendimento.

## Em desenvolvimento
- Integração do cadastro de insumos com armazenamento (localStorage, backend ou outro).
- Validação aprimorada dos campos do formulário.
- Layout e funcionalidades das demais páginas (Resumo de Pratos, Resumo de Insumos, Fichas Técnicas, Cadastrar Pratos).

## Funcionalidades Implementadas
- ✅ CRUD completo de insumos (Create, Read, Update, Delete)
- ✅ Banco de dados SQLite com UUIDs
- ✅ Modal de edição de insumos
- ✅ Validação de formulários
- ✅ API REST com Express.js
- ✅ Segurança com Helmet e Rate Limiting

## Próximas Funcionalidades
- Gestão de pratos
- Fichas técnicas
- Cálculo de custos
- Relatórios

## API Endpoints

- `GET /api/insumos` - Lista todos os insumos
- `GET /api/insumos/:id` - Busca insumo por ID
- `POST /api/insumos` - Cria novo insumo
- `PUT /api/insumos/:id` - Atualiza insumo
- `DELETE /api/insumos/:id` - Remove insumo

---