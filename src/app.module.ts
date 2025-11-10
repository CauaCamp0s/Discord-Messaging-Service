import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { FileProcessorModule } from './file-processor/file-processor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DiscordModule,
    FileProcessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

