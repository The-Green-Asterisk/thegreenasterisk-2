import http from 'http';
import url from 'url';

export default class BaseController {
    static async readBody<T = any>(req: http.IncomingMessage, parse = true): Promise<T> {
        let body: any = [];
        return new Promise((resolve, reject) => {
            req.on('readable', () => {
                let i;
                while (null !== (i = req.read())) {
                    body.push(i);
                }
            });
            req.on('end', () => {
                body = Buffer.concat(body)
                if (parse){
                    body = body.toString();
                    try {
                        body = JSON.parse(body);
                    } catch {
                        reject('Invalid JSON');
                    }
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

    /**This function checks if there are any differences between obj and newObj,
     * and if so, it updates obj with the values from newObj. It returns true if
     * any changes were made, and false otherwise. 
     * opts:
     *      If onlyExistingKeys is true, it will only check keys that already exist in obj.
     *      If handleFalsy is true, it will update keys with falsy values. 
     * 
     * This is less robust than Object.assign, but it will tell you whether or
     * not you need to save changes, thus cutting down on unnecessary operations.
     */
    public static checkAndMakeChanges(obj: object, newObj: object, opts = {
        onlyExistingKeys: true,
        handleFalsy: false
    }): boolean {
        const { onlyExistingKeys, handleFalsy } = opts;
        let shouldSave = false;
        for (const key in newObj) {
            if ((!onlyExistingKeys || key in obj) && ((obj as any)[key] !== (newObj as any)[key])) {
                (obj as any)[key] = (newObj as any)[key];
                shouldSave = true;
            }
        }
        if (handleFalsy) {
            for (const key in obj) {
                if (!((newObj as any)[key])) {
                    (obj as any)[key] = (newObj as any)[key];
                    shouldSave = true;
                }
            }
        }
        return shouldSave;
    }
}