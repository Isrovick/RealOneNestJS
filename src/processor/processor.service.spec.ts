import { Test, TestingModule } from '@nestjs/testing';
import { ProcessorService } from './processor.service';
import { HttpModule } from '@nestjs/axios';

describe('ProcessorService', () => {
  let service: ProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ProcessorService],
    }).compile();

    service = module.get<ProcessorService>(ProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if string is a url', function () {
    const isUrl = service.isUrl('http://www.google.com/lol');
    expect(isUrl).toBe(true);
  });

  it('should return false if string is not a url', function () {
    const isUrl = service.isUrl('/home/user/file.txt');
    expect(isUrl).toBe(false);
  });

  it('should return true if string is a valid filePath', function () {
    const isFilePath = service.isFilePath('/home/user/file.txt');
    expect(isFilePath).toBe(true);
  });

  it('should return false if string is not a valid filePath', function () {
    const isFilePath = service.isFilePath('http://www.google.com/wow');
    expect(isFilePath).toBe(false);
  });
});

describe('ProcessorService parseEmail', () => {
  let service: ProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessorService],
    }).compile();

    service = module.get<ProcessorService>(ProcessorService);
  });

  it('should return parsed email', async function () {
    const cwd = process.cwd();
    const parsed = await service.parseEmail('./test/files/test.eml');
    expect(parsed).toBeDefined();
    expect(parsed.from.text).toBe(
      'Israel Morales <israel.morales.dev@gmail.com>',
    );
    expect(parsed.to.text).toBe('isrovick@gmail.com');
    expect(parsed.attachments.length).toBe(3);
  });

  it('should return all links', async function () {
    const parsed = await service.parseEmail('./test/files/test.eml');
    const links = service.getLinksFromHTML(parsed);
    expect(links.length).toBeGreaterThan(0);
  });

  // it('should return all jsons from links', async function () {
  //   const parsed = await service.parseEmail('./test/files/test.eml');
  //   const jsons = await service.getJSONFromLinks(parsed);
  //   expect(jsons.length).toBeGreaterThan(0);
  // });

  it('should return all jsons from html', async function () {
    const parsed = await service.parseEmail('./test/files/test.eml');
    const jsons = service.getJSONFromHTML(parsed);
    expect(jsons.length).toBeGreaterThan(0);
  });
});
