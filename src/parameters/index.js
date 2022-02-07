import React, { useContext } from 'react';
import { MultisigContext } from '../context';
import { TezosAddressLink } from '../link';


export function Parameters() {
    // Get the multisig context
    const context = useContext(MultisigContext);

    return (
        <section>
            <h2>Main parameters</h2>
            <ul className='parameters-list'>
                <li>Multisig users:
                    <ul className='users-list'>
                        {context.storage?.users.map((user, index) => (
                            <li key={index}>
                                <TezosAddressLink
                                    address={user}
                                    className={user === context.activeAccount?.address && 'is-user'}
                                    useAlias
                                />
                            </li>
                        ))}
                    </ul>
                </li>
                <li>Contract address: <TezosAddressLink address={context.contractAddress} /></li>
                <li>Network: {context.network}</li>
                <li>Positive votes needed to execute a proposal: {context.storage?.minimum_votes} votes</li>
                <li>Proposal expiration time: {context.storage?.expiration_time} days</li>
                <li>Balance: {context.balance? context.balance / 1000000 : '0'} ꜩ</li>
            </ul>
        </section>
    );
}
