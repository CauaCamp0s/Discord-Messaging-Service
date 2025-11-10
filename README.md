# Discord Messaging Service

Serviço NestJS para envio de mensagens privadas no Discord usando um bot.

## 📋 Requisitos

- Node.js 18+ 
- npm ou yarn
- Bot do Discord configurado

## 🚀 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o Bot do Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação ou selecione uma existente
3. Vá em **Bot** (menu lateral esquerdo) e crie um bot se ainda não tiver
4. Copie o **Token** do bot (clique em "Reset Token" ou "Copy" para copiar)
5. **IMPORTANTE**: Role a página até a seção **"Privileged Gateway Intents"** e habilite:
   - ✅ **SERVER MEMBERS INTENT** (obrigatório para buscar usuários por username)
   - ✅ **MESSAGE CONTENT INTENT** (opcional, apenas se precisar ler conteúdo de mensagens)

> ⚠️ **Erro "Used disallowed intents"?**  
> Isso significa que você precisa habilitar a **SERVER MEMBERS INTENT** no Discord Developer Portal.  
> Vá em: **Bot** → Role até **"Privileged Gateway Intents"** → Ative **"SERVER MEMBERS INTENT"** → Salve as alterações

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` e adicione seu token:

```
DISCORD_BOT_TOKEN=seu_token_do_bot_aqui
```

### 4. Executar a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 💻 Uso

### Importar o DiscordService

```typescript
import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';

@Injectable()
export class MeuService {
  constructor(private readonly discordService: DiscordService) {}

  async enviarMensagem() {
    await this.discordService.sendMessage({
      username: 'NomeDoUsuario',
      message: 'Olá! Essa é uma mensagem automática.',
    });
  }
}
```

### Métodos disponíveis

#### Enviar por username

```typescript
await discordService.sendMessage({
  username: 'NomeDoUsuario',
  message: 'Mensagem aqui',
});
```

#### Enviar por userId

```typescript
await discordService.sendMessage({
  userId: '123456789012345678',
  message: 'Mensagem aqui',
});
```

#### Enviar para canal

```typescript
await discordService.sendMessage({
  channelId: '123456789012345678',
  message: 'Mensagem aqui',
});
```

## 🔧 Estrutura do Projeto

```
src/
├── discord/
│   ├── discord.module.ts    # Módulo do Discord
│   └── discord.service.ts   # Serviço principal
├── app.module.ts            # Módulo principal
├── app.controller.ts        # Controller de exemplo
├── app.service.ts           # Service de exemplo
└── main.ts                  # Entry point
```

## ⚠️ Tratamento de Erros

O serviço trata automaticamente:

- ✅ Usuário não encontrado
- ✅ Usuário que não aceita DMs
- ✅ Bot não conectado
- ✅ Token inválido
- ✅ Canal não encontrado

## 📝 Exemplo de Resposta de Erro

```typescript
try {
  await discordService.sendMessage({
    username: 'UsuarioInexistente',
    message: 'Teste',
  });
} catch (error) {
  // Erro: Usuário 'UsuarioInexistente' não encontrado
  console.error(error.message);
}
```

## 🔐 Segurança

- **NUNCA** commite o arquivo `.env` no Git
- Mantenha seu token seguro
- Use variáveis de ambiente em produção

## 📚 Documentação Adicional

- [Discord.js Documentation](https://discord.js.org/#/docs)
- [NestJS Documentation](https://docs.nestjs.com/)

