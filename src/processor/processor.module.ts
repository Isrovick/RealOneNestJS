import { Module } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { ProcessorController } from './processor.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProcessorController],
  providers: [ProcessorService],
})
export class ProcessorModule {}
