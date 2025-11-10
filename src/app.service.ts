import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';

@Injectable()
export class AppService {
  constructor(private readonly discordService: DiscordService) {}

  getHello(): string {
    return 'Discord Messaging Service está funcionando!';
  }

  async sendDiscordMessage(username: string, message: string): Promise<void> {
    await this.discordService.sendMessage({
      username,
      message,
    });
  }
}

