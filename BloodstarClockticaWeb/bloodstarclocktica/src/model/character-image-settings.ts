/**
 * model for character image settings data
 * @module CharacterImageSettings
 */
import { Property } from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class CharacterImageSettings extends ObservableObject<CharacterImageSettings> {

    /** whether to restyle the image at all. default: true */
    @observableProperty
    readonly characterImageRestyle = new Property(true);

    /** whether to colorize the image. default: true */
    @observableProperty
    readonly characterImageColorize = new Property(true);

    /** whether to use teal for outsiders instead of blue, orange for minions instead of red. default: true */
    @observableProperty
    readonly characterImageOutsiderAndMinionColors = new Property(true);

    /** whether to apply the grunge texture to the character icon. default: true */
    @observableProperty
    readonly characterImageTexture = new Property(true);

    /** whether to add a border to the character icon. default: true */
    @observableProperty
    readonly characterImageBorder = new Property(true);

    /** amount of Gaussian blur used when creating the border. default: 3 */
    @observableProperty
    readonly characterImageBorderBlur = new Property(3);

    /** lower alpha threshold for counting as a border pixel after Gaussian. default: 0.3 */
    @observableProperty
    readonly characterImageBorderThresholdMin = new Property(0.3);

    /** upper alpha threshold for counting as a border pixel after Gaussian. default: 0.45 */
    @observableProperty
    readonly characterImageBorderThresholdMax = new Property(0.45);

    /** whether to apply a dropshadow to the character icon. default: true */
    @observableProperty
    readonly characterImageDropshadow = new Property(true);

    /** amount of blur applied to the dropshadow. default: 16 */
    @observableProperty
    readonly characterImageDropShadowSize = new Property(16);

    /** horizontal offset of drop shadow. default: 0 */
    @observableProperty
    readonly characterImageDropShadowOffsetX = new Property(0);

    /** vertical offset of drop shadow. default: 10 */
    @observableProperty
    readonly characterImageDropShadowOffsetY = new Property(10);

    /** opacity of drop shadow. default: 0.5 */
    @observableProperty
    readonly characterImageDropShadowOpacity = new Property<number>(0.5);

    constructor() {
        super();
        this.init();
    }
}