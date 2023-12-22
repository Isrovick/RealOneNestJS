import {BadRequestException, Injectable} from '@nestjs/common';
import { simpleParser } from 'mailparser';
@Injectable()
export class ProcessorService {
    isUrl(str: string): boolean {
        if (!str) throw new BadRequestException('File path or url is required');
        return (str.startsWith('http://') || str.startsWith('https://' ))
    }

    isFilePath(str: string): boolean {
        return !this.isUrl(str);
    }

    async parseEmail(filePath) {
        const fs = require('fs');
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
