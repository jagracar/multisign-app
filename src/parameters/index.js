import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { TezosAddressLink } from '../link';


export function Parameters() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Build the user items
    const userItems = context.storage?.users.map((user) => (
        <li key={user}>
            <TezosAddressLink address={user} isUser={user === context.activeAccount?.address} />
        </li>
    ));

    return (
        <section>
            <h2>Multisign parameters</h2>

            <ul className='parameters-list'>
                <li>Multisign users:
                    <ul className='users-list'>
                        {userItems}
                    </ul>
                </li>
                <li>Positive votes needed to execute a proposal: {context.storage?.minimum_votes} votes</li>
                <li>Proposal expiration time: {context.storage?.expiration_time} days</li>
            </ul>
        </section>
    );
}
