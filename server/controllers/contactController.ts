import http from "http";
import EmailService from "services/email";
import cache from "../cache";
import BaseController from "./baseController";

const CONTACT_EMAIL = 'info@mail.thegreenasterisk.com';
// Messages allowed per visitor in each window
const LIMIT = 3;
const WINDOW_SECONDS = 10 * 60;

type ContactBody = { name?: unknown, email?: unknown, message?: unknown, website?: unknown };

export default class ContactController extends BaseController {

    public static async sendContact(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody<ContactBody>(req);

            // People never see the website field; bots fill it in. Tell them it worked.
            if (body?.website) return this.sent();

            const name = typeof body?.name === 'string' ? body.name.trim() : '';
            const email = typeof body?.email === 'string' ? body.email.trim() : '';
            const message = typeof body?.message === 'string' ? body.message.trim() : '';
            if (!name || name.length > 100
                || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                || !message || message.length > 5000) {
                return {
                    response: JSON.stringify('Please fill in your name, a valid email address, and a message.'),
                    status: 400
                };
            }

            const key = 'contact-' + this.clientIp(req);
            const count = cache.get<number>(key) ?? 0;
            if (count >= LIMIT) {
                return {
                    response: JSON.stringify("That's a lot of messages. Please try again in a few minutes."),
                    status: 429
                };
            }
            // Keep the window from the first message rather than restarting it
            const expires = cache.getTtl(key);
            const remaining = expires ? Math.max(1, Math.round((expires - Date.now()) / 1000)) : WINDOW_SECONDS;
            cache.set(key, count + 1, remaining);

            const escape = (value: string) => value
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const sent = await EmailService.sendEmail(
                CONTACT_EMAIL,
                `Contact form: ${name.replace(/[\r\n]+/g, ' ')}`,
                `From: ${name} <${email}>\n\n${message}`,
                `<p><b>From:</b> ${escape(name)} &lt;${escape(email)}&gt;</p><p>${escape(message).replace(/\n/g, '<br>')}</p>`,
                email
            );
            if (!sent) {
                return {
                    response: JSON.stringify("Your message couldn't be sent. Please try again later."),
                    status: 502
                };
            }
            return this.sent();
        } catch (error) {
            if (error === 'Invalid JSON') {
                return {
                    response: JSON.stringify('Invalid JSON'),
                    status: 400
                };
            }
            console.error("Error sending contact message:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    private static sent() {
        return {
            response: JSON.stringify("Thanks! Your message is on its way, and we'll get back to you soon."),
            status: 200
        };
    }

    /**
     * Heroku's router appends the address it saw to X-Forwarded-For, so the
     * last entry is the real one; earlier entries can be made up by the sender.
     */
    private static clientIp(req: http.IncomingMessage): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            const addresses = forwarded.split(',').map(address => address.trim()).filter(Boolean);
            if (addresses.length) return addresses[addresses.length - 1];
        }
        return req.socket.remoteAddress ?? 'unknown';
    }
}
