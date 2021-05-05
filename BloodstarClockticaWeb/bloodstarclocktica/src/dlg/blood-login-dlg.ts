/**
 * dialog to prompt for username and password
 * @module BloodLogin
 */
import { CreateElementsOptions } from '../util';
import {ButtonCfg, AriaDialog} from './aria-dlg';

export type UserPass = {username:string,password:string};

class LoginDlg extends AriaDialog<UserPass> {
    private username:string = '';
    private password:string = '';

    async open(prompt:string):Promise<UserPass|null> {
        const body:CreateElementsOptions = [{
            t:'p',
            a:{role:'alert'},
            txt:prompt,
        },{
            t:'div',
            css:['twoColumnGrid'],
            children:[{
                    t:'label',
                    a:{'for':'loginDlgUsername'},
                    txt:'Username',
                },
                {
                    t:'input',
                    a:{'type':'text','required':'true','id':'loginDlgUsername'},
                    events:{'change':(event=>(this.username = (event.target as HTMLInputElement).value))},
                },{
                    t:'label',
                    a:{'for':'loginDlgPassword'},
                    txt:'Password',
                },{
                    t:'input',
                    a:{'type':'password','required':'true','id':'loginDlgPassword'},
                    events:{'change':(event=>(this.password = (event.target as HTMLInputElement).value))},
                },
            ]
        }];

        const buttons:ButtonCfg[] = [{
            label:'Ok',
            callback:async ()=>({
                username:this.username,
                password:this.password
        })}];

        return await this.baseOpen(
            document.activeElement,
            'login',
            body,
            buttons
        );
    }
}

/**
 * bring up the popup asking the user for a string
 * returns a promise that resolves to the entered
 * string or null if the user cancelled
 */
export async function show(prompt:string):Promise<UserPass|null> {
    return new LoginDlg().open(prompt);
}
