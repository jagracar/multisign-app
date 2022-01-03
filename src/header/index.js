import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';


export function Header() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Select the sync button to use
    let syncButton;

    if (context.activeAccount) {
    	syncButton = <Button text='unsync' onClick={() => context.disconnectWallet()} />;
    } else {
    	syncButton = <Button text='sync' onClick={() => context.connectWallet()} />;
    }

    return (
        <div>
            <h1>Multising control panel</h1>
            {syncButton}
        </div>
    );
}
