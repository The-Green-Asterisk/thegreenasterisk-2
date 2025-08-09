import el, { html } from '@elements';

const cookieBanner = () => html`
    <el-cookie-banner>
        <p>We view website cookies the same way we view chocolate chip cookies: They enhance your experience and we never share. By clicking this button you agree to our use of cookies.</p>
        <button id="accept-cookies">Accept Cookies</button>
    </el-cookie-banner>
`;

export default cookieBanner;