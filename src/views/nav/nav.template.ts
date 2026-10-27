import el from "@elements";
import Helpers from "@services/helpers";
import { currentTheme } from "@services/theme";

const navTemplate = () => {
    const isDark = currentTheme() === 'dark';
    const themeTitle = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    const themeIcon = isDark ? 'fa-sun' : 'fa-moon';
    const profileImg = el.isAuth ? `<a id="nav-profile-picture" href="/profile">
                                        <img src="${el.currentUser?.profilePicture}" alt="Profile Picture" />
                                    </a>` : '';

    return Helpers.html`
    <nav>
        <a href="/">
            <img id="logo" src="/storage/images/BIG-AS.png" alt="The Green Asterisk" />
        </a>
        <div style="width: 100px;"></div>
        <div class="fa-solid fa-bars" id="menu">
            <ul>
                <li class="fa-solid fa-x"></li>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/many-worlds">Many Worlds</a></li>
                <li><a href="/current-games">Current Games</a></li>
                <li><a href="/character-sheet">Character Sheet</a></li>
                <li><a href="/store">Store</a></li>
                <li><a href="/contact">Contact</a></li>
                ${el.checkAdmin() ? `<li><a href="/pr-digest">PR Digest</a></li>` : ''}
            </ul>
        </div>
        <button id="theme-toggle" title="${themeTitle}">
            <i class="fa-solid ${themeIcon}"></i>
        </button>
        <button id="discord_login">${el.isAuth ? 'Log Out' : 'Login with Discord'}</button>
        ${profileImg}
    </nav>
`;
};

export default navTemplate;