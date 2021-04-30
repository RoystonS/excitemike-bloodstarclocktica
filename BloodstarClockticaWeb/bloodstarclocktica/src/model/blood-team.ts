/**
 * enum and related functions for working with Blood on the Clocktower teams
 * @module BloodTeam
 */
export enum BloodTeam {
    TOWNSFOLK = 'townsfolk',
    OUTSIDER = 'outsider',
    MINION = 'minion',
    DEMON = 'demon',
    TRAVELER = 'traveler',
    TOWNSFOLK_DISPLAY = 'Townsfolk',
    OUTSIDER_DISPLAY = 'Outsider',
    MINION_DISPLAY = 'Minion',
    DEMON_DISPLAY = 'Demon',
    TRAVELER_DISPLAY = 'Traveler'
}

/** convert a string to a BloodTeam enum */
export function parseBloodTeam(s:string):BloodTeam {
    switch (s.toLowerCase())
    {
        case "townsfolk":
            return BloodTeam.TOWNSFOLK;
        case "outsider":
            return BloodTeam.OUTSIDER;
        case "minion":
            return BloodTeam.MINION;
        case "demon":
            return BloodTeam.DEMON;
        case "traveller":
        case "traveler":
            return BloodTeam.TRAVELER;
        default:
            return BloodTeam.TOWNSFOLK;
    }
}

/** blood team options prepared for use with a EnumProperty */
export const BLOODTEAM_OPTIONS:ReadonlyArray<{display:string, value:BloodTeam}> = [
    {display: BloodTeam.TOWNSFOLK_DISPLAY, value: BloodTeam.TOWNSFOLK},
    {display: BloodTeam.OUTSIDER_DISPLAY, value: BloodTeam.OUTSIDER},
    {display: BloodTeam.MINION_DISPLAY, value: BloodTeam.MINION},
    {display: BloodTeam.DEMON_DISPLAY, value: BloodTeam.DEMON},
    {display: BloodTeam.TRAVELER_DISPLAY, value: BloodTeam.TRAVELER}
];

/** convert BloodTeam enum to a display string */
export function bloodTeamDisplayString(team:BloodTeam):string {
    switch (team.toLowerCase())
    {
        case "townsfolk":
            return BloodTeam.TOWNSFOLK_DISPLAY;
        case "outsider":
            return BloodTeam.OUTSIDER_DISPLAY;
        case "minion":
            return BloodTeam.MINION_DISPLAY;
        case "demon":
            return BloodTeam.DEMON_DISPLAY;
        case "traveller":
        case "traveler":
            return BloodTeam.TRAVELER_DISPLAY;
        default:
            return BloodTeam.TOWNSFOLK_DISPLAY;
    }
}