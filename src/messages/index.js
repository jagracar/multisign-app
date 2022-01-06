import React from 'react';
import { Button } from '../button';


export function ConfirmationMessage(props) {
    return (
        <div className='message-container'>
            <div className='message'>
                <p>
                    {props.message}
                </p>
            </div>
        </div>
    );
}

export function ErrorMessage(props) {
    return (
        <div className='message-container'>
            <div className='message'>
                <p>
                    {props.message}
                </p>

                <Button text='ok' onClick={props.onClick}/>
            </div>
        </div>
    );
}
