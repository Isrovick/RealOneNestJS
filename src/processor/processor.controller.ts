import { Controller } from '@nestjs/common';
import { ProcessorService } from './processor.service';

@Controller('processor')
export class ProcessorController {
  constructor(private readonly processorService: ProcessorService) {}
}
