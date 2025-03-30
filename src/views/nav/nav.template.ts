import el, { html } from "@services/elements";

const navTemplate = () => html`
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
                <li><a href="/store">Store</a></li>
            </ul>
        </div>
        <button id="discord_login">${el.isAuth ? 'Log Out' : 'Login with Discord'}</button>
        ${
            el.isAuth
                ?  `<a href="/profile">
                        <img id="nav-profile-picture" src="${el.currentUser?.profilePicture}" alt="Profile Picture" />
                    </a>`
                : ''
        }
    </nav>
`;

export default navTemplate;