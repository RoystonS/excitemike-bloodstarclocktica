/**
 * model for character image settings data
 * @module CharacterImageSettings
 */
import { Property } from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class CharacterImageSettings extends ObservableObject<CharacterImageSettings> {

    /** whether to restyle the image at all. default: true */
    @observableProperty(true)
    readonly shouldRestyle!: Property<boolean>;

    /** whether to crop the image to just the visible portions before processing further */
    @observableProperty(true)
    readonly shouldReposition!: Property<boolean>; // TODO: make this a slider. min is like current off, max is like current on

    /** how much to shrink the image to leave room for text */
    @observableProperty(1)
    readonly shrinkToFit!: Property<number>;

    /** whether to colorize the image. default: true */
    @observableProperty(true)
    readonly shouldColorize!: Property<boolean>;

    /** whether to use teal for outsiders instead of blue, orange for minions instead of red. default: true */
    @observableProperty(true)
    readonly useOutsiderAndMinionColors!: Property<boolean>;

    /** whether to apply the grunge texture to the character icon. default: true */
    @observableProperty(true)
    readonly useTexture!: Property<boolean>;

    /** whether to add a border to the character icon. default: true */
    @observableProperty(true)
    readonly useBorder!: Property<boolean>;

    /** scales the spreading of the border from where edges were detected. default: 1 */
    @observableProperty(1)
    readonly borderIntensity!: Property<number>;

    /** whether to apply a dropshadow to the character icon. default: true */
    @observableProperty(true)
    readonly useDropshadow!: Property<boolean>;

    /** amount of blur applied to the dropshadow. default: 16 */
    @observableProperty(16)
    readonly dropShadowSize!: Property<number>;

    /** horizontal offset of drop shadow. default: 0 */
    @observableProperty(0)
    readonly dropShadowOffsetX!: Property<number>;

    /** vertical offset of drop shadow. default: 10 */
    @observableProperty(10)
    readonly dropShadowOffsetY!: Property<number>;

    /** opacity of drop shadow. default: 0.5 */
    @observableProperty(0.5)
    readonly dropShadowOpacity!: Property<number>;
}