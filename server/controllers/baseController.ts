import http from 'http';
import url from 'url';

export default class BaseController {
    static async readBody<T = any>(req: http.IncomingMessage): Promise<T> {
        let body: any = [];
        return new Promise((resolve, reject) => {
            req.on('readable', () => {
                let i;
                while (null !== (i = req.read())) {
                    body.push(i);
                }
            });
            req.on('end', () => {
                body = Buffer.concat(body).toString();
                try {
                    body = JSON.parse(body);
                } catch {
                    reject('Invalid JSON');
                }
                resolve(body as T);
            });
        });
    }

    static parseUrlQuery(incommingUrl?: string) {
        const parsedUrl = url.parse(incommingUrl ?? '', true);
        return parsedUrl.query;
    }

    static async getData(req: http.IncomingMessage, res: http.ServerResponse) {
        return Promise.resolve({
            response: 'Data Got!',
            header: 'text/plain',
            status: 200
        });
    }
}