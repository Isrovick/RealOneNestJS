import { BadRequestException, Injectable } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
@Injectable()
export class ProcessorService {
  constructor(/*private readonly httpService: HttpService*/) {}
  async processEML(filePath: string): Promise<any> {
    if (!filePath)
      throw new BadRequestException('File path or url is required');
    let localFilePath;
    if (this.isFilePath(filePath)) localFilePath = this.writeFile(filePath);
    else if (this.isUrl(filePath)) localFilePath = this.writeUrl(filePath);

    if (!localFilePath) throw new Error('Unable to process email file');

    const parsed = await this.parseEmail(localFilePath);
    return this.getJSONs(parsed);
  }

  async writeFile(filePath: string): Promise<string> {
    const cwd = process.cwd();
    const localFilePath = `${cwd}/tmp/${Date.now()}.eml`;
    fs.copyFileSync(filePath, localFilePath);
    return localFilePath;
  }

  // async writeUrl(url: string): Promise<string> {
  // const cwd = process.cwd();
  // const localFilePath = `${cwd}/tmp/${Date.now()}.eml`;
  // const response = await this.httpService.axiosRef.get(url);
  //   await
  //
  //       return localFilePath;
  // }

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
    //jsons = [...jsons, ...(await this.getJSONFromLinks(parsed))];
    return jsons;
  }

  getJSONFromHTML(parsed) {
    const { text } = parsed;
    const regex = /\{[^}]*\}/g;
    const match = regex.exec(text);
    return match;
  }

  // async getJSONFromLinks(parsed) {
  //   const links = this.getLinksFromHTML(parsed);
  //
  //   return await Promise.all(
  //     links.map(async (link) => {
  //       const response = await this.httpService.axiosRef.get(link);
  //       const json = await response.data();
  //       return json;
  //     }),
  //   );
  // }

  getLinksFromHTML(parsed) {
    const { html } = parsed;
    const links = html.match(/(?<=")(https?:\/\/[^\s]+)(?=")/g);

    return links
      .filter((link) => /\.json$/g.test(link) || !/\.\w+$/g.test(link))
      .filter((link, index, self) => self.indexOf(link) === index);
  }

  isUrl(str: string): boolean {
    if (!str) throw new BadRequestException('File path or url is required');
    return str.startsWith('http://') || str.startsWith('https://');
  }

  isFilePath(str: string): boolean {
    return !this.isUrl(str);
  }

  async parseEmail(filePath) {
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
