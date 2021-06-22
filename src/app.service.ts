import { HttpService, Injectable, OnModuleInit } from '@nestjs/common';

const TelegramBot = require('node-telegram-bot-api');
const token = '1771989856:AAFBw2N4TY_K5tVfkAbn-p5EI4_lfBauzlM'//move to config
const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  {command: '/start', description: 'Start app'},
  {command: '/randomjoke', description: 'Show random joke'},
  {command: '/randomjokebycategory', description: 'Show ramdom jokes by category'},
  {command: '/history', description: 'history jokes'}
])
const ButtonOptions =  {
  reply_markup: JSON.stringify({
      inline_keyboard: [
          [{text: 'random joke', callback_data: '/randomjoke'}],
          [{text: 'random joke by category', callback_data: '/randomjokebycategory'}],
          [{text: 'history', callback_data: '/history'}],
      ]
  })
}
@Injectable()
 export class BotService implements OnModuleInit {
  constructor(private httpService: HttpService) {}

  onModuleInit() {
    this.botMessage();
  }
  botMessage() {

    bot.on('message', async (msg) => {
      //console.log(msg)//
      if(msg.text === '/start'){
        return await bot.sendMessage(msg.chat.id, 'Welcome', ButtonOptions)
      }

      //history
      if(msg.text === '/history'){
        //have to create collection for save jokes
        return await bot.sendMessage(msg.chat.id, 'history')
      }
    })
    bot.on('callback_query', async msg => {
      if(msg.data === '/randomjoke'){
        await this.httpService.get('https://api.chucknorris.io/jokes/random').subscribe((response) => {
          const data = response.data
          return bot.sendMessage(msg.message.chat.id, data.value)
        });
      }
      
      //random joke by category
      if(msg.text === '/randomjokebycategory'){

        return  await bot.sendMessage(msg.message.chat.id, 'randomJokeBYcategory')
      }
    })
  }
}