import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class BotServiceHelper {
    constructor( private httpService: HttpService ) {}

    async randomJoke () {
        const response = await this.httpService.get('https://api.chucknorris.io/jokes/random').toPromise()
        return response.data.value
    }

    async generateButtonsWithCategories () {
        const response = await this.httpService.get('https://api.chucknorris.io/jokes/categories').toPromise()
        const arrayCategories = response.data
        const inline_keyboard = []

        for (let i = 0; i < arrayCategories.length; i += 2){
            if(!arrayCategories[i + 1]){
              inline_keyboard.push([
                {text: arrayCategories[i], callback_data: `/${arrayCategories[i]}`}
              ])
              continue
            }
            inline_keyboard.push([
              {text: arrayCategories[i], callback_data: `/${arrayCategories[i]}`},
              {text: arrayCategories[i + 1], callback_data: `/${arrayCategories[i + 1]}`}
            ])
        }
        const CategoryOptions = {
            reply_markup: JSON.stringify({
              inline_keyboard
            })
        }
        return CategoryOptions
    }

    async randomJokeByChoseCategory (category) {
        const response = await this.httpService.get(`https://api.chucknorris.io/jokes/random?category=${category}`)
        .toPromise()
        return response.data.value
    }

    async historyYourJokes (jokes) {
        let ArrayHistory = '';
        //concatenate all jokes in once string for response
        for (let i = 0; i < jokes.length; i++){
          ArrayHistory = ArrayHistory + `${i + 1} ` + jokes[i].value + '\n'
        }
        return ArrayHistory.toString()
    }
}