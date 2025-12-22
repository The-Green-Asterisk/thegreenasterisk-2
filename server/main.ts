import 'module-alias/register';
import 'reflect-metadata';

import fs from 'fs';
import http from 'http';
import path from 'path';

import Routes from './routes';
import SessionController from './controllers/sessionController';
import cache from './cache';

if (!process.env.PORT) require('dotenv').config();

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, headers } = req;
    let { url } = req;
    const sessionId = (headers['user-agent'] ?? '') + (headers['x-forwarded-for'] ?? '');
    const sessionKey = headers['authorization'];
    if (sessionKey && !Array.isArray(sessionKey)) new SessionController(sessionKey);
    
    if (method !== 'GET') {
        let valid = cache.get('csrf-token-' + sessionId) === headers['csrf-token'];
        if (!valid) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('403 Forbidden');
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

});
const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || '0.0.0.0';
const reloadPort = process.env.RELOAD_PORT;
server.listen(port, host, () => {
    console.log(`Static server started on http://${host}:${port}.`);
    if (process.env.ENV === 'development' && reloadPort !== undefined)
        console.log(`Live reload server started on http://${host}:${reloadPort}.`);
});

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