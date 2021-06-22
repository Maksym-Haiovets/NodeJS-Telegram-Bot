import { HttpService, Injectable, OnModuleInit } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const TelegramBot = require('node-telegram-bot-api');
const token = '1771989856:AAFBw2N4TY_K5tVfkAbn-p5EI4_lfBauzlM'//move to config
const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  {command: '/start', description: 'Start app'},
  {command: '/randomjoke', description: 'Show random joke'},
  {command: '/randomjokebycategory', description: 'Show ramdom jokes by category'},
  {command: '/history', description: 'history jokes'}
])
//move to another file
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

  /*callHttp() {
    return this.http.get(this.DATA_URL).pipe(
      map((axiosResponse: AxiosResponse) => {
        retrun axiosResponse.data;
      })
    );*/

  async getCategory (){
    return await this.httpService.get('https://api.chucknorris.io/jokes/categories')
    .pipe(map((axiosResponse: AxiosResponse) => {
      return axiosResponse.data;
    }))
  }

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
        await this.httpService.get('https://api.chucknorris.io/jokes/random').subscribe((response) => {
          const data = response.data
          return bot.sendMessage(msg.message.chat.id, data.value, ButtonOptions)
        });
        return
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
            .subscribe(response => {
              const data = response.data
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
      //////////
      //history
      if(msg.text === '/history'){
        //have to create collection for save jokes
        return await bot.sendMessage(msg.chat.id, 'history')
      }      
      return bot.sendMessage(msg.message.chat.id,'i don`t understund you', ButtonOptions)
    })
  }
}