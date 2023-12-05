export interface IMessage {
  message: string;
  translation: string;
  clientId: string;
  username: string;
  timeSent: string;
  id: string;
  verified: boolean|null;
  locale: string|null
}