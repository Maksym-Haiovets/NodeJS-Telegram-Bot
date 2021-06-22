import { HttpModule, Module } from '@nestjs/common';
import { BotService } from './app.service';
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
  providers: [BotService],
})
export class AppModule {}
