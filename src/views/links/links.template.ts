import { html } from "@elements";

const linksTemplate = () => html`
    <el-links>
        <section>
            <h1>Lord Steve's Links</h1>
            <p>You succeeded in your investigation roll. You now know where to find Lord Steve. Use this knowledge cautiously.</p>
            <a class="link" href="https://thegreenasterisk.com">
                <div class="link-image primary">
                    <img src="/storage/images/BIG-AS.png" />
                </div>
                <div class="link-text">
                    The Green Asterisk
                </div>
            </a>
            <a class="link" href="https://instagram.com/lordsteve">
                <div class="link-image">
                    <span class="fab fa-instagram"></span>
                </div>
                <div class="link-text">
                    Instagram
                </div>
            </a>
            <a class="link" href="https://threads.com/@lordsteve">
                <div class="link-image">
                    <span class="fab fa-threads"></span>
                </div>
                <div class="link-text">
                    Threads
                </div>
            </a>
            <a class="link" href="https://facebook.com/LordSteveBeaudry">
                <div class="link-image">
                    <span class="fab fa-facebook"></span>
                </div>
                <div class="link-text">
                    Facebook
                </div>
            </a>
            <a class="link" href="https://www.youtube.com/@TheGreenAsterisk">
                <div class="link-image">
                    <span class="fab fa-youtube"></span>
                </div>
                <div class="link-text">
                    YouTube
                </div>
            </a>
            <a class="link" href="https://discord.gg/w8fENR63">
                <div class="link-image">
                    <span class="fab fa-discord"></span>
                </div>
                <div class="link-text">
                    Discord
                </div>
            </a>
            <a class="link" href="https://github.com/lordsteve">
                <div class="link-image">
                    <span class="fab fa-github"></span>
                </div>
                <div class="link-text">
                    GitHub
                </div>
            </a>
            <a class="link" href="https://twitch.com/thegreenasterisk">
                <div class="link-image">
                    <span class="fab fa-twitch"></span>
                </div>
                <div class="link-text">
                    Twitch
                </div>
            </a>
            <a class="link" href="https://linkedin.com/in/lordsteve">
                <div class="link-image">
                    <span class="fab fa-linkedin"></span>
                </div>
                <div class="link-text">
                    LinkedIn
                </div>
            </a>
            <a class="link" href="https://ngl.link/lordsteve14223">
                <div class="link-image">
                    <img src="/storage/images/ngl-logo.png" />
                </div>
                <div class="link-text">
                    NGL
                </div>
            </a>
            <a class="link" href="https://cash.app/$lordsteve1701">
                <div class="link-image">
                    <img src="/storage/images/cashapp.png" />
                </div>
                <div class="link-text">
                    Cash App
                </div>
            </a>
            <a class="link" href="mailto:steve@mail.thegreenasterisk.com">
                <div class="link-image">
                    <span class="fas fa-envelope"></span>
                </div>
                <div class="link-text">
                    Email
                </div>
            </a>
        </section>
    </el-links>
`;

export default linksTemplate;