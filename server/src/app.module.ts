import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {AppGateway} from "./app.gateway";

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
