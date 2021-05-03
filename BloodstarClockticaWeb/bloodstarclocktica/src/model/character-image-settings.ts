/**
 * model for character image settings data
 * @module CharacterImageSettings
 */
import { Property } from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class CharacterImageSettings extends ObservableObject<CharacterImageSettings> {

    /** whether to restyle the image at all. default: true */
    @observableProperty
    characterImageRestyle = new Property(true);

    /** whether to colorize the image. default: true */
    @observableProperty
    characterImageColorize = new Property(true);

    /** whether to use teal for outsiders instead of blue, orange for minions instead of red. default: true */
    @observableProperty
    characterImageOutsiderAndMinionColors = new Property(true);

    /** whether to apply the grunge texture to the character icon. default: true */
    @observableProperty
    characterImageTexture = new Property(true);

    /** whether to add a border to the character icon. default: true */
    @observableProperty
    characterImageBorder = new Property(true);

    /** amount of Gaussian blur used when creating the border. default: 3 */
    @observableProperty
    characterImageBorderBlur = new Property(3);

    /** lower alpha threshold for counting as a border pixel after Gaussian. default: 0.3 */
    @observableProperty
    characterImageBorderThresholdMin = new Property(0.3);

    /** upper alpha threshold for counting as a border pixel after Gaussian. default: 0.45 */
    @observableProperty
    characterImageBorderThresholdMax = new Property(0.45);

    /** whether to apply a dropshadow to the character icon. default: true */
    @observableProperty
    characterImageDropshadow = new Property(true);

    /** amount of blur applied to the dropshadow. default: 16 */
    @observableProperty
    characterImageDropShadowSize = new Property(16);

    /** horizontal offset of drop shadow. default: 0 */
    @observableProperty
    characterImageDropShadowOffsetX = new Property(0);

    /** vertical offset of drop shadow. default: 10 */
    @observableProperty
    characterImageDropShadowOffsetY = new Property(10);

    /** opacity of drop shadow. default: 0.5 */
    @observableProperty
    characterImageDropShadowOpacity = new Property<number>(0.5);

    constructor() {
        super();
        this.init();
    }
}