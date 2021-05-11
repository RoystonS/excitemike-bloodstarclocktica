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
import { spinner } from '../dlg/spinner-dlg';

// if the browser realizes we are using a downloaded image, it will not let us do image processing on those pixels
async function safelyConvertImage(object:ObservableObject<unknown>, field:ObservableType, data:unknown):Promise<void> {
    const character = object as unknown as Character;
    const id = character.id.get();
    const unstyledImageProperty = field as Property<string|null>;
    const sourceData = data as string;
    const sourceUrl = new URL(sourceData);
    const isDataUri = sourceUrl.protocol === 'data:';
    if (isDataUri) {
        unstyledImageProperty.set(sourceData);
    } else {
        const useCors = sourceUrl.hostname !== window.location.hostname;
        unstyledImageProperty.set(await spinner(`convertImage-${id}`, `Converting image for ${id}`, imageUrlToDataUri(sourceData, useCors)));
    }
}

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

    @observableProperty('New Character')
    readonly name!: Property<string>;

    @observableProperty('-',{read:false,write:false})
    readonly otherNightOrdinal!:Property<string>;
    
    @observableProperty('')
    readonly otherNightReminder!:Property<string>;
    
    @observableProperty(false)
    readonly setup!:Property<boolean>;
    
    @observableProperty(null)
    readonly styledImage!: Property<string | null>;
    
    @observableEnumProperty(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS)
    readonly team!: EnumProperty<BloodTeam>;
    
    @observableProperty(null, {customDeserialize: safelyConvertImage}) // TODO: do this conversion as a separate step
    readonly unStyledImage!: Property<string | null>;

    /** prevent extraneous image processing during deserialization */
    private imageRegenSuspended = false;

    private constructor() {
        super();
        const regenCb = ()=>this.regenerateStyledImage();
        this.imageSettings.addPropertyChangedEventListener(regenCb);
        this.unStyledImage.addListener(regenCb);
        this.team.addListener(regenCb);
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
        super.deserialize(data);
        this.imageRegenSuspended = false;
    }

    /** generate styled image from unstyled image and image settings */
    async regenerateStyledImage():Promise<void> {
        if (this.imageRegenSuspended) {return;}
        // TODO: throbber
        const unstyledImage = this.unStyledImage.get();
        const imageSettings = this.imageSettings;
        if (!unstyledImage || !imageSettings.shouldRestyle.get()) {
            return this.styledImage.set(unstyledImage);
        }
        
        // start from the unstyled image
        let bloodImage = await urlToBloodImage(unstyledImage, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT, false);

        // crop
        if (imageSettings.shouldReposition.get()) {
            bloodImage = bloodImage.trim();
        }

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
        if (imageSettings.shouldReposition.get()) {
            bloodImage = new BloodImage([ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT])
                .pasteZoomed(
                    bloodImage,
                    ProcessImageSettings.USABLE_REGION_X,
                    ProcessImageSettings.USABLE_REGION_Y,
                    ProcessImageSettings.USABLE_REGION_WIDTH,
                    ProcessImageSettings.USABLE_REGION_HEIGHT
                );
        } else {
            bloodImage = bloodImage.fit(ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
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
