import React, { useContext } from 'react';
import { MultisigContext } from '../context';
import { tokens } from '../utils';


export function DefaultLink(props) {
    return (
        <a href={props.href} target='_blank' rel='noreferrer' className={props.className? props.className : ''}>
            {props.children}
        </a>
    );
}

export function TzktLink(props) {
    // Get the multisig context
    const context = useContext(MultisigContext);

    return (
        <DefaultLink href={`https://${context.network}.tzkt.io/${props.address}`} className={props.className? props.className : ''}>
            {props.children}
        </DefaultLink>
    );
}

export function TezosAddressLink(props) {
    // Get the multisig context
    const context = useContext(MultisigContext);

    // Get the user alias
    const alias = context.userAliases && context.userAliases[props.address];

    return (
        <TzktLink address={props.address} className={`tezos-address ${props.className? props.className : ''}`}>
            {props.useAlias && alias?
                alias :
                props.shorten? props.address.slice(0, 5) + '...' + props.address.slice(-5) : props.address
            }
        </TzktLink>
    );
}

export function TokenLink(props) {
    const token = tokens.find(token => token.fa2 === props.fa2);

    if (token?.website) {
        return (
            <DefaultLink href={token.website + props.id} className={`token-link ${props.className? props.className : ''}`}>
                {props.children}
            </DefaultLink>
        );
    } else {
        return (
            <TzktLink address={props.fa2} className={`token-link ${props.className? props.className : ''}`}>
                {props.children}
            </TzktLink>
        );
    }
}

export function IpfsLink(props) {
    return (
        <DefaultLink href={`https://infura-ipfs.io/ipfs/${props.path}`} className={`ipfs-link ${props.className? props.className : ''}`}>
            {props.children? props.children : props.path}
        </DefaultLink>
    );
}
