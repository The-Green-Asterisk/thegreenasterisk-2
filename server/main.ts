import 'module-alias/register';
import 'reflect-metadata';

import fs from 'fs';
import http from 'http';
import path from 'path';

import { User } from 'services/database/entity/User';
import cache from './cache';
import SessionController from './controllers/sessionController';
import Routes from './routes';
import BrowserSync from './services/browserSyncService';

if (!process.env.PORT) require('dotenv').config();

const makeServer = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, headers } = req;
    let { url } = req;
    const sessionId = (headers['user-agent'] ?? '') + (headers['x-forwarded-for'] ?? '');
    const sessionKey = headers['authorization'];
    const userCookie = (headers['cookie'] as string | undefined)?.split(';').find(f => f.startsWith(' currentUser='));
    const currentUser = userCookie ? JSON.parse(userCookie.slice(' currentUser='.length) || '{}') as User : undefined;
    if (sessionKey && !Array.isArray(sessionKey)) new SessionController(sessionKey, currentUser);
    
    if (method !== 'GET') {
        let valid = cache.get('csrf-token-' + sessionId) === headers['x-csrf-token'];
        if (!valid) {
            console.error(`Invalid CSRF token for ${method} ${url}`);
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('403 Forbidden');
            return;
        } else {
            cache.del('csrf-token-' + sessionId);
        }
    }

    switch (url) {
        case '/favicon.ico':
            if (method !== 'GET') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'text/plain');
                res.end('405 Method Not Allowed');
                break;
            }
            try {
                const favicon = fs.readFileSync(path.join(__dirname, '..', '..', 'www', 'storage', 'images', 'favicon.png'));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'image/png');
                res.end(favicon);
            } catch {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('404 Not Found');
            }
            break;
        case '/csrf-token':
            if (method !== 'GET') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'text/plain');
                res.end('405 Method Not Allowed');
                break;
            }
            const token = Math.random().toString(36).substring(2);
            cache.set('csrf-token-' + sessionId, token);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end(token);
            break;
        default:
            if (url?.startsWith('/views/') && headers['x-requested-with'] !== 'Elemental') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('403 Forbidden');
            } else if (url?.startsWith('/storage/')) {
                try {
                    const storage = path.join(__dirname, '..', '..', 'www');
                    const file = fs.readFileSync(path.join(storage, url));
                    res.statusCode = 200;
                    res.setHeader('Content-Type', findContentType(findExtension(url)));
                    res.end(file);
                } catch {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('404 Not Found');
                }
            } else if (url?.startsWith('/data/')) {
                const { response, headerName, header, status } = await new Routes(req, res).response;
                res.statusCode = status;
                res.setHeader(headerName ?? 'Content-Type', header ?? 'application/json');
                res.end(response);
            } else {
                const www = path.join(__dirname, '..', '..', 'www');

                if (url?.endsWith('/')) {
                    url = url + 'index.html';
                } else if (url !== undefined && findExtension(url) === url) {
                    url = url + '/index.html';
                }

                if (url === undefined) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('404 Not Found');
                } else {
                    let mainPage: string;
                    switch (findExtension(url)) {
                        case 'html':
                            mainPage = '/index.html';
                            break;
                        case 'css':
                            mainPage = '/main.css';
                            break;
                        case 'js':
                            mainPage = '/main.js';
                            break;
                        default:
                            mainPage = '/index.html';
                            break;
                    }
                    try {
                        const file = fs.readFileSync(path.join(www, url.startsWith('/views') ? url : mainPage));
                        res.statusCode = 200;
                        res.setHeader('Content-Type', findContentType(findExtension(url)));
                        res.end(file);
                    } catch {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('404 Not Found');
                    }
                }

            }
            break;
    }
};

const server = http.createServer(makeServer);
const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080');
const reloadPort = parseInt(process.env.RELOAD_PORT || '35729');
const isDev = process.env.ENV === 'development' && !!reloadPort;
const isBrowserSyncChild = process.env.BROWSER_SYNC_CHILD === 'true';
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });
});
if (isDev && !isBrowserSyncChild) {
    console.log('Starting browser-sync development runtime.');
    BrowserSync(port, host, reloadPort);
} else {
    server.listen(port, host, () => {
        console.log(`Static server started on http://${host}:${port}.`);
    });
}

function findExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}

function findContentType(extension: string): string {
    switch (extension) {
        case 'html':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'text/javascript';
        case 'json':
            return 'application/json';
        case 'png':
            return 'image/png';
        case 'jpg':
            return 'image/jpg';
        case 'txt':
            return 'text/plain';
        default:
            return 'application/octet-stream';
    }
}