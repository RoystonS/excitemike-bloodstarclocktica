import * as BloodBind from './blood-bind';
export declare class BloodTeam {
    static TOWNSFOLK: string;
    static OUTSIDER: string;
    static MINION: string;
    static DEMON: string;
    static TRAVELER: string;
    static TOWNSFOLK_DISPLAY: string;
    static OUTSIDER_DISPLAY: string;
    static MINION_DISPLAY: string;
    static DEMON_DISPLAY: string;
    static TRAVELER_DISPLAY: string;
    static toIdString(displayString: string): string;
    static toDisplayString(teamString: string): string;
    static options(): {
        display: string;
        value: string;
    }[];
}
export declare class BloodDocumentMeta {
    private name;
    private author;
    private logo;
    private almanac;
    constructor();
    reset(name: string): void;
    getSaveData(): {
        name: string;
        author: string;
        logo: string | null;
        almanac: {
            synopsis: string;
            overview: string;
        };
    };
    getName(): string;
}
export declare class BloodDocumentMetaAlmanac {
    private synopsis;
    private overview;
    constructor();
    reset(): void;
    getSaveData(): {
        synopsis: string;
        overview: string;
    };
}
export declare class BloodCharacter {
    private id;
    private name;
    private unStyledImage;
    private styledImage;
    private team;
    private export;
    constructor();
    getIdProperty(): BloodBind.Property<string>;
    getNameProperty(): BloodBind.Property<string>;
    getName(): string;
    getUnStyledImageProperty(): BloodBind.Property<string | null>;
    getStyledImageProperty(): BloodBind.Property<string | null>;
    getTeamPropertyProperty(): BloodBind.Property<string>;
    getExportProperty(): BloodBind.Property<boolean>;
}
export declare class BloodDocument {
    private bloodId;
    private previewOnToken;
    private dirty;
    private meta;
    private windowTitle;
    private characterList;
    private firstNightOrder;
    private otherNightOrder;
    constructor();
    reset(name: string): void;
    getCharacterList(): BloodCharacter[];
    addNewCharacter(): void;
    saveAs(_name: string): Promise<boolean>;
    save(): Promise<boolean>;
    _save(): Promise<boolean>;
    open(name: string): Promise<void>;
    getDirty(): boolean;
    getName(): string;
    getFirstNightOrder(): bigint[];
    getOtherNightOrder(): bigint[];
}
