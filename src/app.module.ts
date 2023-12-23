import { Module } from '@nestjs/common';
import { ProcessorModule } from './processor/processor.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ProcessorModule, HttpModule],
})
export class AppModule {}
