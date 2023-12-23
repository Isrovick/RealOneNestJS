import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as pkg from '../package.json';
import * as fs from 'fs';
const tmpPath = `${process.cwd()}/tmp`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);

  if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);

  console.log(`------------------- RealOne Designli  ----------------------`);
  console.log(`API service (${pkg.name}:v${pkg.version})`);
  console.log(`Running on: ${await app.getUrl()}`);
  console.log(`------------------------------------------------------------`);
}
bootstrap();
