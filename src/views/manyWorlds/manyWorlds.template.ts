import { html } from "@services/elements";

const manyWorldsTemplate = () => html`
    <el-many-worlds>
        <div class="content-slate">
            <section>
                <a href="/many-worlds"><h1>Many Worlds</h1></a>
                <div id="tabs-container">
                </div>
            </section>
            <section id="comment-section">
            </section>
        </div>
    </el-many-worlds>
`;

export default manyWorldsTemplate;