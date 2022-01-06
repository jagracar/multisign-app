import React, { useContext } from 'react';
import { MultisignContext } from '../context';


export function Link(props) {
    return (
        <a href={props.href} target='_blank' rel='noreferrer' className={props.className}>
            {props.children}
        </a>
    );
}

export function TzktLink(props) {
    // Get the multisign context
    const context = useContext(MultisignContext);

    return (
        <Link href={`https://${context.network}.tzkt.io/${props.address}`} className={props.className}>
            {props.children}
        </Link>
    );
}

export function TezosAddressLink(props) {
    return (
        <TzktLink address={props.address} className={props.isUser? 'tezos-address is-user' : 'tezos-address'}>
            {props.shorten? props.address.slice(0, 5) + '...' + props.address.slice(-5) : props.address}
        </TzktLink>
    );
}
