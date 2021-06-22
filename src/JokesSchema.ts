import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JokeDocument = Joke & Document;

@Schema()
export class Joke {
    @Prop()
    value: string;
    @Prop()
    TelegramUserID: string;
}

export const JokeSchema = SchemaFactory.createForClass(Joke);