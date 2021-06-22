import { HttpService, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Joke, JokeDocument } from './JokesSchema'
import { CreateJokeDto } from './Joke.dto'
const TelegramBot = require('node-telegram-bot-api');
const token = '1771989856:AAFBw2N4TY_K5tVfkAbn-p5EI4_lfBauzlM'//move to config
const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  {command: '/start', description: 'Start app'},
  {command: '/randomjoke', description: 'Show random joke'},
  {command: '/randomjokebycategory', description: 'Show ramdom jokes by category'},
  {command: '/historyyourjokes', description: 'history jokes'}
])
//move to another file
const ButtonOptions =  {
  reply_markup: JSON.stringify({
      inline_keyboard: [
          [{text: 'random joke', callback_data: '/randomjoke'}],
          [{text: 'random joke by category', callback_data: '/randomjokebycategory'}],
          [{text: 'history', callback_data: '/historyyourjokes'}],
      ]
  })
}

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
    //////
    bot.on('message', async (msg) => {
      if(msg.text === '/start'){
        return await bot.sendMessage(msg.chat.id, 'Welcome', ButtonOptions)
      }
      return bot.sendMessage(msg.chat.id,'i don`t understund you', ButtonOptions)
    })

    //////
    bot.on('callback_query', async msg => {

      if(msg.data === '/randomjoke'){
        await this.httpService.get('https://api.chucknorris.io/jokes/random').subscribe(async (response) => {
          const data: CreateJokeDto = response.data
          data.TelegramUserID = msg.from.id
          
          await new this.jokeModel(data).save();
          return bot.sendMessage(msg.message.chat.id, data.value, ButtonOptions)
        });
        return
      }
      ///////
      //history
      if(msg.data === '/historyyourjokes'){
        const data = await this.jokeModel.find({TelegramUserID: msg.from.id}).limit(10).sort({_id: -1})
        let ArrayHistory = '';
        for (let i = 0; i < data.length; i++){
          ArrayHistory = ArrayHistory + `${i + 1} ` + data[i].value + '\n'
        }
        return await bot.sendMessage(msg.message.chat.id, ArrayHistory.toString(), ButtonOptions)
      }

      // generate buttons with categories
      if(msg.data === '/randomjokebycategory'){
        await this.httpService.get('https://api.chucknorris.io/jokes/categories')
        .subscribe((response) => {
          const data = response.data
          const inline_keyboard = []
  
          for (let i = 0; i < data.length; i++){
            inline_keyboard.push([{text: data[i], callback_data: `/${data[i]}`}])
          }
          const CategoryOptions = {
          reply_markup: JSON.stringify({
            inline_keyboard
          })
          }
          return bot.sendMessage(msg.message.chat.id, "Choose category", CategoryOptions)
        });
        return
      }
      //////
      // work with categories
      try {
        await this.httpService.get('https://api.chucknorris.io/jokes/categories')
        .subscribe(async (response) => {
          const data = response.data
          const str = msg.data.slice(1)
          if(data.includes(str)){
            await this.httpService.get(`https://api.chucknorris.io/jokes/random?category=${str}`)
            .subscribe(async response => {
              const data: CreateJokeDto = response.data
              data.TelegramUserID = msg.from.id
              await new this.jokeModel(data).save();
              return bot.sendMessage(msg.message.chat.id, data.value, ButtonOptions)
            });
            return
          }
          return
        });
        return
      } catch (error) {
        console.log(error)
      }
          
      return bot.sendMessage(msg.message.chat.id,'i don`t understund you', ButtonOptions)
    })
  }
}