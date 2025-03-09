import { html } from '@services/elements';

const homeTemplate = () => html`
    <el-home>
        <div class="content-slate">
            <div class="hero-slate" bg="/storage/images/swamptown.png">
                <h1>Do You D&D?</h1>
                <div>
                    <a href="https://discord.gg/PwYVb5R7BF"><i class="fab fa-discord"></i></a>
                    <a href="https://www.youtube.com/@TheGreenAsterisk"><i class="fab fa-youtube"></i></a>
                    <a href="https://www.twitch.tv/thegreenasterisk"><i class="fab fa-twitch"></i></a>
                </div>
            </div>
            <section>
                <h2>The Green Asterisk</h2>
                <p>The Green Asterisk is a community of tabletop RPG players based in the Tampa Bay Florida area.</p>
                <p>Stay tuned to learn more about our upcoming streaming campaign.</p>
            </section>
        </div>
    </el-home>
`;

export default homeTemplate;