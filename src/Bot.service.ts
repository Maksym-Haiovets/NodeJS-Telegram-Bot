import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Joke, JokeDocument } from './JokesSchema'
import { CreateJokeDto } from './Joke.dto'
import { token, ButtonOptions } from './constants'
import { BotServiceHelper } from './Bot.service.helper'

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  {command: '/start', description: 'Start app'},
  {command: '/randomjoke', description: 'Show random joke'},
  {command: '/generatebuttonscategories', description: 'Show categories'},
  {command: '/historyyourjokes', description: 'history your jokes'}
])

@Injectable()
 export class BotService implements OnModuleInit {
  constructor(
    private readonly botSrviceHelper: BotServiceHelper,
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
    

    bot.on('callback_query', async msg => {

      if(msg.data === '/randomjoke'){
        const joke = await this.botSrviceHelper.randomJoke()

        const data: CreateJokeDto = new CreateJokeDto()
        data.value = joke;
        data.TelegramUserID = msg.from.id
        await new this.jokeModel(data).save();

        return bot.sendMessage(msg.message.chat.id, joke + '\ntry again', ButtonOptions)
      }
      

      if(msg.data === '/generatebuttonscategories'){
        const CategoryOptions = await this.botSrviceHelper.generateButtonsWithCategories()//
        return bot.sendMessage(msg.message.chat.id, "Choose category", CategoryOptions)
      }
      

      if(msg.message.text === 'Choose category'){
        const joke = await this.botSrviceHelper.randomJokeByChoseCategory(msg.data.slice(1))

        const data: CreateJokeDto = new CreateJokeDto()
        data.value = joke;
        data.TelegramUserID = msg.from.id
        await new this.jokeModel(data).save();

        return bot.sendMessage(msg.message.chat.id, data.value + '\ntry again', ButtonOptions)
      }
      

      if(msg.data === '/historyyourjokes'){
        const jokes = await this.jokeModel.find({TelegramUserID: msg.from.id}).limit(10).sort({_id: -1})
        const ArrayHistory = await this.botSrviceHelper.historyYourJokes(jokes)

        return await bot.sendMessage(msg.message.chat.id, ArrayHistory, ButtonOptions)
      }
    })
  }
}