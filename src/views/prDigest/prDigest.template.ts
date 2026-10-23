import Helpers from "@services/helpers";

const html = Helpers.html;

const prDigestTemplate = () => html`
    <el-pr-digest>
        <section>
            <div class="digest"></div>
            <div class="push"></div>
        </section>
    </el-pr-digest>
`;

export default prDigestTemplate;
