import { html } from "@elements";

const survivorsTemplate = () => html`
    <el-survivors>
        <div class="content-slate" id="content">
            <section class="current-games-survivors">
                <h1>Survivors of the Emergence</h1>
                <p>100 years after Orcus emerged from the Abyss and wreaked havoc on the land of Cronus, a troup of unlikely heroes discovers a plot to revive the undead</p>
                <div class="player-card">
                    <img class="player-img" src="/storage/images/DMSteve.jpg" alt="Steve the DM" />
                    <div>
                        <h3>Steve Beaudry: The DM</h3>
                        <p>Steve has been playing tabletop RPGs for about ten years now and has been DMing for about 8 of those years. Once he started, he couldn't stop. His background includes writing, but never publishing several different kinds of stories, and he has a passion for world-building. He, along with his players, is the creator of the world of Cronus, where Survivors of the Emergence takes place.</p>
                        <p>Steve's DMing style is highly collaborative, and he encourages his players to take an active role in shaping the story. He believes that the best stories are the ones that are created together, and he strives to create a fun and engaging experience for everyone at the table.</p>
                        <p>When you watch Survivors of the Emergence, you are getting a peek into Steve's own home, sitting at his own table, with his own friends.</p>
                    </div>
                </div>
                <p>Join us every other Sunday at 5pm on <a href="https://www.youtube.com/@TheGreenAsterisk">YouTube</a> or <a href="https://discord.gg/PwYVb5R7BF">Discord</a> to watch the live stream, or catch up with the recordings below.</p>
                <div class="survivor-list" id="video-list"></div>
            </section>
        </div>
    </el-survivors>
`;

export default survivorsTemplate;