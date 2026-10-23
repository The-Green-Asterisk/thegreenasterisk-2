import Helpers from "@services/helpers";

const html = Helpers.html;

const footerTemplate = () => html`
    <el-footer>
        <p>Made with <a href="https://elemental.thegreenasterisk.com" target="_blank">Elemental</a></p>
    </el-footer>
`;

export default footerTemplate;
