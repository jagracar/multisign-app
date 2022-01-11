import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { MultisignContext } from '../context';
import { TezosAddressLink } from '../link';
import { Button } from '../button';


export function Header() {
    return (
        <header className='header-container'>
            <Navigation />
            <Wallet />
        </header>
    );
}

export function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <NavLink to='/'>Multisign</NavLink>
                </li>
                <li>
                    <NavLink to='/proposals'>Proposals</NavLink>
                </li>
                <li>
                    <NavLink to='/create'>Create proposals</NavLink>
                </li>
            </ul>
        </nav>
    );
}

export function Wallet() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    return (
        <div className='sync-container'>
            {context.activeAccount &&
                <TezosAddressLink address={context.activeAccount.address} shorten />
            }
            {context.activeAccount?
                <Button text='unsync' onClick={() => context.disconnectWallet()} /> :
                <Button text='sync' onClick={() => context.connectWallet()} />
            }
        </div>
    );
}
