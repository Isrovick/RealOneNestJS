import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessorModule } from './processor/processor.module';

@Module({
  imports: [ProcessorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
