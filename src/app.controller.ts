import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { DiscordService } from './discord/discord.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly discordService: DiscordService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send-message')
  async sendMessage(@Body() body: { username?: string; userId?: string; message: string }) {
    await this.discordService.sendMessage({
      username: body.username,
      userId: body.userId,
      message: body.message,
    });
    return { success: true, message: 'Mensagem enviada com sucesso' };
  }
}

