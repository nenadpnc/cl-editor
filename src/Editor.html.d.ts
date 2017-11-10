declare class Editor{
	constructor(options: { 
        target: Element, 
        data?: {
            actions?: ({name: string, title?: string, icon?: string, result?: Function} | string)[],
            height?: string,
            html?: string
        } 
    });

    get(name: string);
    set(data: any);

    on(
        eventName: string, 
        callback?: (event?: any) => any) 
    : () => { cancel:() => any };

    fire(eventName: string, event?: any);

    observe(
    	name:string, 
    	callback: (newValue?, oldValue?) => any , 
    	options? :{ init?: boolean, defer?: boolean }) 
    : () => { cancel:() => any };

    destroy();

    exec(cmd: string, value: any): void

    getHtml(sanitize?: boolean): string

    getText(): string

    setHtml(html: string, sanitize?: boolean): void

    refs: {
        colorPicker: HTMLDivElement,
        editor: HTMLDivElement,
        modal: HTMLDivElement,
        raw: HTMLTextAreaElement
    }

    options: {
        target: HTMLElement,
        data: any
    }
	
}


export default Editor;




