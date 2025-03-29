import { html } from "@services/elements";
import sidebarTemplate from "@views/sidebar/sidebar.template";

const about = () => html`
        <el-about>
        <div class="content-slate">
            <section>
                <h1>About The Green Asterisk</h1>
                <p>
                    The Green Asterisk is a community of table-top role-playing game players located in the Tampay Bay area and highly involved in the local kava community. Our aim is to share our love of games like D&D, Call of Cthulhu, Cyberpunk Red and others with each other and the world, and also to just have fun! You can join in on our fun by watching our live stream every other Sunday on Discord and YouTube, joining our Discord server, or by meeting us at <a href="http://uniteakava.com">UniTea Kava Bar</a> in Dunedin, Florida!
                </p>
            </section>
        </div>
        </el-about>
    `;

export default about;