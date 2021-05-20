/**
 * sign up as a Bloodstar Clocktica user
 * @module SignUpDlg
 */
import { createElement, CreateElementsOptions } from '../util';
import {AriaDialog, ButtonCfg, showDialog} from './aria-dlg';
import {show as showMessage, showError} from './blood-message-dlg';
import {confirmEmail, resendSignUpConfirmation, SessionInfo, signUp} from '../iam';

export type UserPass = {username:string,password:string};
const VALID_USERNAME_RE = /^[^.\\/:"?<>|][^\\/:"?<>|]+$/;

// this regex comes from the HTML5 spec https://html.spec.whatwg.org/multipage/input.html#e-mail-state-(type%3Demail)
// this does reject technically-valid email addresses but it handles the sort I care to support with this app
const VALID_EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * do the sign-up flow
 * @returns Promise that resolves to SessionInfo if sign-up completes
 */
async function show():Promise<SessionInfo|null>{
    const email = await showSignUpStep();
    if (!email) {return null;}
    return await showConfirmStep(email);
}

class ConfirmSignUpDlg extends AriaDialog<string> {
    async open(email:string,doWarning:boolean):Promise<string>{
        const body:CreateElementsOptions = [{t:'h1',txt:'Confirm email address'}];
        if (doWarning) {
            body.push({t:'p',a:{style:'color:red;max-width:400px'},txt:'Your account must be confirmed before you can continue. Please check your email for the six-digit code.'});
        }
        const syncButton = ()=>{
            const inputElement = document.getElementById('codeFromEmail');
            if (!(inputElement instanceof HTMLInputElement)){return;}
            const buttonElement = document.getElementById('continueBtn');
            if (!(buttonElement instanceof HTMLButtonElement)){return;}
            const codeValue = parseInt(inputElement.value);
            buttonElement.disabled = isNaN(codeValue);
        };
        body.splice(body.length,0,...[
            {t:'p',a:{style:'max-width:400px'},txt:`We have sent an email to "${email}" containing a 6-digit code. Please enter the code below, then click the button below to continue.`},
            {t:'input',a:{type:'text',minlength:'6',maxlength:'6',autocomplete:'off',required:'',pattern:'[0-9]{6}',title:'six-digit code from your email'},id:'codeFromEmail',events:{input:syncButton,change:syncButton}},
            {t:'div',css:['dialogBtnGroup'],children:[
                {t:'button',id:'continueBtn',txt:'Continue',a:{disabled:true},events:{click:()=>{
                    const inputElement = document.getElementById('codeFromEmail');
                    if (!(inputElement instanceof HTMLInputElement)){this.close(); return;}
                    this.close(inputElement.value);
                }}},
                {t:'button',txt:'Cancel',events:{click:()=>this.close('')}}
            ]},
            {t:'p',txt:"Didn't receive a link? ",a:{style:'align-self:center;'},children:[
                {t:'a',a:{href:'#'},txt:'Send a new one',events:{click:async ()=>await resendSignUpConfirmation(email)}}
            ]}
        ] as CreateElementsOptions);
        return await this.baseOpen(null,'confirm-sign-up',body,[])||'';
    }
}

/** show dialog for confirm step */
async function showConfirmStep(email:string):Promise<SessionInfo|null>{
    // TODO: enter code rather than click link
    let warn = false;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const code = await new ConfirmSignUpDlg().open(email,warn);
        if (!code){return null;}
        warn = true;
        try {
            const sessionInfo = await confirmEmail(email, code);
            if (!sessionInfo){continue;}
            return sessionInfo;
        } catch (error) {
            await showError('Error', 'Error confirming email address', error);
        }
    }
}

/**
 * show dialog for initial sign up
 * @returns email address to which a confirmation email was sent, or the empty string
 */
async function showSignUpStep():Promise<string>{
    // TODO: check availability
    const usernameField = createElement({t:'input',a:{type:'text',required:'true',placeholder:'Username',autocomplete:'username'},id:'signUpDlgUsername'});
    const usernameWarnings = createElement({t:'div',css:['column'],a:{style:'color:red;grid-column-start:span 2'}});
    const emailField = createElement({t:'input',a:{type:'email',required:'true',placeholder:'name@host.com',autocomplete:'email'},id:'signUpDlgEmail'});
    const emailWarnings = createElement({t:'div',css:['column'],a:{style:'color:red;grid-column-start:span 2'}});
    const passwordField = createElement({t:'input',a:{type:'password',required:'true',placeholder:'Password',autocomplete:'new-password'},'id':'signInDlgPassword'});
    const passwordWarnings = createElement({t:'div',css:['column'],a:{style:'color:red;grid-column-start:span 2'}});
    const confirmField = createElement({t:'input',a:{type:'password',required:'true',placeholder:'Password',autocomplete:'new-password'},'id':'signInDlgPasswordConfirm'});
    const body:CreateElementsOptions = [
        {t:'h1',a:{role:'alert'},txt:'Create an Account'},
        {t:'div',css:['twoColumnGrid'],children:[
            {t:'label',a:{'for':'signUpDlgUsername'},txt:'Username'},
            usernameField,
            usernameWarnings,
            {t:'label',a:{'for':'signUpDlgEmail'},txt:'Email'},
            emailField,
            emailWarnings,
            {t:'label',a:{'for':'signInDlgPassword'},txt:'Password'},
            passwordField,
            {t:'label',a:{'for':'signInDlgPasswordConfirm'},txt:'Confirm Password'},
            confirmField,
        ]},
        passwordWarnings,
    ];
    const syncToButton = ()=>{
        const buttonElem = document.getElementById('signupBtn');
        if (!(buttonElem instanceof HTMLButtonElement)) {return;}
        buttonElem.disabled = !(validateUsername(usernameField.value) && validateEmail(emailField.value) && validatePassword(passwordField.value) && (passwordField.value === confirmField.value));
    };
    const usernameWarn = ()=>{
        updateUsernameWarnings(usernameField.value, usernameWarnings);
        syncToButton();
    };
    const emailWarn = ()=>{
        updateEmailWarnings(emailField.value, emailWarnings);
        syncToButton();
    };
    const passwordWarn = ()=>{
        updatePasswordWarnings(passwordField.value,confirmField.value,passwordWarnings);
        syncToButton();
    };
    usernameField.addEventListener('change',usernameWarn);
    usernameField.addEventListener('input',usernameWarn);
    emailField.addEventListener('change',emailWarn);
    emailField.addEventListener('input',emailWarn);
    passwordField.addEventListener('change',passwordWarn);
    passwordField.addEventListener('input',passwordWarn);
    confirmField.addEventListener('change',passwordWarn);
    confirmField.addEventListener('input',passwordWarn);

    const getResult = async ():Promise<string>=>{
        if (!validateUsername(usernameField.value)) {await showMessage('Sign Up Error', 'Username not valid.'); return '';}
        if (!validateEmail(emailField.value)) {await showMessage('Sign Up Error', 'Invalid email address.'); return '';}
        if (!validatePassword(passwordField.value)) {await showMessage('Sign Up Error', 'Passwords did not meet requirements.'); return '';}
        if (passwordField.value !== confirmField.value) {await showMessage('Sign Up Error', 'Passwords did not match!'); return '';}
        try {
            const email = await signUp(usernameField.value, passwordField.value, emailField.value);
            return email;
        } catch (error) {
            await showError('Sign Up Error', 'Something went wrong during sign-up:', error);
        }
        return '';
    };
    
    const buttons:ButtonCfg<string>[] = [
        {label:'Sign up',callback:getResult,disabled:true,id:'signupBtn'},
        {label:'I already have an account',callback:()=>''}];

    return await showDialog<string>(
        document.activeElement,
        'sign-up-dlg',
        body,
        buttons
    ) || '';
}

/** warn if email does not look valid */
function updateEmailWarnings(email:string, container:HTMLElement):void{
    container.innerText = '';
    if (!validateEmail(email)) {
        container.appendChild(createElement({t:'span',txt:`× Invalid email`}));
    }
}

/** check each password requirement and add a warning if any aren't met */
function updatePasswordWarnings(password:string, passwordConfirm:string, container:HTMLElement):void {
    container.innerText = '';
    function warn(txt:string){container.appendChild(createElement({t:'span',txt:`× ${txt}`}));}
    if (password.length < 8) {warn('Password must contain at least 8 characters');}
    if (!/[a-z]/.test(password)) {warn('Password must contain a lower case letter');}
    if (!/[A-Z]/.test(password)) {warn('Password must contain an upper case letter');}
    if (!/[0-9]/.test(password)) {warn('Password must contain a number');}
    if (password !== passwordConfirm) {warn(`Passwords must match`)}
}

/** warn if username does not look valid */
function updateUsernameWarnings(username:string, container:HTMLElement):void {
    container.innerText = '';
    if (!validateUsername(username)){
        container.appendChild(createElement({t:'span',txt:`× Invalid username`}));
    }
}

/** test email */
function validateEmail(email:string):boolean {
    return VALID_EMAIL_RE.test(email);
}

/** test all the password requirements */
function validatePassword(password:string):boolean {
    if (password.length < 8) {return false;}
    if (!/[a-z]/.test(password)) {return false;}
    if (!/[A-Z]/.test(password)) {return false;}
    if (!/[0-9]/.test(password)) {return false;}
    return true;
}

/** check that the username looks valid */
function validateUsername(username:string):boolean {
    return VALID_USERNAME_RE.test(username);
}

export default show;