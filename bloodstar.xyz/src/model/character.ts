/**
 * Model for character data
 * @module Character
 */
import {CharacterAlmanac} from './character-almanac';
import {EnumProperty, Property} from '../bind/bindings';
import {observableChild, observableEnumProperty, ObservableObject, observableProperty, ObservableType} from '../bind/observable-object';
import {BLOODTEAM_OPTIONS, BloodTeam} from '../model/blood-team';
import {CharacterImageSettings} from '../model/character-image-settings';
import BloodImage, { getGradientForTeam, imageUrlToDataUri, ProcessImageSettings, urlToBloodImage } from '../blood-image';
import Images from '../images';

/**
 * if the browser realizes we are using a downloaded image, it will not let us do image processing on those pixels
 * this tries to trick it by making a data uri first
 */
async function safelyConvertImage(_object:ObservableObject<unknown>, field:ObservableType, data:unknown):Promise<void> {
    if (data === null) { return; }
    const unstyledImageProperty = field as Property<string|null>;
    const sourceData = data as string;
    const sourceUrl = new URL(sourceData);
    const isDataUri = sourceUrl.protocol === 'data:';
    if (isDataUri) {
        await unstyledImageProperty.set(sourceData);
    } else {
        const useCors = sourceUrl.hostname !== window.location.hostname;
        const dataUri = await imageUrlToDataUri(sourceData, useCors);
        await unstyledImageProperty.set(dataUri);
    }
}

function lerp(a:number, b:number, t:number):number {return a+(b-a)*t;}

export class Character extends ObservableObject<Character> {
    @observableProperty('')
    readonly ability!: Property<string>;

    @observableProperty('')
    readonly attribution!: Property<string>;
    
    @observableChild(CharacterAlmanac)
    readonly almanac!: CharacterAlmanac;
    
    @observableProperty('')
    readonly characterReminderTokens!: Property<string>;
    
    @observableProperty(true)
    readonly export!: Property<boolean>;

    @observableProperty('-', { read: false, write: false })
    readonly firstNightOrdinal!: Property<string>;
    
    @observableProperty('')
    readonly firstNightReminder!:Property<string>;
    
    @observableProperty('')
    readonly globalReminderTokens!:Property<string>;
    
    @observableProperty('newcharacter',{saveDefault:true})
    readonly id!: Property<string>;
    
    @observableChild(CharacterImageSettings)
    readonly imageSettings!: CharacterImageSettings;

    @observableProperty('New Character',{saveDefault:true})
    readonly name!: Property<string>;

    @observableProperty('-',{read:false,write:false})
    readonly otherNightOrdinal!:Property<string>;
    
    @observableProperty('')
    readonly otherNightReminder!:Property<string>;
    
    @observableProperty(false)
    readonly setup!:Property<boolean>;
    
    @observableProperty(null)
    readonly styledImage!: Property<string | null>;
    
    @observableEnumProperty(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS, {saveDefault:true})
    readonly team!: EnumProperty<BloodTeam>;
    
    @observableProperty(null, {customDeserialize: safelyConvertImage})
    readonly unStyledImage!: Property<string | null>;
    
    @observableProperty(false, {read:false,write:false})
    readonly isLoading!: Property<boolean>;

    /** prevent extraneous image processing during deserialization */
    private imageRegenSuspended = false;

    private constructor() {
        super();
        const regenCb = ()=>this.regenerateStyledImage();
        this.imageSettings.addPropertyChangedEventListener(regenCb);
        this.unStyledImage.addListener(regenCb);
        this.team.addListener(regenCb);

        // IF source or styled image are url paths instead of data uris,
        // THEN id change should force a regen, because that path is probably based on id
        this.id.addListener(async ()=>{
            const unstyled = this.unStyledImage.get();
            if (unstyled === null) { return; }
            if (!unstyled.startsWith('data:')) {
                await this.regenerateStyledImage();
                return;
            }
            const styled = this.styledImage.get();
            if ((styled === null) || !styled.startsWith('data:')) {
                // TODO: we could copy these on the server instead of this expensive regen
                await this.regenerateStyledImage();
                return;
            }
        });
    }

    static async asyncNew():Promise<Character>
    {
        const character = new Character();
        // set up auto-regen of styled images
        await character.regenerateStyledImage();
        return character;
    }

    async deserialize(data:{[key:string]:unknown}):Promise<void> {
        this.imageRegenSuspended = true;
        await super.deserialize(data);
        this.imageRegenSuspended = false;
    }

    /** generate styled image from unstyled image and image settings */
    async regenerateStyledImage():Promise<void> {
        if (this.imageRegenSuspended) {return;}
        try {
            await this.isLoading.set(true);
            return await this._regenerateStyledImage();
        } catch (error) {
            await this.styledImage.set('');
            throw error;
        } finally {
            await this.isLoading.set(false);
        }
    }

    /** generate styled image from unstyled image and image settings */
    async _regenerateStyledImage():Promise<void> {
        const unstyledImage = this.unStyledImage.get();
        const imageSettings = this.imageSettings;
        if (!unstyledImage || !imageSettings.shouldRestyle.get()) {
            return this.styledImage.set(unstyledImage);
        }
        
        // start from the unstyled image
        let bloodImage = await urlToBloodImage(unstyledImage, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT, false);

        // crop
        bloodImage = bloodImage.trim();

        // colorize
        if (imageSettings.shouldColorize.get()) {
            const gradientImage = await getGradientForTeam(
                this.team.get(),
                imageSettings.useOutsiderAndMinionColors.get(),
                bloodImage.width,
                bloodImage.height
            );
            bloodImage.setRGB(255,255,255);
            bloodImage.multiply(gradientImage.resized(bloodImage.width, bloodImage.height));
        }

        // make full size image with icon pasted into the correct place
        {
            const shrinkToFitAmount = imageSettings.shrinkToFit.get();
            if (shrinkToFitAmount > 0) {
            bloodImage = new BloodImage([ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT])
                .pasteZoomed(
                    bloodImage,
                    lerp(0, ProcessImageSettings.USABLE_REGION_X, shrinkToFitAmount),
                    lerp(0, ProcessImageSettings.USABLE_REGION_Y, shrinkToFitAmount),
                    lerp(ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.USABLE_REGION_WIDTH, shrinkToFitAmount),
                    lerp(ProcessImageSettings.FULL_HEIGHT, ProcessImageSettings.USABLE_REGION_HEIGHT, shrinkToFitAmount),
                );
            } else {
                bloodImage = bloodImage.fit(ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
            }
        }

        // texture
        if (imageSettings.useTexture.get()) {
            const tokenTexture = await urlToBloodImage(Images.TEXTURE_URL, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT, false);
            bloodImage.multiply(tokenTexture);
        }

        // border
        if (imageSettings.useBorder.get()) {
            bloodImage.addBorder(imageSettings.borderIntensity.get());
        }

        // dropshadow
        if (imageSettings.useDropshadow.get()) {
            bloodImage = bloodImage.addDropShadow(
                imageSettings.dropShadowSize.get(),
                imageSettings.dropShadowOffsetX.get(),
                imageSettings.dropShadowOffsetY.get(),
                imageSettings.dropShadowOpacity.get());
        }
        await this.styledImage.set(bloodImage.toDataUri());
    }
}
