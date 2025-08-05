import { html } from "@services/elements";
import survivorsTemplate from "./survivors/survivors.template";

const currentGamesTemplate = () => html`
    <el-current-games>
        <div class="content-slate">
            <section>
                <h1><a href="/current-games/survivors">Survivors of the Emergence</a></h1>
                <p>Our bi-weekly live broadcast on YouTube and Discord follows the denizens of the homebrew world of Cronus as they navigate a world that has been forever transformed by the emergence and subsequent defeat of Orcus 100 years ago. Join the live stream every other Sunday at 5pm, or watch the recording the week after.</p>
            </section>
            <section>
                <h1>Uni-Shots</h1>
                <p>Uni-Shots is a series of one-shot adventures that are played at <a href="https://uniteakava.com/" target="_blank">UniTea Kava Lounge</a> in Dunedin, Florida, during their "Tea&D" night. These games are open to the public and are a great way to meet new people and try out new games! Check out our <a href="https://discord.gg/PwYVb5R7BF" target="_blank">Discord</a> for upcoming events.</p>
            </section>
        </div>
    </el-current-games>
`;

currentGamesTemplate.survivorsTemplate = survivorsTemplate;

export default currentGamesTemplate;