import { createHash, timingSafeEqual } from "crypto";
import http from "http";
import AppDataSource from "services/database";
import { PrDigest } from "services/database/entity/PrDigest";
import PushService, { PushNotification } from "services/push";
import BaseController from "./baseController";
import SessionController from "./sessionController";

const SECTIONS = ['red', 'yellow', 'green'];
const ACTIONS = ['approved', 'requested changes', 'commented', 'pushed', 'updated the branch', 'opened', 'requested review', 'activity'];

type Digest = NonNullable<ReturnType<typeof PrDigestController['cleanDigest']>>;

export default class PrDigestController extends BaseController {

    public static async getDigest(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const digest = await AppDataSource.getRepository(PrDigest).findOneBy({ id: 1 });
            if (!digest) {
                return {
                    response: JSON.stringify('No digest yet'),
                    status: 404
                };
            }
            return {
                response: digest.payload,
                status: 200
            };
        } catch (error) {
            console.error("Error fetching PR digest:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    /**
     * Called by the PR watch script on Steve's laptop, which has no Discord
     * session, so it authenticates with the PR_DIGEST_TOKEN shared secret.
     * The body is rebuilt field by field so nothing outside the expected
     * shape gets stored, even if the token leaks.
     */
    public static async saveDigest(req: http.IncomingMessage, res: http.ServerResponse) {
        if (!this.hasValidToken(req)) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const digest = this.cleanDigest(await this.readBody(req));
            if (!digest) {
                return {
                    response: JSON.stringify('Invalid digest'),
                    status: 400
                };
            }

            const repository = AppDataSource.getRepository(PrDigest);
            const previous = await repository.findOneBy({ id: 1 });
            await repository.save(repository.create({ id: 1, payload: JSON.stringify(digest) }));

            // Not awaited so the laptop's push isn't held up by slow push services
            if (previous) {
                PushService.sendToAdmins(this.newAlerts(JSON.parse(previous.payload), digest))
                    .catch(error => console.error("Error sending PR digest alerts:", error));
            }
            return {
                response: JSON.stringify('Saved'),
                status: 200
            };
        } catch (error) {
            console.error("Error saving PR digest:", error);
            return {
                response: JSON.stringify(error === 'Invalid JSON' ? error : 'Internal Server Error'),
                status: error === 'Invalid JSON' ? 400 : 500
            };
        }
    }

    /**
     * A PR alerts when it moves up to Red, or up to Yellow from Green, or gets
     * a new event while it's Red or Yellow. Green churn and a PR dropping from
     * Red to Yellow stay quiet.
     */
    private static newAlerts(previous: Digest, digest: Digest): PushNotification[] {
        const rank = (section?: string) => section === 'red' ? 2 : section === 'yellow' ? 1 : 0;
        const before = new Map(previous.prs.map(pr => [pr.url, pr]));
        return digest.prs
            .filter(pr => {
                const old = before.get(pr.url);
                const latest = pr.events[0]?.at ?? '';
                return rank(pr.section) > rank(old?.section)
                    || (rank(pr.section) > 0 && latest > (old?.events[0]?.at ?? ''));
            })
            .map(pr => {
                const event = pr.events[0];
                return {
                    title: `${pr.repo} #${pr.number}: ${pr.section === 'red' ? 'Red' : 'Yellow'} Alert`,
                    body: [event ? `${event.actor ? `${event.actor} ` : ''}${event.action}` : '', pr.status]
                        .filter(Boolean).join(', '),
                    tag: `${pr.repo}#${pr.number}`,
                    url: '/pr-digest',
                    urgency: pr.section === 'red' ? 'high' : 'normal'
                };
            });
    }

    private static hasValidToken(req: http.IncomingMessage): boolean {
        const expected = process.env.PR_DIGEST_TOKEN;
        const given = req.headers['x-pr-digest-token'];
        if (!expected || typeof given !== 'string') return false;
        const hash = (value: string) => createHash('sha256').update(value).digest();
        return timingSafeEqual(hash(given), hash(expected));
    }

    private static cleanDigest(body: any) {
        if (!body || !this.isDate(body.checkedAt) || !Array.isArray(body.prs)) return null;
        const prs = [];
        for (const pr of body.prs) {
            if (!SECTIONS.includes(pr?.section)
                || !/^[\w.-]{1,100}$/.test(pr.repo)
                || !Number.isInteger(pr.number)
                || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(pr.url)
                || !Array.isArray(pr.tickets) || !pr.tickets.every((t: any) => /^[A-Z]+-\d+$/.test(t))
                || typeof pr.status !== 'string' || !/^[\w ,()#'-]{0,200}$/.test(pr.status)
                || !Array.isArray(pr.events)) return null;
            const events = [];
            for (const event of pr.events) {
                if (!this.isDate(event?.at)
                    || !(event.actor === null || /^[A-Za-z]{1,4}$/.test(event.actor))
                    || !ACTIONS.includes(event.action)) return null;
                events.push({ at: event.at, actor: event.actor, action: event.action });
            }
            prs.push({
                section: pr.section,
                repo: pr.repo,
                number: pr.number,
                url: pr.url,
                tickets: pr.tickets,
                status: pr.status,
                events
            });
        }
        return { checkedAt: body.checkedAt, prs };
    }

    private static isDate(value: any): boolean {
        return typeof value === 'string' && !isNaN(Date.parse(value));
    }
}
