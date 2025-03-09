import el, { html, htmlstring } from "@services/elements";

const navTemplate = () => html`
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/many-worlds">Many Worlds</a></li>
            <li><a href="/current-games">Current Games</a></li>
            <li><a href="/store">Store</a></li>
        </ul>
        <button id="discord_login">${el.isAuth ? 'Log Out' : 'Login with Discord'}</button>
        ${el.isAuth ? 'Welcome, ' + el.currentUser?.username : ''}
    </nav>
`;

export default navTemplate;