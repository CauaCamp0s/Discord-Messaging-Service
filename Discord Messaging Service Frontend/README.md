# Discord Messaging Service Frontend

Frontend web para envio de mensagens diretas no Discord. Interface moderna e intuitiva construída com Next.js, React 19 e Tailwind CSS, seguindo o design system do Discord.

## 🚀 Tecnologias

### Core
- **Next.js 16.0.0** - Framework React com App Router
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4.1.9** - Estilização utilitária

### UI Components
- **Radix UI** - Componentes acessíveis e primitivos
- **Lucide React** - Ícones
- **Sonner** - Sistema de notificações/toast
- **Vaul** - Drawer component
- **Recharts** - Gráficos e visualizações

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **@hookform/resolvers** - Integração React Hook Form + Zod

### Outros
- **next-themes** - Suporte a temas claro/escuro
- **date-fns** - Manipulação de datas
- **@vercel/analytics** - Analytics da Vercel

## 📁 Estrutura do Projeto

```
Discord Messaging Service Frontend/
├── app/                      # App Router do Next.js
│   ├── api/                  # API Routes
│   │   └── discord/
│   │       └── send/
│   │           └── route.ts  # Endpoint para envio de mensagens
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Página principal
├── components/               # Componentes React
│   ├── ui/                   # Componentes de UI reutilizáveis
│   ├── message-form.tsx      # Formulário de envio de mensagens
│   ├── message-card.tsx     # Card de mensagem individual
│   ├── sent-messages-list.tsx # Lista de mensagens enviadas
│   └── theme-provider.tsx   # Provedor de temas
├── hooks/                    # Custom hooks
│   ├── use-mobile.ts        # Hook para detectar mobile
│   └── use-toast.ts         # Hook para notificações
├── lib/                      # Utilitários
│   └── utils.ts             # Funções auxiliares
├── public/                   # Arquivos estáticos
└── styles/                   # Estilos adicionais
```

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- npm, yarn ou pnpm

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd "Discord Messaging Service Frontend"
```

2. **Instale as dependências**
```bash
npm install
```

> **Nota:** O projeto usa `--legacy-peer-deps` devido a incompatibilidade entre React 19 e algumas bibliotecas (como `vaul`). Isso está configurado automaticamente no arquivo `.npmrc`.

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter ESLint

## ✨ Funcionalidades

### Envio de Mensagens
- ✅ Envio de mensagens diretas via ID ou username do Discord
- ✅ Validação de campos obrigatórios
- ✅ Feedback visual durante o envio
- ✅ Notificações de sucesso/erro

### Histórico de Mensagens
- ✅ Lista de todas as mensagens enviadas
- ✅ Armazenamento local (localStorage)
- ✅ Exibição de timestamp e status
- ✅ Interface vazia quando não há mensagens

### Interface
- ✅ Design inspirado no Discord (tema escuro)
- ✅ Responsivo e acessível
- ✅ Componentes UI modernos e reutilizáveis
- ✅ Animações suaves

### Em Desenvolvimento
- ⏳ Envio de mensagens em massa via arquivo CSV/Excel
- ⏳ Integração completa com API do Discord

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto (se necessário):

```env
# Exemplo (ajuste conforme sua API)
DISCORD_API_URL=http://localhost:3000
```

### API Backend
O frontend faz requisições para:
- `POST /api/discord/send` - Envia mensagem
- `POST http://localhost:3000/send-message` - Endpoint do backend (configurar conforme necessário)

## 🎨 Design System

O projeto utiliza um tema customizado baseado no Discord:

- **Cores principais:**
  - `discord-dark-1` - Fundo principal
  - `discord-dark-2` - Cards e containers
  - `discord-purple` - Cor de destaque
  - `discord-gray` - Texto secundário

## 📦 Dependências Principais

### Produção
- `next@16.0.0`
- `react@19.2.0`
- `react-dom@19.2.0`
- `@radix-ui/*` - Componentes UI
- `tailwindcss@4.1.9`
- `zod@3.25.76`
- `react-hook-form@^7.60.0`

### Desenvolvimento
- `typescript@^5`
- `@types/react@^19`
- `@types/node@^22`
- `eslint`

## ⚠️ Notas Importantes

1. **Peer Dependencies:** O projeto usa `--legacy-peer-deps` devido a incompatibilidade entre React 19 e algumas bibliotecas. Isso está configurado no `.npmrc`.

2. **API Backend:** Atualmente, a API route (`/api/discord/send`) faz uma requisição para `http://localhost:3000/send-message`. Certifique-se de que o backend está rodando ou ajuste a URL conforme necessário.

3. **Armazenamento:** As mensagens são armazenadas no `localStorage` do navegador. Para produção, considere implementar um backend com banco de dados.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado.

## 👤 Autor

Desenvolvido com Next.js e React.

---

**Status:** Em desenvolvimento ativo 🚧

