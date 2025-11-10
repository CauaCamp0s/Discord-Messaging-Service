import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, User, TextChannel } from 'discord.js';

export interface SendMessageOptions {
  username?: string;
  userId?: string;
  message: string;
  channelId?: string;
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
        GatewayIntentBits.GuildMembers, // Requer habilitação no Discord Developer Portal
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

  async sendMessage(options: SendMessageOptions): Promise<void> {
    await this.waitForReady();

    const { username, userId, message, channelId } = options;

    try {
      if (channelId) {
        await this.sendToChannel(channelId, message);
        return;
      }

      if (userId) {
        await this.sendToUserById(userId, message);
        return;
      }

      if (username) {
        await this.sendToUserByUsername(username, message);
        return;
      }

      throw new Error('É necessário fornecer username, userId ou channelId');
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem', error);
      throw error;
    }
  }

  private async sendToUserByUsername(username: string, message: string): Promise<void> {
    try {
      const user = await this.findUserByUsername(username);

      if (!user) {
        throw new Error(`Usuário '${username}' não encontrado`);
      }

      await this.sendDM(user, message);
      this.logger.log(`Mensagem enviada para ${username}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('não encontrado')) {
        throw error;
      }
      throw new Error(`Erro ao enviar mensagem para ${username}: ${error.message}`);
    }
  }

  private async sendToUserById(userId: string, message: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(userId);

      if (!user) {
        throw new Error(`Usuário com ID '${userId}' não encontrado`);
      }

      await this.sendDM(user, message);
      this.logger.log(`Mensagem enviada para ${user.username}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('não encontrado')) {
        throw error;
      }
      throw new Error(`Erro ao enviar mensagem para userId ${userId}: ${error.message}`);
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
    this.logger.warn(
      '⚠️ Busca por username requer a intent "SERVER MEMBERS INTENT" habilitada. ' +
      'Para usar username, habilite a intent no Discord Developer Portal (Bot → Privileged Gateway Intents). ' +
      'Alternativamente, use userId que funciona sem intents privilegiadas.',
    );

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
          `Habilite "SERVER MEMBERS INTENT" no Discord Developer Portal.`,
        );
      }
    }

    return null;
  }

  private async sendDM(user: User, message: string): Promise<void> {
    try {
      const dmChannel = await user.createDM();
      await dmChannel.send(message);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot send messages to this user')) {
        throw new Error(`Usuário ${user.username} não aceita mensagens privadas ou bloqueou o bot`);
      }
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

