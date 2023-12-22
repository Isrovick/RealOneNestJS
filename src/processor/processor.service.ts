import {BadRequestException, Injectable} from '@nestjs/common';

@Injectable()
export class ProcessorService {
    isUrl(str: string): boolean {
        if (!str) throw new BadRequestException('File path or url is required');
        return (str.startsWith('http://') || str.startsWith('https://' ))
    }

    isFilePath(str: string): boolean {
        return !this.isUrl(str);
    }

    obtainJSONFromAttachment(attachment: any): any {
        const {data} = attachment;
        const {attachmentId, name, size, url} = data;
        return {attachmentId, name, size, url};
    }

}
