/**
 * dialog to prompt for username and password
 * @module BloodLogin
 */
import { CreateElementsOptions } from '../util';
import {ButtonCfg, AriaDialog} from './aria-dlg';

export type UserPass = {username:string,password:string};

class LoginDlg extends AriaDialog<UserPass> {
    canCancel():boolean{return false;}
    async open(prompt:string):Promise<UserPass|null> {
        const submitOnEnter = (event:KeyboardEvent):void=>{
            switch (event.code)
            {
                case 'NumpadEnter':
                case 'Enter':
                    event.preventDefault();
                    this.close(this.getResult());
                    break;
            }
        };
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
                    txt:'Username'
                },
                {
                    t:'input',
                    a:{'type':'text','required':'true','id':'loginDlgUsername'},
                    events:{keyup:submitOnEnter as EventListener}
                },{
                    t:'label',
                    a:{'for':'loginDlgPassword'},
                    txt:'Password'
                },{
                    t:'input',
                    a:{'type':'password','required':'true','id':'loginDlgPassword'},
                    events:{keyup:submitOnEnter as EventListener}
                },
            ]
        }];
        const buttons:ButtonCfg<UserPass>[] = [{
            label:'OK',
            callback:()=>this.getResult()}];

        return await this.baseOpen(
            document.activeElement,
            'login',
            body,
            buttons
        );
    }

    /** look at input elements to get dialog result value */
    private getResult():UserPass {
        return {
            username:this.getValue('loginDlgUsername'),
            password:this.getValue('loginDlgPassword')
        };
    }

    /** get a value from a field by id */
    private getValue(id:string):string {
        const elem = this.getElementById(id);
        if (!(elem instanceof HTMLInputElement)){return '';}
        return elem.value;
    }
}

/**
 * bring up the popup asking the user for a string
 * returns a promise that resolves to the entered
 * string or null if the user cancelled
 */
export function show(prompt:string):Promise<UserPass|null> {
    return new LoginDlg().open(prompt);
}
