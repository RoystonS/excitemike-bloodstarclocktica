import Locks from '../lock';
import {BaseBinding, Property} from './base-binding';

const MAX_SIMUL_SYNCTOELEMENT = 5;

/** one-way binding to display an image in an img tag */
export class ImageDisplayBinding extends BaseBinding<string|null> {

    /** create an instance asynchronously */
    static async create(
        element:HTMLImageElement,
        property:Property<string|null>
    ):Promise<ImageDisplayBinding> {
        element.src = '';

        const syncToElement = async (v:string|null)=>{
            if (v) {
                await new Promise(resolve=>{
                    element.addEventListener('load', resolve, {once:true});
                    element.src = v;
                });
            } else {
                element.src = '';
            }
        };
        // TODO: spinner here?
        const throttleSyncToElement = async (v:string|null)=>Locks.enqueue('ImageDisplayBinding', async ()=>syncToElement(v), MAX_SIMUL_SYNCTOELEMENT);

        const self = new ImageDisplayBinding(
            element,
            property,
            '',
            null,
            throttleSyncToElement
        );
        await self.init();
        return self;
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
    await property.set(dataURI);
}

/** convert a url to a data uri */
async function toDataUri(url:string, maxWidth:number, maxHeight:number):Promise<string> {
    return new Promise((resolve, reject)=>{
        try {
            const image = new Image();
            image.onload = ()=>{
                const canvas = document.createElement('canvas');
                const scale = Math.min(1.0, maxWidth / image.width, maxHeight / image.height);
                canvas.width = (scale * image.width) | 0;
                canvas.height = (scale * image.height) | 0;
                canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/png'));
            };
            image.src = url;
        } catch (error: unknown) {
            reject(error);
        }
    });
}

/** one-way binding to set a property to a data URI from a chosen image file */
export class ImageChooserBinding extends BaseBinding<string|null> {
    /** create an instance asynchronously */
    static async create(element:HTMLInputElement, property:Property<string|null>, maxWidth:number, maxHeight:number):Promise<ImageChooserBinding> {
        const self = new ImageChooserBinding(
            element,
            property,
            'change',
            async ()=>syncFileElemToProperty(element, property, maxWidth, maxHeight),
            null);
        await self.init();
        return self;
    }

    destroy():void {
        super.destroy();
    }
}