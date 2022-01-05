import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';
import { TezosAddressLink } from '../link';


export function Header() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Get the connected wallet address if there is an active account
    const address = context.activeAccount?.address;

    // Defined the sync button to use
    const syncButton = context.activeAccount?
        <Button text='unsync' onClick={() => context.disconnectWallet()} /> :
        <Button text='sync' onClick={() => context.connectWallet()} />;

    return (
        <header className='header-container'>
            <h1>Multising control panel</h1>

            <div className='sync-container'>
                {address && <TezosAddressLink address={address} shorten />}
                {syncButton}
            </div>
        </header>
    );
}
