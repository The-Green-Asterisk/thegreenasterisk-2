import ProfileController from 'controllers/profileController';
import SessionController from 'controllers/sessionController';
import YouTubeVideoController from 'controllers/youTubeVideoController';
import http from 'http';
import EmailService from 'services/email';

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

    @Method('GET')
    private ['/profile'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return ProfileController.getUserProfile(req, res);
    }

    @Method('PUT')
    private ['/update-profile'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return ProfileController.updateUserProfile(req, res);
    }

    @Method('GET')
    private ['/get-youtube-videos'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return YouTubeVideoController.getVideos(req, res);
    }

    @Method('POST')
    private ['/save-youtube-video'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return YouTubeVideoController.saveVideo(req, res);
    }

    @Method('DELETE')
    private ['/remove-youtube-video'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return YouTubeVideoController.removeVideo(req, res);
    }

    @Method('GET')
    private ['/test-email'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
        return EmailService.sendEmail('live.remix@gmail.com', 'Test Email', 'This is a test email from The Green Asterisk.')
            .then((res) => ({
                response: JSON.stringify(res),
                header: 'application/json',
                status: 200
            }))
            .catch((error) => ({
                response: JSON.stringify('Error sending email: ' + error),
                header: 'application/json',
                status: 500
            }));
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