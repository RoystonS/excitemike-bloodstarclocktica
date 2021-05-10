/**
 * Model for character data
 * @module Character
 */
import {CharacterAlmanac} from './character-almanac';
import {EnumProperty, Property} from '../bind/bindings';
import {observableChild, observableEnumProperty, ObservableObject, observableProperty} from '../bind/observable-object';
import {BLOODTEAM_OPTIONS, BloodTeam} from '../model/blood-team';
import {CharacterImageSettings} from '../model/character-image-settings';
import BloodImage, { getGradientForTeam, ProcessImageSettings, urlToBloodImage } from '../blood-image';
import Images from '../images';

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
    
    @observableProperty('newcharacter')
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
    
    @observableProperty(null, { read: false, write: false, notify: false })
    readonly styledImage!: Property<string | null>;
    
    @observableEnumProperty(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS)
    readonly team!: EnumProperty<BloodTeam>;
    
    @observableProperty(null)
    readonly unStyledImage!: Property<string | null>;

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

    /** generate styled image from unstyled image and image settings */
    async regenerateStyledImage():Promise<void> {
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
