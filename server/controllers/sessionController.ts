import http from 'http';
import NodeCache, { Key } from 'node-cache';
import AppDataSource from 'services/database';
import { User } from 'services/database/entity/User';
import EmailService from 'services/email';
import BaseController from "./baseController";

export default class SessionController extends BaseController {
    public static sessionCache = new NodeCache();
    public static currentUser: User | undefined = undefined;
    constructor(sessionKey?: string) {
        super();
        if (sessionKey){
            SessionController.currentUser = SessionController.sessionCache.get<User>(sessionKey);
        } else {
            SessionController.currentUser = undefined;
        }
        if (!SessionController.currentUser)
            SessionController.sessionCache.flushAll();
    }

    public static async getDiscordCreds(req: http.IncomingMessage, res: http.ServerResponse) {
        if (!process.env.DISCORD_CLIENT_ID) {
            require('dotenv').config();
        }

        const { state, originatingUrl } = this.parseUrlQuery(req.url);
        this.sessionCache.set(state as Key, originatingUrl, 300);

        const data = {
            client_id: process.env.DISCORD_CLIENT_ID,
            redirect_url: process.env.LOGIN_REDIRECT_URL,
            scope: 'identify email'
        };

        return {
            response: JSON.stringify(data),
            header: 'application/json',
            status: 200
        }
    }

    public static async loginDiscord(req: http.IncomingMessage, res: http.ServerResponse) {
        const { code, state } = this.parseUrlQuery(req.url);
        let redirectUrl = this.sessionCache.get(state as Key) as string;
        this.sessionCache.del(state as Key);
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
                } as Record<string,string>)
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
                newUser.profilePicture = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

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
                existingUser.profilePicture = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
            }

            existingUser.username = userData.username;
            await userRepository.save(existingUser);

            return {
                response: 'Success',
                headerName: 'Location',
                header: `/start?url=${redirectUrl}&uid=${existingUser.id}`,
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

    public static logout() {
        if (this.currentUser) this.endSession(this.currentUser);
    }

    public static startSession(user: User) {
        const sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '%' + user.id;

        this.sessionCache.set(sessionKey, user, 3600);
        this.currentUser = user;
        return sessionKey;
    }

    public static endSession(user: User) {
        const sessionKey = this.sessionCache.keys().find(key => this.sessionCache.get(key) === user);
        if (sessionKey) this.sessionCache.del(sessionKey);
        this.currentUser = undefined;
    }

    public static get isAuth() {
        return !!this.sessionCache.keys().find(key => this.sessionCache.get<User>(key)?.id === this.currentUser?.id);
    }

    public static async startNewSession(req: http.IncomingMessage, res: http.ServerResponse) {
        const { uid } = this.parseUrlQuery(req.url);
        if (!uid || isNaN(Number(uid)) || Array.isArray(uid)) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: parseInt(uid) } });
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
            header: 'application/json',
            status: 200
        }
    }

    public static checkAuth() {
        const sessionKey = this.sessionCache.keys().find(key => this.sessionCache.get(key) === this.currentUser);
        return sessionKey ? this.sessionCache.has(sessionKey) : false;
    }

    public login() {
        // login logic here
    }

    public logout() {
        // logout logic here
    }
}