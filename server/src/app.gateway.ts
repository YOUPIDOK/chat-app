import {OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Socket} from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import {IMessage} from 'interface/message';

@WebSocketGateway({cors: true})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Socket;
  private clients: { client: Socket; username: string }[] = [];
  private messages: IMessage[] = [];
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  @SubscribeMessage('event-set-username')
  handleSetUsername(client: Socket, payload: string): void {
    const index = this.clients.findIndex(
        ({ client: _client }) => _client.id === client.id,
    );

    this.clients.splice(index, 1, { client, username: payload });
  }

  @SubscribeMessage('event-message')
  handleMessage(client: Socket, message): void | Error {
    message.clientId = client.id
    message.username = this.clients.find(c => c.client.id === client.id).username
    message.verified = null;
    message.id = uuidv4();
    message.translation = message.message;
    message.locale = null;
    message.timeSent = new Date().toISOString();

    console.log(`${message.username} sent: ${JSON.stringify(message.message)}`,);

    this.messages.push(message);

    this.server.emit('event-message', message);
  }

  @SubscribeMessage('event-translate')
  async handleTranslate(client: Socket, payload): Promise<void | Error> {

    const messageIdx = this.messages.findIndex((m) => {
      return m.id === payload.messageId
    });

    const message = this.messages[messageIdx];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: "Input : JSON {message: string, locale: string}. You must translate the key message into the locale provided. You just return the translated message. Don't add \" around the translation"
        },
        {
          role: 'user',
          content: JSON.stringify({message: message.message, locale: payload.locale}),
        },
      ],
    });

    const translation = response.choices[0].message.content.replace(/^"|"$/g, '');

    console.log('"' + message.message + '" translated to "' + payload.local + '" : ' + translation);

    message.translation = translation;
    message.locale = payload.locale

    this.messages[messageIdx] = message;

    this.server.emit('event-translate', message);
  }

  @SubscribeMessage('event-transcript')
  async handleTranscript(client: Socket, payload): Promise<void | Error> {
    const byteCharacters = atob(payload.data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });

    const file = new File([blob], payload.name, { type: 'audio/mpeg' });

    const transcription = await this.openai.audio.transcriptions.create(
        {
          model: 'whisper-1',
          file: file,
          response_format: 'text'
        }
    );

    this.server.to(client.id).emit('event-transcript', transcription);
  }


  @SubscribeMessage('event-suggest')
  async handleSuggest(client: Socket): Promise<void | Error> {
    const context = {
      lastMessages: [],
      clientId: client.id
    };

    this.messages.slice(-10).forEach(message => {
      context.lastMessages.push({
        clientId: message.clientId,
        message: message.message,
        timeSent: message.timeSent
      })
    });

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: "Output JSON : {suggestion: string}.Based on the last messages key (lastMessages), generate the best next message to continue the conversation. I want no message repetition. If lastMessages is empty, suggest a message to start a new conversation like human in french. You must answer only the suggestion message and nothing else."
        },
        {
          role: 'user',
          content: JSON.stringify(context),
        },
      ],
    });

    const suggestion = JSON.parse(response.choices[0].message.content).suggestion;

    console.log(`suggest "${suggestion}" to ${this.clients.find(c => c.client.id === client.id).username}`)

    this.server.to(client.id).emit('event-suggest', suggestion);
  }

  @SubscribeMessage('event-verify')
  async handleVerify(client: Socket, payload): Promise<void | Error> {
    const messageIdx = this.messages.findIndex(message => {
      return message.id === payload.messageId
    });

    const message = this.messages[messageIdx];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: "Input : JSON {message: string}. Output : JSON {verified: bool}.checks whether the information in the message key is true and returns the completed JSON."
        },
        {
          role: 'user',
          content: JSON.stringify({message: message.message}),
        },
      ],
    });

    message.verified = JSON.parse(response.choices[0].message.content).verified

    this.messages[messageIdx] = message;

    this.server.emit('event-verify', message);
  }

  handleConnection(client: Socket): void {
    this.clients.push({ client, username: '' });

    console.log(`client ${client.id} connected`);

    client.emit('event-connection', {
      clientId: client.id,
      oldMessages: this.messages
    });
  }

  handleDisconnect(client: Socket): void {
    this.clients = this.clients.filter(
        ({ client: _client }) => _client.id !== client.id,
    );

    console.log(`client ${client.id} disconnected`);
  }
}