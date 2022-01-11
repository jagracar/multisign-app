import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { TezosAddressLink } from '../link';


export function Parameters() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    return (
        <section>
            <h2>Main parameters</h2>
            <ul className='parameters-list'>
                <li>Multisign users:
                    <ul className='users-list'>
                        {context.storage?.users.map((user, index) => (
                            <li key={index}>
                                <TezosAddressLink
                                    address={user}
                                    isUser={user === context.activeAccount?.address}
                                />
                            </li>
                        ))}
                    </ul>
                </li>
                <li>Contract address: <TezosAddressLink address={context.contractAddress} /></li>
                <li>Positive votes needed to execute a proposal: {context.storage?.minimum_votes} votes</li>
                <li>Proposal expiration time: {context.storage?.expiration_time} days</li>
                <li>Balance: {context.balance? context.balance / 1000000 : '0'} ꜩ</li>
            </ul>
        </section>
    );
}
