import Helpers from "@services/helpers";

const html = Helpers.html;

const prDigestTemplate = () => html`
    <el-pr-digest>
        <div class="content-slate">
            <section>
                <div class="digest"></div>
                <div class="push"></div>
            </section>
        </div>
    </el-pr-digest>
`;

export default prDigestTemplate;
