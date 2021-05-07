import {BaseBinding, Property} from './base-binding'

/** one-way binding to display an image in an img tag */
export class ImageDisplayBinding extends BaseBinding<string|null> {
    constructor(element:HTMLImageElement, property:Property<string|null>) {
        element.src = '';

        super(
            element,
            property,
            '',
            null,
            v=>element.src = v || '');
    }
}

/** used with input elem [type=file] to set a property to a data URI */
async function syncFileElemToProperty(element:HTMLInputElement, property:Property<string|null>, maxWidth:number, maxHeight:number):Promise<void> {
    if (!element.files) {
        await property.set(null);
        return;
    }
    const objectURL = URL.createObjectURL(element.files[0]);
    const dataURI = await toDataUri(objectURL, maxWidth, maxHeight);
    URL.revokeObjectURL(objectURL);
    await property.set(dataURI)
}

/** convert a url to a data uri */
async function toDataUri(url:string, maxWidth:number, maxHeight:number):Promise<string> {
    return new Promise((resolve,reject)=>{
        try {
            const image = new Image();
            image.onload = ()=>{
                const canvas = document.createElement('canvas');
                const scale = Math.min(1.0, maxWidth / image.width, maxHeight / image.height);
                canvas.width = (scale * image.width) | 0;
                canvas.height = (scale * image.height) | 0;
                canvas.getContext('2d')?.drawImage(image,0,0,canvas.width,canvas.height);
                resolve(canvas.toDataURL('image/png'));
            }
            image.src = url;
        } catch (error) {
            reject(error);
        }
    });
}

/** one-way binding to set a property to a data URI from a chosen image file */
export class ImageChooserBinding extends BaseBinding<string|null> {
    constructor(element:HTMLInputElement, property:Property<string|null>, maxWidth:number, maxHeight:number) {
        super(
            element,
            property,
            'change',
            async _=>await syncFileElemToProperty(element, property, maxWidth, maxHeight),
            null);
    }
    destroy():void {
        super.destroy();
    }
}