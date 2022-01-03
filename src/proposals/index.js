import React from 'react';


export function Proposals() {
    // Define the proposals information
    const proposals = [
        {id: '0', text: 'aaa'},
        {id: '1', text: 'bbb'},
        {id: '2', text: 'ccc'},
        {id: '3', text: 'ddd'}
    ];

    // Build the proposal items
    const proposalItems = proposals.map((proposal) => (
        <li key={proposal.id}>
            {proposal.text}
        </li>
    ));

    return (
        <div>
            <h3>Proposals</h3>
            <ul>
                {proposalItems}
            </ul>
        </div>
    );
}
