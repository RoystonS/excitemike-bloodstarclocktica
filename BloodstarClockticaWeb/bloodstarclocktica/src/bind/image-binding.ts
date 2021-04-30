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
async function syncFileElemToProperty(element:HTMLInputElement, property:Property<string|null>):Promise<void> {
    const oldValue = property.get();
    if (oldValue) {
        URL.revokeObjectURL(oldValue);
    }
    if (!element.files) {
        property.set(null);
        return;
    }
    const objectURL = URL.createObjectURL(element.files[0]);
    const dataURI = await toDataUri(objectURL);
    URL.revokeObjectURL(objectURL);
    property.set(dataURI)
}

/** convert a url to a data uri */
async function toDataUri(url:string):Promise<string> {
    return new Promise((resolve,reject)=>{
        try {
            const image = new Image();
            image.onload = ()=>{
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext('2d')?.drawImage(image,0,0);
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
    constructor(element:HTMLInputElement, property:Property<string|null>) {
        super(
            element,
            property,
            'change',
            async _=>await syncFileElemToProperty(element, property),
            null);
    }
    destroy():void {
        const property = this.getProperty();
        if (property) {
            property.set(null);
        }
        super.destroy();
    }
}