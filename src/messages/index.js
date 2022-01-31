import React from 'react';
import { Button } from '../button';


export function InformationMessage(props) {
    return (
        <div className='message-container'>
            <div className='information-message'>
                <p>{props.message}</p>
            </div>
        </div>
    );
}

export function ConfirmationMessage(props) {
    return (
        <div className='message-container'>
            <div className='confirmation-message'>
                <p>{props.message}</p>
                <Button text='ok' onClick={props.onClick}/>
            </div>
        </div>
    );
}

export function ErrorMessage(props) {
    return (
        <div className='message-container'>
            <div className='error-message'>
                <p>{props.message}</p>
                <Button text='ok' onClick={props.onClick}/>
            </div>
        </div>
    );
}
