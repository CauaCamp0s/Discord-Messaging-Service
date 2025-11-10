# 🚀 Como Habilitar a Intent para Usar Username

## ✅ Solução Temporária (Funciona AGORA)

O código está configurado para funcionar **sem a intent** usando apenas:
- ✅ `userId` - Funciona perfeitamente
- ✅ `channelId` - Funciona perfeitamente
- ❌ `username` - Não funciona (requer intent)

## 📋 Para Habilitar Username (Passo a Passo)

### 1. Acesse o Discord Developer Portal
https://discord.com/developers/applications

### 2. Selecione sua aplicação "Messaging Service"

### 3. No menu lateral esquerdo, clique em **"Bot"**

### 4. Role a página até encontrar a seção **"Privileged Gateway Intents"**

### 5. Ative o switch **"SERVER MEMBERS INTENT"**

### 6. Salve as alterações (pode pedir confirmação)

### 7. No código, descomente a linha no arquivo `src/discord/discord.service.ts`:

```typescript
intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers, // ← Descomente esta linha
  GatewayIntentBits.DirectMessages,
],
```

### 8. Reinicie a aplicação

```bash
npm run start:dev
```

## 💡 Exemplo de Uso Atual (Sem Intent)

```typescript
// ✅ Funciona AGORA
await discordService.sendMessage({
  userId: '123456789012345678',
  message: 'Mensagem aqui',
});

// ✅ Funciona AGORA
await discordService.sendMessage({
  channelId: '123456789012345678',
  message: 'Mensagem no canal',
});

// ❌ NÃO funciona (precisa habilitar intent)
await discordService.sendMessage({
  username: 'NomeDoUsuario',
  message: 'Mensagem aqui',
});
```

## 🎯 Resumo

- **Agora**: Use `userId` ou `channelId`
- **Depois**: Habilite a intent no portal → Descomente a linha no código → Use `username`

