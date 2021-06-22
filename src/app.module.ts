import { HttpModule, HttpService, Module } from '@nestjs/common';
import { BotService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Joke, JokeSchema } from './JokesSchema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot('mongodb+srv://admin:admin@cluster0.vxapw.mongodb.net/DB?retryWrites=true&w=majority'),
    MongooseModule.forFeature([{ name: Joke.name, schema: JokeSchema }])
  ],
  controllers: [],
  providers: [BotService],
})
export class AppModule {}
