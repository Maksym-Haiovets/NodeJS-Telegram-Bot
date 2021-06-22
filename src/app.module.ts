import { HttpModule, HttpService, Module } from '@nestjs/common';
import { BotService } from './app.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [BotService],
})
export class AppModule {}
