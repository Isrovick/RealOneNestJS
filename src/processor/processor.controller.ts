import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as process from 'process';

const renameFile = (req, file, callback) => {
  const name = file.originalname.split('.');
  const newName = `${name.shift()}-${Date.now()}.${name.pop()}`;
  callback(null, newName);
};

@Controller('processor')
export class ProcessorController {
  constructor(private readonly processorService: ProcessorService) {}
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
      storage: diskStorage({
        destination: `${process.cwd()}/tmp`,
        filename: renameFile,
      }),
    }),
  )
  async processEML(
    @Body() body,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
    },
  ): Promise<any> {
    const { filePath } = body;
    const _file = files?.file?.shift();

    return this.processorService.processEML(filePath, _file);
  }
}
