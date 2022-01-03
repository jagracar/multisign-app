import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';


export function Header() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Select the button to use
    let button;

    if (context.activeAccount) {
        button = <Button text='unsync' onClick={() => context.disconnectWallet()} />;
    } else {
        button = <Button text='sync' onClick={() => context.connectWallet()} />;
    }

    // Set the proposal id to vote
    const proposalId = 12;
    const addUserAddress = "tz1abTpHKkdo5YTM1DosZZVx9p8cjv4hMMTB";
    const removeUserAddress = "tz1g6JRCpsEnD2BLiAzPNK3GBD1fKicV9rCx";

    return (
        <div>
            <h1>Multising control panel</h1>
            {button}
            <Button text='add user proposal' onClick={() => context.createAddUserProposal(addUserAddress)} />
            <Button text='remove user proposal' onClick={() => context.createRemoveUserProposal(removeUserAddress)} />
            <Button text='YES' onClick={() => context.voteProposal(proposalId, true)} />
            <Button text='NO' onClick={() => context.voteProposal(proposalId, false)} />
        </div>
    );
}
