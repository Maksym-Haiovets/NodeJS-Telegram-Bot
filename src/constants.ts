const UserDB = 'admin'
const DB = 'DB'
export const URI = `mongodb+srv://admin:${UserDB}@cluster0.vxapw.mongodb.net/${DB}?retryWrites=true&w=majority`

export const token = '1771989856:AAFBw2N4TY_K5tVfkAbn-p5EI4_lfBauzlM'
export const ButtonOptions =  {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'random joke', callback_data: '/randomjoke'}],
            [{text: 'random joke by category', callback_data: '/randomjokebycategory'}],
            [{text: 'history', callback_data: '/historyyourjokes'}],
        ]
    })
  }