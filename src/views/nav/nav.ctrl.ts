import el from "@elements";
import { getData } from "@services/request";

export default function nav() {
    const discordLoginButton = el.buttons?.id('discord_login');
    if (discordLoginButton)
        discordLoginButton.addEventListener('click', async () => {
            if (el.isAuth) {
                window.location.href = '/logout';
            } else {
                type DiscordCreds = { client_id: string, redirect_url: string, scope: string };
                const originatingUrl = location.pathname;
                const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const { client_id, redirect_url, scope } = await getData<DiscordCreds>('/get-discord-creds', { state, originatingUrl });
                window.location.href = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(client_id)}&response_type=code&redirect_uri=${encodeURIComponent(redirect_url)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
            }
        }, { signal: el.signal });

    const menuButton = el.divs?.id('menu')
    if (menuButton)
        menuButton.addEventListener('click', () => {
            const menu = menuButton.querySelector('ul');
            if (menu) {
                menu.classList.contains('show') ? menu.classList.remove('show') : menu.classList.add('show');
            }
            document.body.addEventListener('click', (event) => {
                if (event.target !== menuButton && !menuButton.contains(event.target as Node)) {
                    const menu = menuButton.querySelector('ul');
                    if (menu) {
                        menu.classList.remove('show');
                    }
                }
            }, { signal: el.signal });
        }, { signal: el.signal });

    const navHeight = el.nav?.scrollHeight || 0;
    el.body.style.paddingTop = `${navHeight}px`;
}