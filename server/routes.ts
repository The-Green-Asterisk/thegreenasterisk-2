import Controller from 'controllers/baseController';
import http from 'http';

export default class Routes {
    private url: string;
    constructor(
        public req: http.IncomingMessage, 
        public res: http.ServerResponse
    ) {
        this.url = req.url?.replace(/\/data\//, '/') ?? '';
        this.url = this.url.split('?')[0];
    }

    @Method('GET')
    private ['/get-recipes'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return Controller.getData(req, res)
    }

    get response(): ResponsePromise {
        const response = this[this.url] as RouteFunction
        if (typeof response !== 'function') {
            return Promise.resolve({
                response: '404 Not Found',
                header: 'text/plain',
                status: 404
            });
        }
        return response(this.req, this.res);
    }
    [key: string]: string | http.IncomingMessage | http.ServerResponse | ResponsePromise | RouteFunction;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RouteFunction = (req: http.IncomingMessage, res: http.ServerResponse) => ResponsePromise;
type ResponsePromise = Promise<{
    response: any;
    header: string;
    status: number;
}>;

function Method(method: Method) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod: RouteFunction = descriptor.value;
        descriptor.value = function(req: http.IncomingMessage, res: http.ServerResponse) {
            if (typeof originalMethod !== 'function') {
                return {
                    response: '404 Not Found',
                    header: 'text/plain',
                    status: 404
                }
            } else if (req.method !== method) {
                return {
                    response: '405 Method Not Allowed',
                    header: 'text/plain',
                    status: 405
                }
            } else {
                return originalMethod.call(this, req, res);
            }
        }
    }
}