import SessionController from 'controllers/sessionController';
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
    private ['/get-discord-creds'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return SessionController.getDiscordCreds(req, res);
    }

    @Method('GET')
    private ['/auth-redirect'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return SessionController.loginDiscord(req, res);
    }

    @Method('GET')
    private ['/check-auth'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        const isAuth = SessionController.checkAuth();
        return Promise.resolve({
            response: isAuth.toString(),
            header: 'application/json',
            status: 200
        });
    }

    @Method('GET')
    private ['/start'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return SessionController.startNewSession(req, res);
    }

    @Method('GET')
    private ['/logout'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        SessionController.logout();
        return Promise.resolve({
            response: JSON.stringify('Logged out'),
            header: 'text/plain',
            status: 200
        });
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
    headerName?: string | undefined;
    header?: string | undefined;
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