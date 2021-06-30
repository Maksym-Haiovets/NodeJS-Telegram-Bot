import { HttpModule, Module } from '@nestjs/common';
import { BotService } from './Bot.service';
import { BotServiceHelper } from './Bot.service.helper'
import { MongooseModule } from '@nestjs/mongoose';
import { Joke, JokeSchema } from './JokesSchema';
import { URI } from './constants'

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(URI),
    MongooseModule.forFeature([{ name: Joke.name, schema: JokeSchema }])
  ],
  controllers: [],
  providers: [BotService, BotServiceHelper],
})
export class AppModule {}
