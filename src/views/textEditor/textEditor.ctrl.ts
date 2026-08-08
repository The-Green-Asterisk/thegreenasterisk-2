import el from "@elements";
import textEditorTemplate from "./textEditor.template";

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
            case 'formatBold':
                document.execCommand('bold');
                break;
            case 'formatItalic':
                document.execCommand('italic');
                break;
            case 'formatUnderline':
                document.execCommand('underline');
                break;
            case 'insertFromPaste':
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
            inputType: 'formatItalic',
            bubbles: true,
            cancelable: true
        }));
    }

    const onBoldClick = () => {
        textEditorContent.dispatchEvent(new InputEvent('beforeinput', {
            inputType: 'formatBold',
            bubbles: true,
            cancelable: true
        }));
        textEditorContent.focus();
    }

    const onUnderlineClick = () => {
        textEditorContent.focus();
        textEditorContent.dispatchEvent(new InputEvent('beforeinput', {
            inputType: 'formatUnderline',
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
            inputType: 'insertFromPaste',
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