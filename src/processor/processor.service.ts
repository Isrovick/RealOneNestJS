import { BadRequestException, Injectable } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
@Injectable()
export class ProcessorService {
  constructor(private readonly httpService: HttpService) {}
  async processEML(filePath: string, file: Express.Multer.File): Promise<any> {
    let localFilePath;

    if (file) localFilePath = file.path;
    else if (filePath) {
      if (this.isFilePath(filePath)) localFilePath = filePath;
      else if (this.isUrl(filePath))
        localFilePath = await this.writeUrl(filePath);
    } else throw new BadRequestException('File, FilePath or url is required');

    const parsed = await this.parseEmail(localFilePath);
    return this.getJSONs(parsed);
  }

  async getJSONs(parsed) {
    const jsonAttachments = parsed.attachments.filter(
      (attachment) => attachment.contentType === 'application/json',
    );
    let jsons = [
      ...jsonAttachments.map((attachment) =>
        JSON.parse(attachment.content.toString()),
      ),
    ];
    jsons = [...jsons, ...this.getJSONFromHTML(parsed)];
    jsons = [...jsons, ...(await this.getJSONFromLinks(parsed))];
    return jsons;
  }

  async writeUrl(url: string): Promise<string> {
    const cwd = process.cwd();
    const localFilePath = `${cwd}/tmp/${Date.now()}.eml`;
    const response = await this.request(url);

    return new Promise((resolve, reject) => {
      fs.writeFile(localFilePath, response, (err) => {
        if (err) reject(err);
        resolve(localFilePath);
      });
    });
  }

  getJSONFromHTML(parsed) {
    const { text } = parsed;
    const regex = /\{[^}]*\}/g;
    const match = regex.exec(text);
    return match || [];
  }

  async getJSONFromLinks(parsed) {
    const links = this.getLinksFromHTML(parsed);

    return (
      (await Promise.all(
        links.map(async (link) => {
          return await this.request(link);
        }),
      )) || []
    );
  }

  async request(url: string) {
    const response = await this.httpService.axiosRef.get(url);
    if (response.status !== 200 || !response?.data)
      return {
        error: `Unable to get response from url ${url}, status: ${response.status}`,
      };
    return await response.data;
  }

  getLinksFromHTML(parsed) {
    const { html, textAsHtml } = parsed;
    const links =
      typeof html == 'string'
        ? html?.match(/(?<=")(https?:\/\/[^\s]+)(?=")/g)
        : textAsHtml?.match(/(?<=")(https?:\/\/[^\s]+)(?=")/g) || [];

    return links?.length
      ? links
          .filter((link) => /\.json$/g.test(link) || !/\.\w+$/g.test(link))
          .filter((link, index, self) => self.indexOf(link) === index)
      : [];
  }

  isUrl(str: string): boolean {
    if (!str) throw new BadRequestException('File path or url is required');
    return str.startsWith('http://') || str.startsWith('https://');
  }

  isFilePath(str: string): boolean {
    return !this.isUrl(str);
  }

  async parseEmail(filePath) {
    if (!filePath) throw new BadRequestException('File path is required');
    const eml = fs.readFileSync(filePath, 'utf-8');
    try {
      const parsed = await simpleParser(eml);
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse .eml file: ${error.message}`);
    }
    return;
  }
}
