/**
 * dialog to prompt for username and password
 * @module SignInFlow
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';
import showSignUpFlow from './sign-up-flow';
import showResetPasswordFlow from './reset-password-flow';
import { SessionInfo, signIn } from '../iam';

class SignInDlg extends AriaDialog<SessionInfo> {
    canCancel():boolean{return false;}

    /** get a value from a field by id */
    private getValue(id:string):string {
        const inputElement = this.querySelector<HTMLInputElement>(`#${id}`);
        return inputElement ? inputElement.value : '';
    }

    async open(prompt:string):Promise<SessionInfo|null> {
        const submitOnEnter = async (event:KeyboardEvent):Promise<void>=>{
            switch (event.code)
            {
                case 'NumpadEnter':
                case 'Enter':
                    event.preventDefault();
                    this.close(await this.signIn());
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
                a:{type:'text',required:'true',id:'signInDlgUsername',placeholder:'Username or email',autocomplete:'username',autofocus:'true'},
                events:{keyup:submitOnEnter as unknown as EventListener}
            },{
                t:'label',
                a:{'for':'signInDlgPassword'},
                txt:'Password'
            },{
                t:'input',
                a:{type:'password',required:'true',id:'signInDlgPassword',placeholder:'Password',autocomplete:'current-password'},
                events:{keyup:submitOnEnter as unknown as EventListener}
            }]
        },{
            t:'a',
            a:{href:'#',style:'align-self:center'},
            txt:'Forgot your password?',
            events:{click:async()=>this.close(await showResetPasswordFlow())}
        },{
            t:'button',
            txt:'Sign in',
            events:{click:async ()=>this.close(await this.signIn())}
        },{
            t:'div',
            txt:'Need an account? ',
            a:{style:'align-self:center'},
            children:[{
                t:'a',
                a:{href:'#'},
                txt:'Sign Up',
                events:{click:async ()=>{
                    const signUpResult = await showSignUpFlow();
                    if (signUpResult) {
                        this.close(signUpResult);
                    }
                }}
            }]
        }];

        return await this.baseOpen(
            document.activeElement,
            'sign-in',
            body,
            []
        );
    }

    /** look at input elements to get dialog result value */
    private async signIn():Promise<SessionInfo|null> {
        const username = this.getValue('signInDlgUsername');
        const password = this.getValue('signInDlgPassword');
        return await signIn(username, password)
    }
}

/**
 * bring up the popup asking the user for a string
 * returns a promise that resolves to the entered
 * string or null if the user cancelled
 */
export async function show(prompt:string):Promise<SessionInfo|null> {
    return await new SignInDlg().open(prompt);
}
