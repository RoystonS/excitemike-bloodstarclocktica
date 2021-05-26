/**
 * Help messages
 * @module HelpDlg
 */
import { CreateElementsOptions } from '../util';
import {showDialog} from './aria-dlg'

export default async function show():Promise<void>{
    const body:CreateElementsOptions = [{t:'div',a:{style:'width:500px;'},children:[
        {t:'h1',txt:'Bloodstar Clocktica'},
        {t:'p',html:
            'Bloodstar Clocktica is a tool for creating custom scripts with '+
            'custom characters and matching almanacs for playing '+
            '<a href="https://bloodontheclocktower.com/">Blood on the Clocktower</a> '+
            'using <a href="https://clocktower.online/">clocktower.online</a>.'
        }
        // TODO: this could stand to be filled out in a LOT more detail
    ]}];

    await showDialog<void>(
        document.activeElement,
        'help',
        body,
        [{label:"OK"}]
    );
}