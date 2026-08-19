import Helpers from "@services/helpers";

const html = Helpers.html;

const linksTemplate = () => html`
    <el-links>
        <section>
            <h1>Lord Steve's Links</h1>
            <p>You succeeded in your investigation roll. You now know where to find Lord Steve. Use this knowledge cautiously.</p>
        </section>
    </el-links>
`;

export default linksTemplate;