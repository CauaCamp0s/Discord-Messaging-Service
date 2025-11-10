// src/examples/discord-usage.example.ts

// Este arquivo contém exemplos de uso do DiscordService
// Não é necessário importar este arquivo no projeto

import { Injectable } from '@nestjs/common';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class ExemploService {
  constructor(private readonly discordService: DiscordService) {}

  // Exemplo 1: Enviar mensagem por username
  async exemplo1() {
    await this.discordService.sendMessage({
      username: 'NomeDoUsuario',
      message: 'Olá! Essa é uma mensagem automática.',
    });
  }

  // Exemplo 2: Enviar mensagem por userId
  async exemplo2() {
    await this.discordService.sendMessage({
      userId: '123456789012345678',
      message: 'Mensagem enviada por ID',
    });
  }

  // Exemplo 3: Enviar mensagem para um canal
  async exemplo3() {
    await this.discordService.sendMessage({
      channelId: '123456789012345678',
      message: 'Mensagem no canal',
    });
  }

  // Exemplo 4: Tratamento de erros
  async exemplo4() {
    try {
      await this.discordService.sendMessage({
        username: 'UsuarioInexistente',
        message: 'Teste',
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao enviar mensagem:', error.message);
        // Erro: Usuário 'UsuarioInexistente' não encontrado
        // ou: Usuário não aceita mensagens privadas ou bloqueou o bot
      }
    }
  }

  // Exemplo 5: Verificar se o bot está pronto
  async exemplo5() {
    if (this.discordService.isBotReady()) {
      await this.discordService.sendMessage({
        username: 'Usuario',
        message: 'Bot está online!',
      });
    } else {
      console.log('Aguardando bot ficar online...');
    }
  }
}

