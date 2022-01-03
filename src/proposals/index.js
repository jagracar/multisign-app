import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';


export function Proposals() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Set the proposals parameters
    const addUserAddress = "tz1abTpHKkdo5YTM1DosZZVx9p8cjv4hMMTB";
    const removeUserAddress = "tz1g6JRCpsEnD2BLiAzPNK3GBD1fKicV9rCx";
    const minimumVotes = 3;
    const expirationTime = 10;

    // Define the proposals information
    const proposals = [
        {id: '0', text: 'aaa'},
        {id: '1', text: 'bbb'},
        {id: '2', text: 'ccc'},
        {id: '3', text: 'ddd'}
    ];

    // Build the proposal items
    const proposalItems = proposals.map((proposal) => (
        <Proposal key={proposal.id} text={proposal.text} id={proposal.id} />
    ));

    return (
        <div>
            <h3>Proposals</h3>

            <Button text='add user proposal' onClick={() => context.createAddUserProposal(addUserAddress)} />
            <Button text='remove user proposal' onClick={() => context.createRemoveUserProposal(removeUserAddress)} />
            <Button text='minimum votes proposal' onClick={() => context.createMinimumVotesProposal(minimumVotes)} />
            <Button text='expiration time proposal' onClick={() => context.createExpirationTimeProposal(expirationTime)} />

            <ul>
            	{proposalItems}
            </ul>
        </div>
    );
}

export function Proposal(props) {
    // Get the multisign context
    const context = useContext(MultisignContext);

    return (
    	<li>
            {props.text}
        	<Button text='YES' onClick={() => context.voteProposal(props.id, true)} />
        	<Button text='NO' onClick={() => context.voteProposal(props.id, false)} />
        </li>
    );
}
