import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, User, TextChannel } from 'discord.js';

export interface SendMessageOptions {
  username?: string;
  userId?: string;
  message: string;
  channelId?: string;
}

export interface SendMessageResult {
  success: boolean;
  username?: string;
  userId?: string;
  message: string;
}

@Injectable()
export class DiscordService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client;
  private isReady = false;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Necessário para buscar usuários por username
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.setupEventHandlers();
  }

  async onModuleInit() {
    const token = this.configService.get<string>('DISCORD_BOT_TOKEN');
    
    if (!token) {
      this.logger.error('DISCORD_BOT_TOKEN não encontrado nas variáveis de ambiente');
      throw new Error('DISCORD_BOT_TOKEN é obrigatório');
    }

    try {
      await this.client.login(token);
      this.logger.log('Conectando ao Discord...');
    } catch (error) {
      this.logger.error('Erro ao fazer login no Discord', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.destroy();
      this.logger.log('Bot desconectado do Discord');
    }
  }

  private setupEventHandlers() {
    this.client.once('ready', () => {
      this.isReady = true;
      this.logger.log(`Bot online! Logado como ${this.client.user?.tag}`);
    });

    this.client.on('error', (error) => {
      this.logger.error('Erro no cliente Discord', error);
    });
  }

  private async waitForReady(): Promise<void> {
    if (this.isReady) return;

    return new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
    });
  }

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    await this.waitForReady();

    const { username, userId, message, channelId } = options;

    try {
      if (channelId) {
        await this.sendToChannel(channelId, message);
        return { success: true, message };
      }

      if (userId) {
        const result = await this.sendToUserById(userId, message);
        return { success: true, username: result.username, userId, message };
      }

      if (username) {
        const result = await this.sendToUserByUsername(username, message);
        return { success: true, username: result.username, userId: result.userId, message };
      }

      throw new Error('É necessário fornecer username, userId ou channelId');
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem', error);
      throw error;
    }
  }

  private async sendToUserByUsername(username: string, message: string): Promise<{ username: string; userId: string }> {
    try {
      const user = await this.findUserByUsername(username);

      if (!user) {
        throw new Error(
          `Usuário '${username}' não encontrado. ` +
          `Certifique-se de que o usuário está em um servidor compartilhado com o bot. ` +
          `Se a intent "SERVER MEMBERS INTENT" não estiver habilitada, use o userId (apenas números) do usuário.`,
        );
      }

      await this.sendDM(user, message);
      this.logger.log(`Mensagem enviada para ${username} (${user.id})`);
      
      return { username: user.username, userId: user.id };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          throw error;
        }
        if (error.message.includes('SERVER MEMBERS INTENT') || error.message.includes('disallowed intents')) {
          throw new Error(
            `Para usar username, habilite "SERVER MEMBERS INTENT" no Discord Developer Portal. ` +
            `Vá em: Bot → Privileged Gateway Intents → Ative "SERVER MEMBERS INTENT" → Salve. ` +
            `Alternativamente, use o userId (apenas números) do usuário.`,
          );
        }
        throw new Error(`Erro ao enviar mensagem para ${username}: ${error.message}`);
      }
      throw error;
    }
  }

  private async sendToUserById(userId: string, message: string): Promise<{ username: string; userId: string }> {
    try {
      this.logger.log(`📤 Iniciando envio de DM para userId ${userId}`);
      
      const user = await this.client.users.fetch(userId, { force: true });

      if (!user) {
        throw new Error(`Usuário com ID '${userId}' não encontrado`);
      }

      this.logger.log(`✅ Usuário encontrado: ${user.username} (${user.id})`);
      this.logger.log(`📋 Informações do usuário: ${user.bot ? 'BOT' : 'USUÁRIO'} | Tag: ${user.tag}`);
      
      // Verificar se o bot está pronto
      if (!this.isReady) {
        throw new Error('Bot ainda não está pronto. Aguarde a conexão ser estabelecida.');
      }
      
      // Verificar se bot e usuário compartilham algum servidor
      const sharedGuilds = this.client.guilds.cache.filter(guild => 
        guild.members.cache.has(userId)
      );
      
      if (sharedGuilds.size > 0) {
        this.logger.log(`✅ Bot e usuário compartilham ${sharedGuilds.size} servidor(es): ${Array.from(sharedGuilds.keys()).join(', ')}`);
      } else {
        this.logger.warn(`⚠️ Bot e usuário NÃO compartilham nenhum servidor. Isso pode impedir o envio de DMs.`);
      }
      
      await this.sendDM(user, message);
      
      return { username: user.username, userId: user.id };
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar para userId ${userId}:`, error);
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('não encontrado') || 
            errorMsg.includes('unknown user') ||
            errorMsg.includes('not found')) {
          throw new Error(
            `Usuário com ID '${userId}' não encontrado. ` +
            `Certifique-se de que o ID está correto (17-19 dígitos). ` +
            `Verifique também se o usuário existe no Discord.`,
          );
        }
        
        if (errorMsg.includes('cannot send messages') || 
            errorMsg.includes('não aceita mensagens') ||
            errorMsg.includes('50007')) {
          // Verificar servidores compartilhados para dar mensagem mais específica
          const sharedGuilds = this.client.guilds.cache.filter(guild => 
            guild.members.cache.has(userId)
          );
          
          if (sharedGuilds.size === 0) {
            throw new Error(
              `❌ Não foi possível enviar mensagem para ${userId}. ` +
              `O bot e o usuário NÃO compartilham nenhum servidor. ` +
              `SOLUÇÃO: Adicione o bot "Messaging Service" a um servidor onde o usuário está, ou peça ao usuário para enviar uma mensagem para o bot primeiro. ` +
              `Esta é uma limitação de segurança do Discord.`,
            );
          } else {
            throw error; // Já tem mensagem detalhada
          }
        }
        
        throw new Error(`Erro ao enviar mensagem para userId ${userId}: ${error.message}`);
      }
      throw error;
    }
  }

  private async sendToChannel(channelId: string, message: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        throw new Error(`Canal '${channelId}' não encontrado ou não é um canal de texto`);
      }

      await (channel as TextChannel).send(message);
      this.logger.log(`Mensagem enviada para canal ${channelId}`);
    } catch (error) {
      throw new Error(`Erro ao enviar mensagem para canal ${channelId}: ${error.message}`);
    }
  }

  private async findUserByUsername(username: string): Promise<User | null> {
    const normalizedUsername = username.toLowerCase().trim();

    const guilds = this.client.guilds.cache;

    for (const guild of guilds.values()) {
      try {
        const members = await guild.members.fetch();
        const member = members.find(
          (m) => m.user.username.toLowerCase() === normalizedUsername,
        );

        if (member) {
          return member.user;
        }
      } catch (error) {
        this.logger.warn(
          `Não foi possível buscar no servidor ${guild.name}. ` +
          `Certifique-se de que "SERVER MEMBERS INTENT" está habilitada no Discord Developer Portal.`,
        );
      }
    }

    return null;
  }

  private async sendDM(user: User, message: string): Promise<void> {
    try {
      this.logger.log(`🔍 Tentando criar DM com usuário ${user.username} (${user.id})...`);
      
      // Tentar criar o canal DM
      const dmChannel = await user.createDM();
      this.logger.log(`✅ Canal DM criado com sucesso: ${dmChannel.id}`);
      
      // Verificar se o canal existe e é válido
      if (!dmChannel) {
        throw new Error('Canal DM não foi criado');
      }
      
      this.logger.log(`📤 Enviando mensagem para o canal DM ${dmChannel.id}...`);
      const sentMessage = await dmChannel.send(message);
      this.logger.log(`✅ Mensagem enviada com sucesso! ID da mensagem: ${sentMessage.id}`);
      this.logger.log(`✅ Mensagem privada enviada para ${user.username} (${user.id}) - SEM precisar estar no servidor!`);
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar DM para ${user.username} (${user.id}):`, error);
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('cannot send messages to this user') || 
            errorMsg.includes('cannot send messages')) {
          throw new Error(
            `❌ Usuário ${user.username} (${user.id}) não aceita mensagens privadas de bots. ` +
            `IMPORTANTE: No Discord, bots só podem enviar DMs para usuários que: ` +
            `1) Compartilham um servidor com o bot, OU ` +
            `2) Já interagiram com o bot antes (enviaram uma mensagem para o bot). ` +
            `Solução: Adicione o bot a um servidor onde o usuário está, ou peça ao usuário para enviar uma mensagem para o bot primeiro.`,
          );
        }
        
        if (errorMsg.includes('missing access') || 
            errorMsg.includes('unknown user') ||
            errorMsg.includes('not found')) {
          throw new Error(
            `❌ Usuário não encontrado ou inacessível. ` +
            `Certifique-se de que o userId está correto (17-19 dígitos). ` +
            `Nota: Mesmo com userId, o Discord pode exigir que o bot e o usuário compartilhem um servidor.`,
          );
        }
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('too many')) {
          throw new Error(
            `❌ Rate limit atingido. Aguarde alguns segundos antes de tentar novamente.`,
          );
        }
      }
      
      // Log do erro completo para debug
      this.logger.error('Erro completo:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }

  isBotReady(): boolean {
    return this.isReady;
  }
}

