import { html } from "@elements";

const textEditorTemplate = (identifier: string | null = null) => html`
    <el-text-editor>
        <div id="text-editor-controls">
            <button id="italic-button" title="Italic"><i>I</i></button>
            <button id="bold-button" title="Bold"><b>B</b></button>
            <button id="underline-button" title="Underline"><u>U</u></button>
            <button id="copy-button" title="Copy"><span class="fa fa-copy"></span></button>
            <button id="paste-button" title="Paste"><span class="fa fa-paste"></span></button>
        </div>
        <div id="${getTextEditorId(identifier)}" class="text-editor-content" contenteditable="true"></div>
    </el-text-editor>
`;

const getTextEditorId = (identifier: string | null = null) => identifier ? 'text-editor-content-' + identifier : 'text-editor-content';

export default textEditorTemplate;