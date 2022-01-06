import React from 'react';


export function TezosAddressLink(props) {
    return (
        <a href={'https://tzkt.io/' + props.address} target='_blank' rel='noreferrer' className={props.isUser? 'tezos-address is-user' : 'tezos-address'}>
            {props.shorten? props.address.slice(0, 5) + '...' + props.address.slice(-5) : props.address}
        </a>
    );
}
