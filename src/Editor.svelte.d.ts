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

    // get(name: string);
    // set(data: any);
	//
    // on(
    //     eventName: string,
    //     callback?: (event?: any) => any)
    // : () => { cancel:() => any };
	//
    // fire(eventName: string, event?: any);
	//
    // observe(
    // 	name:string,
    // 	callback: (newValue?, oldValue?) => any ,
    // 	options? :{ init?: boolean, defer?: boolean })
    // : () => { cancel:() => any };

    destroy(detach?: boolean);

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

    options: {
        target: Element,
        data: any
    }

}

export default Editor;
