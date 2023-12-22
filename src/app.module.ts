import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessorModule } from './processor/processor.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ProcessorModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
