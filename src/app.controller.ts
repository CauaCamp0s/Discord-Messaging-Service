import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { DiscordService } from './discord/discord.service';
import { FileProcessorService } from './file-processor/file-processor.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly discordService: DiscordService,
    private readonly fileProcessorService: FileProcessorService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  private isUserId(value: string): boolean {
    if (!value) return false;
    const trimmed = value.trim();
    return /^\d{17,19}$/.test(trimmed);
  }

  @Post('send-message')
  async sendMessage(
    @Body() body: { usernameOrId?: string; username?: string; userId?: string; message: string },
  ) {
    const { usernameOrId, username, userId, message } = body;

    if (!message) {
      throw new BadRequestException('Mensagem é obrigatória');
    }

    let targetUsername: string | undefined;
    let targetUserId: string | undefined;

    // Limpar espaços em branco de todos os valores
    const cleanUsernameOrId = usernameOrId?.trim();
    const cleanUsername = username?.trim();
    const cleanUserId = userId?.trim();

    if (cleanUsernameOrId) {
      if (this.isUserId(cleanUsernameOrId)) {
        targetUserId = cleanUsernameOrId;
      } else {
        targetUsername = cleanUsernameOrId;
      }
    } else if (cleanUserId) {
      targetUserId = cleanUserId;
    } else if (cleanUsername) {
      targetUsername = cleanUsername;
    } else {
      throw new BadRequestException('É necessário fornecer username, userId ou usernameOrId');
    }

    try {
      const result = await this.discordService.sendMessage({
        username: targetUsername,
        userId: targetUserId,
        message,
      });

      return { 
        success: true, 
        message: 'Mensagem enviada com sucesso',
        username: result.username,
        userId: result.userId || targetUserId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('SERVER MEMBERS INTENT') || errorMessage.includes('username') || errorMessage.includes('não está disponível')) {
        throw new BadRequestException(errorMessage);
      }
      
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-bulk')
  @UseInterceptors(FileInterceptor('file'))
  async sendBulk(
    @UploadedFile() file: MulterFile,
    @Body() body: { message: string },
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (!body.message) {
      throw new BadRequestException('Mensagem é obrigatória');
    }

    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      throw new BadRequestException('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
    }

    const users = await this.fileProcessorService.processFile(file);
    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ user: string; error: string }>,
    };

    for (const user of users) {
      try {
        if (this.isUserId(user)) {
          await this.discordService.sendMessage({
            userId: user,
            message: body.message,
          });
        } else {
          await this.discordService.sendMessage({
            username: user,
            message: body.message,
          });
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          user,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    return {
      success: true,
      message: `Processamento concluído: ${results.success} enviadas, ${results.failed} falharam`,
      results,
    };
  }
}

