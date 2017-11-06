declare class Editor{
	constructor(options: { 
        target: Element, 
        data?: {
            actions?: ({name: string, title?: string, icon?: string, result?: Function} | string)[],
            height?: string
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

    teardown();
	
}


export default Editor;




