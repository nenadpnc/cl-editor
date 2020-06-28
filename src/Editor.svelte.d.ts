declare class Editor {
	constructor(options: {
        target: Element,
        props?: {
            actions?: ({name: string, title?: string, icon?: string, result?: Function} | string)[],
            height?: string,
            html?: string,
            removeFormatTags?: string[]
        }
    });

    $destroy(detach?: boolean);

    $on(event: 'change' | 'blur', cb: (event?: any) => void);

    exec(cmd: string, value?: string): void

    getHtml(sanitize?: boolean): string

    getText(): string

    setHtml(html: string, sanitize?: boolean): void

    saveRange(element: Element): void

    restoreRange(element: Element): void

    refs: {
        colorPicker: HTMLDivElement,
        editor: HTMLDivElement,
        modal: HTMLDivElement,
        raw: HTMLTextAreaElement
    }

}

export default Editor;
