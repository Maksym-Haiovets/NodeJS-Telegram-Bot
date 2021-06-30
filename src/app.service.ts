import { HttpService, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Joke, JokeDocument } from './JokesSchema'
import { CreateJokeDto } from './Joke.dto'
import { token, ButtonOptions } from './constants'

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  {command: '/start', description: 'Start app'},
  {command: '/randomjoke', description: 'Show random joke'},
  {command: '/randomjokebycategory', description: 'Show ramdom jokes by category'},
  {command: '/historyyourjokes', description: 'history jokes'}
])

@Injectable()
 export class BotService implements OnModuleInit {
  constructor(
    private httpService: HttpService,
    @InjectModel(Joke.name) private jokeModel: Model<JokeDocument>,
  ) {}

  onModuleInit() {
    this.botMessage();
  }
  botMessage() {
    bot.on('message', async (msg) => {
      if(msg.text === '/start'){
        return await bot.sendMessage(msg.chat.id, 'Welcome, I can generate random jokes of Chuck Norris', ButtonOptions)
      }
      return bot.sendMessage(msg.chat.id,'I don`t understand you', ButtonOptions)
    })

    //////
    bot.on('callback_query', async msg => {
      // generate random joke
      if(msg.data === '/randomjoke'){
        await this.httpService.get('https://api.chucknorris.io/jokes/random')
        .subscribe(async (response) => {
          //save joke in DB
          const joke: CreateJokeDto = response.data
          joke.TelegramUserID = msg.from.id
          await new this.jokeModel(joke).save();

          return bot.sendMessage(msg.message.chat.id, joke.value + '\ntry again', ButtonOptions)
        });
        return
      }
      /////////////////////
      // generate buttons with categories
      if(msg.data === '/randomjokebycategory'){
        await this.httpService.get('https://api.chucknorris.io/jokes/categories')
        .subscribe((response) => {
          const data = response.data// get array of all categories
          const inline_keyboard = []
  
          for (let i = 0; i < data.length; i += 2){
            if(!data[i + 1]){
              inline_keyboard.push([
                {text: data[i], callback_data: `/${data[i]}`}
              ])
              return
            }
            inline_keyboard.push([
              {text: data[i], callback_data: `/${data[i]}`},
              {text: data[i + 1], callback_data: `/${data[i + 1]}`}
            ])
          }
          // make buttons
          const CategoryOptions = {
          reply_markup: JSON.stringify({
            inline_keyboard
          })
          }
          return bot.sendMessage(msg.message.chat.id, "Choose category", CategoryOptions)
        });
        return
      }
      //////////////////
      // generate random joke by chose category
      if(msg.message.text === 'Choose category'){
        await this.httpService.get(`https://api.chucknorris.io/jokes/random?category=${msg.data.slice(1)}`)// get random joke by category
          .subscribe(async response => {
            //save joke in DB
            const data: CreateJokeDto = response.data
            data.TelegramUserID = msg.from.id
            await new this.jokeModel(data).save();

            return bot.sendMessage(msg.message.chat.id, data.value + '\ntry again', ButtonOptions)
        });
        return
      }
      /////////////////////
      //history, show last 10 jokes
      if(msg.data === '/historyyourjokes'){
        const jokes = await this.jokeModel.find({TelegramUserID: msg.from.id}).limit(10).sort({_id: -1})

        let ArrayHistory = '';
        //concatenate all jokes in once string for response
        for (let i = 0; i < jokes.length; i++){
          ArrayHistory = ArrayHistory + `${i + 1} ` + jokes[i].value + '\n'
        }
        return await bot.sendMessage(msg.message.chat.id, ArrayHistory.toString(), ButtonOptions)
      }

      return bot.sendMessage(msg.message.chat.id,'I don`t understund you', ButtonOptions)
    })
  }
}