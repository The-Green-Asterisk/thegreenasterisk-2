import el from "@elements";
import textEditorTemplate from "./textEditor.template";

const inputTypes = {
    bold: 'formatBold',
    italic: 'formatItalic',
    underline: 'formatUnderline',
    paste: 'insertFromPaste'
}

export default function textEditor(identifier: string | null = null) {
    const template = textEditorTemplate(identifier);
    const italicButton = template.querySelector<HTMLButtonElement>('#italic-button')!;
    const boldButton = template.querySelector<HTMLButtonElement>('#bold-button')!;
    const underlineButton = template.querySelector<HTMLButtonElement>('#underline-button')!;
    const copyButton = template.querySelector<HTMLButtonElement>('#copy-button')!;
    const pasteButton = template.querySelector<HTMLButtonElement>('#paste-button')!;
    const textEditorContent = template.querySelector<HTMLDivElement>(identifier ? '#text-editor-content-' + identifier : '#text-editor-content')!;

    const inputHandler = (event: InputEvent) => {
        switch (event.inputType) {
            case inputTypes.bold:
                document.execCommand('bold');
                break;
            case inputTypes.italic:
                document.execCommand('italic');
                break;
            case inputTypes.underline:
                document.execCommand('underline');
                break;
            case inputTypes.paste:
                navigator.clipboard.readText().then(text => {
                    document.execCommand('insertText', false, text);
                });
                break;
            default:
            // Do nothing for unsupported input types
        }
    }
    textEditorContent.addEventListener('beforeinput', inputHandler, { signal: el.signal });

    const onItalicClick = () => {
        textEditorContent.focus();
        textEditorContent.dispatchEvent(new InputEvent('beforeinput', {
            inputType: inputTypes.italic,
            bubbles: true,
            cancelable: true
        }));
    }

    const onBoldClick = () => {
        textEditorContent.dispatchEvent(new InputEvent('beforeinput', {
            inputType: inputTypes.bold,
            bubbles: true,
            cancelable: true
        }));
        textEditorContent.focus();
    }

    const onUnderlineClick = () => {
        textEditorContent.focus();
        textEditorContent.dispatchEvent(new InputEvent('beforeinput', {
            inputType: inputTypes.underline,
            bubbles: true,
            cancelable: true
        }));
    }

    const onCopyClick = () => {
        navigator.clipboard.writeText(window.getSelection()?.toString() || '');
    }

    const onPasteClick = () => {
        textEditorContent.focus();
        textEditorContent.dispatchEvent(new InputEvent('beforeinput', {
            inputType: inputTypes.paste,
            bubbles: true,
            cancelable: true
        }));
    }

    italicButton.addEventListener('click', onItalicClick, { signal: el.signal });
    boldButton.addEventListener('click', onBoldClick, { signal: el.signal });
    underlineButton.addEventListener('click', onUnderlineClick, { signal: el.signal });
    copyButton.addEventListener('click', onCopyClick, { signal: el.signal });
    pasteButton.addEventListener('click', onPasteClick, { signal: el.signal });

    return template;
}