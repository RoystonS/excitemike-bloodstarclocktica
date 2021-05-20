/**
 * dialog to prompt for username and password
 * @module SignInFlow
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';
import showSignUpFlow from './sign-up-flow';
import showForgotPasswordFlow from './forgot-password-flow';
import { SessionInfo, signIn } from '../iam';

export type UserPass = {username:string,password:string};

class SignInDlg extends AriaDialog<UserPass> {
    canCancel():boolean{return false;}

    /** look at input elements to get dialog result value */
    private getResult():UserPass {
        return {
            username:this.getValue('signInDlgUsername'),
            password:this.getValue('signInDlgPassword')
        };
    }

    /** get a value from a field by id */
    private getValue(id:string):string {
        const inputElement = this.querySelector<HTMLInputElement>(`#${id}`);
        return inputElement ? inputElement.value : '';
    }

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
            t:'h1',
            a:{role:'alert'},
            txt:prompt,
        },{
            t:'div',
            css:['twoColumnGrid'],
            children:[{
                t:'label',
                a:{'for':'signInDlgUsername'},
                txt:'Username or email'
            },
            {
                t:'input',
                a:{'type':'text','required':'true','id':'signInDlgUsername',placeholder:'Username or email'},
                events:{keyup:submitOnEnter as EventListener}
            },{
                t:'label',
                a:{'for':'signInDlgPassword'},
                txt:'Password'
            },{
                t:'input',
                a:{'type':'password','required':'true','id':'signInDlgPassword'},
                events:{keyup:submitOnEnter as EventListener}
            }]
        },{
            t:'a',
            a:{href:'#',style:'align-self:center'},
            txt:'Forgot your password?',
            events:{click:async()=>await showForgotPasswordFlow()}
        },{
            t:'button',
            txt:'Sign in',
            events:{click:()=>this.close(this.getResult())}
        },{
            t:'div',
            txt:'Need an account? ',
            a:{style:'align-self:center'},
            children:[{
                t:'a',
                a:{href:'#'},
                txt:'Sign Up',
                events:{click:async ()=>await showSignUpFlow()}
            }]
        }];

        return await this.baseOpen(
            document.activeElement,
            'sign-in',
            body,
            []
        );
    }
}

/**
 * bring up the popup asking the user for a string
 * returns a promise that resolves to the entered
 * string or null if the user cancelled
 */
export async function show(prompt:string):Promise<SessionInfo|null> {
    const signInResult = await new SignInDlg().open(prompt);
    if (!signInResult){return null;}
    const {username,password} = signInResult;
    return await signIn(username, password);
}
