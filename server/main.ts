import 'module-alias/register';
import 'reflect-metadata';

import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';

import cache from './cache';
import Routes from './routes';
import BrowserSync from './services/browserSyncService';
import { initDatabase } from './services/database';

if (!process.env.PORT) require('dotenv').config();

function parseCookies(cookieHeader?: string): Record<string, string> {
    const list: Record<string, string> = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts[0]?.trim();
        if (name) {
            list[name] = decodeURIComponent(parts.slice(1).join('=').trim());
        }
    });
    return list;
}

function generateCsrfToken(): string {
    return 'csrf_' + crypto.randomBytes(24).toString('hex');
}

const makeServer = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, headers } = req;
    let { url } = req;

    const cookies = parseCookies(headers['cookie']);
    let csrfToken = cookies['csrf-token'];

    if (!csrfToken) {
        csrfToken = generateCsrfToken();
        cache.set('csrf-token-' + csrfToken, true, 86400);
        res.setHeader('Set-Cookie', `csrf-token=${csrfToken}; Path=/; SameSite=Lax`);
    }

    if (method !== 'GET') {
        const headerToken = headers['x-csrf-token'] as string | undefined;
        const valid = !!headerToken && (
            (!!csrfToken && headerToken === csrfToken) ||
            cache.get('csrf-token-' + headerToken) === true
        );
        if (!valid) {
            console.error(`Invalid CSRF token for ${method} ${url}`);
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('403 Forbidden');
            return;
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
            } catch (error) {
                console.error(`Error serving favicon: ${error}`);
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
            if (!csrfToken) {
                csrfToken = generateCsrfToken();
            }
            cache.set('csrf-token-' + csrfToken, true, 86400);
            res.setHeader('Set-Cookie', `csrf-token=${csrfToken}; Path=/; SameSite=Lax`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end(csrfToken);
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
                } catch (error) {
                    console.error(`Error serving storage file: ${error}`);
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
                    } catch (error) {
                        console.error(`Error serving main page: ${error}`);
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('404 Not Found');
                    }
                }

            }
            break;
    }
};

const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080');
const reloadPort = parseInt(process.env.RELOAD_PORT || '35729');
const isDev = process.env.ENV === 'development' && !!reloadPort;
const isBrowserSyncChild = process.env.BROWSER_SYNC_CHILD === 'true';

const startServer = async () => {
    if (isDev && !isBrowserSyncChild) {
        console.log('Starting browser-sync development runtime.');
        BrowserSync(port, host, reloadPort);
    } else {
        try {
            await initDatabase();
        } catch (error) {
            console.error('Failed to initialize database before starting server:', error);
            process.exit(1);
        }

        const server = http.createServer(makeServer);
        process.on('SIGINT', () => {
            console.log('Shutting down server...');
            server.close(() => {
                console.log('Server stopped.');
                process.exit(0);
            });
        });
        server.listen(port, host, () => {
            console.log(`Static server started on http://${host}:${port}.`);
        });
    }
};

startServer();

function findExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
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