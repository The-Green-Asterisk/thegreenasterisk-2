import { html } from "@services/elements";

const currentGamesTemplate = () => html`
    <el-current-games>
        <div class="content-slate">
            <section>
                <h1>Survivors of the Emergence</h1>
                <p>Our bi-weekly live broadcast on YouTube and Discord follows the denizens of the homebrew world of Cronus as they navigate a world that has been forever transformed by the emergence and subsequent defeat of Orcus 100 years ago. Join the live stream every other Sunday at 5pm, or watch the recording the week after.</p>
            </section>
            <section>
                <h1>Stardust Crusaders</h1>
                <p>When Survivors of the Emergence is down, Stardust Crusaders is up! Every other Sunday, a select group of players meet at <a href="https://thevantagewellness.com/">Vantage Kava and Wellness</a> in Palm Harbor, Florida, to play a homebrew game set in the Astral Plane of the D&D multiverse. A loosely sci-fi fantasy game, Stardust Crusaders welcomes a moderate amount of players due to limited seating. If you are interested in joining, please reach out to us on Discord or in person at Vantage Kava and Wellness.</p>
            </section>
            <section>
                <h1>Uni-Shots</h1>
                <p>Uni-Shots is a series of one-shot adventures that are played at <a href="https://uniteakava.com/">UniTea Kava Bar</a> in Dunedin, Florida, during their "Tea&D" night. These games are open to the public and are a great way to meet new people and try out new games! Check out our Discord for upcoming events.</p>
            </section>
        </div>
    </el-current-games>
`;

export default currentGamesTemplate;