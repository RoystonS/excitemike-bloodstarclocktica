/**
 * model for character image settings data
 * @module CharacterImageSettings
 */
import { Property } from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class CharacterImageSettings extends ObservableObject<CharacterImageSettings> {

    /** whether to restyle the image at all. default: true */
    @observableProperty
    readonly shouldRestyle = new Property(true);

    /** whether to colorize the image. default: true */
    @observableProperty
    readonly shouldColorize = new Property(true);

    /** whether to use teal for outsiders instead of blue, orange for minions instead of red. default: true */
    @observableProperty
    readonly useOutsiderAndMinionColors = new Property(true);

    /** whether to apply the grunge texture to the character icon. default: true */
    @observableProperty
    readonly useTexture = new Property(true);

    /** whether to add a border to the character icon. default: true */
    @observableProperty
    readonly useBorder = new Property(true);

    /** amount of Gaussian blur used when creating the border. default: 3 */
    @observableProperty
    readonly borderBlur = new Property(3);

    /** lower alpha threshold for counting as a border pixel after Gaussian. default: 0.3 */
    @observableProperty
    readonly borderThresholdMin = new Property(0.3);

    /** upper alpha threshold for counting as a border pixel after Gaussian. default: 0.45 */
    @observableProperty
    readonly borderThresholdMax = new Property(0.45);

    /** whether to apply a dropshadow to the character icon. default: true */
    @observableProperty
    readonly useDropshadow = new Property(true);

    /** amount of blur applied to the dropshadow. default: 16 */
    @observableProperty
    readonly dropShadowSize = new Property(16);

    /** horizontal offset of drop shadow. default: 0 */
    @observableProperty
    readonly dropShadowOffsetX = new Property(0);

    /** vertical offset of drop shadow. default: 10 */
    @observableProperty
    readonly dropShadowOffsetY = new Property(10);

    /** opacity of drop shadow. default: 0.5 */
    @observableProperty
    readonly dropShadowOpacity = new Property<number>(0.5);

    constructor() {
        super();
        this.init();
    }
}