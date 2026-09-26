import { randomBytes } from 'crypto';
import http from 'http';
import { Key } from 'node-cache';
import AppDataSource from 'services/database';
import { User } from 'services/database/entity/User';
import EmailService from 'services/email';
import cache from '../cache';
import BaseController from "./baseController";

export default class SessionController extends BaseController {
    /**
     * Retrieves the authorization session key from the request header.
     */
    public static getSessionKey(req: http.IncomingMessage): string | undefined {
        const auth = req.headers['authorization'];
        return typeof auth === 'string' && auth.length > 0 ? auth : undefined;
    }

    /**
     * Resolves the authenticated user scoped to the current request.
     */
    public static getUser(req: http.IncomingMessage): User | undefined {
        const reqWithUser = req as http.IncomingMessage & { currentUser?: User };
        if (reqWithUser.currentUser !== undefined) {
            return reqWithUser.currentUser;
        }

        const sessionKey = this.getSessionKey(req);
        if (!sessionKey) return undefined;

        const user = cache.get<User>(sessionKey);
        reqWithUser.currentUser = user;
        return user;
    }

    public static async getDiscordCreds(req: http.IncomingMessage, res: http.ServerResponse) {
        if (!process.env.DISCORD_CLIENT_ID) {
            require('dotenv').config();
        }

        const { state, originatingUrl } = this.parseUrlQuery(req.url);
        cache.set(state as Key, originatingUrl, 300);

        const data = {
            client_id: process.env.DISCORD_CLIENT_ID,
            redirect_url: process.env.LOGIN_REDIRECT_URL,
            scope: 'identify email'
        };

        return {
            response: JSON.stringify(data),
            status: 200
        }
    }

    public static async loginDiscord(req: http.IncomingMessage, res: http.ServerResponse) {
        const { code, state } = this.parseUrlQuery(req.url);
        let redirectUrl = cache.get(state as Key) as string;
        cache.del(state as Key);
        const userRepository = AppDataSource.getRepository(User);

        if (!code) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }

        try {
            const access_token = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    code,
                    redirect_uri: process.env.LOGIN_REDIRECT_URL,
                    grant_type: 'authorization_code'
                } as Record<string, string>)
            }).then((response) => response.json()).then((res) => {
                if (res.error) {
                    throw new Error(res.error_description);
                }
                return res.access_token;
            });


            const userData = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                },
            }).then((response) => response.json()).then((res) => {
                if (res.error) {
                    throw new Error(res.error_description);
                }
                return res;
            });

            let existingUser = await userRepository.findOne({ where: { discord_id: userData.id } });

            if (!existingUser) {
                let newUser = new User();
                newUser.discord_id = userData.id;
                newUser.username = userData.username;
                newUser.password = '';
                newUser.firstName = '';
                newUser.lastName = '';
                newUser.email = userData.email || '';
                newUser.age = 0;
                newUser.isAdmin = false;
                newUser.profilePicture = userData.avatar
                    ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar ?? ''}.png`
                    : 'https://cdn.discordapp.com/embed/avatars/0.png';

                redirectUrl = '/profile';

                await userRepository.save(newUser);
                EmailService.sendEmail(
                    'steve@mail.thegreenasterisk.com',
                    'We have a new user!',
                    `New user: ${userData.username}, Email: ${userData.email}`
                );
                EmailService.sendEmail(
                    userData.email,
                    'Welcome to The Green Asterisk',
                    `Hello ${userData.username}! Welcome to The Green Asterisk! Feel free to email info@mail.thegreenasterisk.com if you have any questions or concerns.`
                );
                existingUser = newUser;
            } else {
                const newPfp = userData.avatar
                    ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
                    : 'https://cdn.discordapp.com/embed/avatars/0.png';

                let shouldSave = this.checkAndMakeChanges(existingUser, {
                    username: userData.username,
                    email: userData.email,
                    profilePicture: newPfp
                });
                if (shouldSave) await userRepository.save(existingUser);
            }

            const authTicket = 'ticket_' + randomBytes(32).toString('hex');
            cache.set('auth-ticket-' + authTicket, existingUser.id, 60);

            return {
                response: 'Success',
                headerName: 'Location',
                header: `/start?url=${encodeURIComponent(redirectUrl ?? '/')}&ticket=${authTicket}`,
                status: 301
            }
        } catch (error) {
            return {
                response: '500 Internal Server Error ' + error,
                header: 'text/plain',
                status: 500
            }
        }
    }

    public static logout(req?: http.IncomingMessage) {
        if (req) {
            const sessionKey = this.getSessionKey(req);
            if (sessionKey) cache.del(sessionKey);
            delete (req as any).currentUser;
        }
    }

    public static startSession(user: User): string {
        const sessionKey = randomBytes(32).toString('hex') + '%' + user.id;

        cache.set(sessionKey, user, 7776000); // three months
        return sessionKey;
    }

    public static endSession(userOrKey: User | string) {
        if (typeof userOrKey === 'string') {
            cache.del(userOrKey);
        } else {
            const sessionKey = cache.keys().find(key => cache.get<User>(key)?.id === userOrKey.id);
            if (sessionKey) cache.del(sessionKey);
        }
    }

    public static checkAuth(req?: http.IncomingMessage): boolean {
        if (!req) return false;
        const sessionKey = this.getSessionKey(req);
        return !!sessionKey && cache.has(sessionKey);
    }

    public static async startNewSession(req: http.IncomingMessage, res: http.ServerResponse) {
        const { ticket } = this.parseUrlQuery(req.url);
        if (!ticket || typeof ticket !== 'string') {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }

        const ticketKey = 'auth-ticket-' + ticket;
        const userId = cache.get<number>(ticketKey);
        if (!userId) {
            return {
                response: '401 Unauthorized',
                header: 'text/plain',
                status: 401
            }
        }
        cache.del(ticketKey);

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return {
                response: '404 Not Found',
                header: 'text/plain',
                status: 404
            }
        }

        const sessionKey = this.startSession(user);

        res.setHeader('Authorization', sessionKey);
        return {
            response: JSON.stringify(user),
            status: 200
        }
    }

    public login() {
        // login logic here
    }

    public logout() {
        // logout logic here
    }
}