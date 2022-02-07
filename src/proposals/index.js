import React, { useContext } from 'react';
import { Parser, emitMicheline } from '@taquito/michel-codec';
import { encodePubKey } from '@taquito/utils';
import { MultisigContext } from '../context';
import { Button } from '../button';
import { TezosAddressLink, TokenLink, IpfsLink } from '../link';
import { tokens, hexToString } from '../utils';


export function Proposals() {
    // Get the multisig context
    const context = useContext(MultisigContext);

    // Separate the proposals between executed, expired and active proposals
    const executedProposals = [];
    const expiredProposals = [];
    const activeProposals = [];

    if (context.proposals && context.storage) {
        // Get the expiration time parameter from the storage
        const expirationTime = parseInt(context.storage.expiration_time);

        // Loop over the complete list of proposals
        const now = new Date();

        for (const proposal of context.proposals) {
            // Check if the proposal has been executed already
            if (proposal.value.executed) {
                executedProposals.push(proposal);
                continue;
            }

            // Check if the proposal has expired
            const expirationDate = new Date(proposal.value.timestamp);
            expirationDate.setDate(expirationDate.getDate() + expirationTime);

            if (now > expirationDate) {
                expiredProposals.push(proposal);
                continue;
            }

            // The proposal is still active
            activeProposals.push(proposal);
        }
    }

    return (
        <>
            <section>
                <h2>Active proposals</h2>
                <ProposalList proposals={activeProposals} canVote={context.storage?.users.includes(context.activeAccount?.address)} />
            </section>

            <section>
                <h2>Executed proposals</h2>
                <ProposalList proposals={executedProposals} />
            </section>

            <section>
                <h2>Expired proposals</h2>
                <ProposalList proposals={expiredProposals} />
            </section>
        </>
    );
}

function ProposalList(props) {
    // Get the multisig context
    const context = useContext(MultisigContext);

    // Get the minimum votes parameter from the storage
    const minimumVotes = parseInt(context.storage?.minimum_votes);

    return (
        <ul className='proposal-list'>
            {props.proposals.map((proposal) => (
                <li key={proposal.key}>
                    <Proposal
                        proposalId={proposal.key}
                        proposal={proposal.value}
                        vote={context.userVotes? context.userVotes[proposal.key] : undefined}
                        voteProposal={props.canVote? context.voteProposal : undefined}
                        executeProposal={(props.canVote && proposal.value.positive_votes >= minimumVotes)? context.executeProposal : undefined}
                    />
                </li>
            ))}
        </ul>
    );
}

function Proposal(props) {
    return (
        <div className='proposal'>
            <ProposalTimestamp timestamp={props.proposal.timestamp} />
            <ProposalDescription
                id={props.proposalId}
                proposal={props.proposal} />
            <ProposalExtraInformation
                id={props.proposalId}
                vote={props.vote}
                positiveVotes={props.proposal.positive_votes}
                voteProposal={props.voteProposal}
                executeProposal={props.executeProposal}
            />
        </div>
    );
}

function ProposalTimestamp(props) {
    return (
        <span className='proposal-timestamp'>{props.timestamp}</span>
    );
}

function ProposalDescription(props) {
    return (
        <div className='proposal-description'>
            <ProposalId id={props.id} />
            <ProposalDescriptionIntro issuer={props.proposal.issuer} />
            {' '}
            <ProposalDescriptionContent proposal={props.proposal} />
        </div>
    );
}

function ProposalId(props) {
    return (
        <span className='proposal-id'>#{props.id}</span>
    );
}

function ProposalDescriptionIntro(props) {
    return (
        <span>
            <TezosAddressLink address={props.issuer} useAlias shorten /> proposed to
        </span>
    );
}

function ProposalDescriptionContent(props) {
    // Write a different proposal description depending of the proposal kind
    const proposal = props.proposal;
    const kind = proposal.kind;

    if (kind.hasOwnProperty('text')) {
        return (
            <span>
                approve a <IpfsLink path={proposal.text? hexToString(proposal.text).split('/')[2] : ''}>text proposal</IpfsLink>.
            </span>
        );
    }

    if (kind.hasOwnProperty('transfer_mutez')) {
        // Extract the transfers information
        const transfers = proposal.mutez_transfers;
        const nTransfers = transfers.length;
        const totalAmount = transfers.reduce((previous, current) => previous + parseInt(current.amount), 0);

        if (nTransfers === 1) {
            return (
                <span>
                    transfer {transfers[0].amount / 1000000} ꜩ to <TezosAddressLink address={transfers[0].destination} useAlias shorten />.
                </span>
            );
        } else {
            return (
                <>
                    <span>
                        transfer {totalAmount / 1000000} ꜩ.
                    </span>
                    <details>
                        <summary>See transfer details</summary>
                        <table>
                            <tbody>
                                {transfers.map((transfer, index) => (
                                    <tr key={index}>
                                        <td>
                                            {transfer.amount / 1000000} ꜩ to
                                        </td>
                                        <td>
                                            <TezosAddressLink address={transfer.destination} useAlias shorten />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </details>
                </>
            );
        }
    }

    if (kind.hasOwnProperty('transfer_token')) {
        // Extract the transfers information
        const fa2 = proposal.token_transfers.fa2;
        const tokenId = proposal.token_transfers.token_id;
        const transfers = proposal.token_transfers.distribution;
        const nTransfers = transfers.length;
        const nEditions = transfers.reduce((previous, current) => previous + parseInt(current.amount), 0);
        const token = tokens.find(token => token.fa2 === fa2);

        if (nTransfers === 1) {
            return (
                <span>
                    transfer {transfers[0].amount}
                    {' '}
                    {token?.multiasset? `edition${transfers[0].amount > 1? 's' : ''} of token` : ''}
                    {' '}
                    <TokenLink fa2={fa2} id={tokenId}>
                        {token? (token.multiasset? '#' + tokenId : token.name) : 'tokens'}
                    </TokenLink>
                    {' '}
                    to <TezosAddressLink address={transfers[0].destination} useAlias shorten />.
                </span>
            );
        } else {
            return (
                <>
                    <span>
                        transfer {nEditions}
                        {' '}
                        {token?.multiasset? 'editions of token' : ''}
                        {' '}
                        <TokenLink fa2={fa2} id={tokenId}>
                            {token? (token.multiasset? '#' + tokenId : token.name) : 'tokens'}
                        </TokenLink>.
                    </span>
                    <details>
                        <summary>See transfer details</summary>
                        <table>
                            <tbody>
                                {transfers.map((transfer, index) => (
                                    <tr key={index}>
                                        <td>
                                            {transfer.amount}
                                            {' '}
                                            {token?.multiasset? `edition${transfer.amount > 1? 's' : ''}` : ''} to
                                        </td>
                                        <td>
                                            <TezosAddressLink address={transfer.destination} useAlias shorten />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </details>
                </>
            );            
        }
    }

    if (kind.hasOwnProperty('add_user')) {
        return (
            <span>
                add <TezosAddressLink address={proposal.user}  shorten /> to the multisig.
            </span>
        );
    }

    if (kind.hasOwnProperty('remove_user')) {
        return (
            <span>
                remove <TezosAddressLink address={proposal.user} useAlias shorten /> from the multisig.
            </span>
        );
    }

    if (kind.hasOwnProperty('minimum_votes')) {
        return (
            <span>
                change the minimum positive votes required to approve a proposal to {proposal.minimum_votes} votes.
            </span>
        );
    }

    if (kind.hasOwnProperty('expiration_time')) {
        return (
            <span>
                change the proposals expiration time to {proposal.expiration_time} days.
            </span>
        );
    }

    if (kind.hasOwnProperty('lambda_function')) {
        // Transform the lambda function Michelson JSON code to Micheline code
        const parser = new Parser();
        const michelsonCode = parser.parseJSON(JSON.parse(proposal.lambda_function));
        const michelineCode = emitMicheline(michelsonCode, {indent:'    ', newline: '\n',});

        // Encode any addresses that the Micheline code might contain
        const encodedMichelineCode = michelineCode.replace(
            /0x0[0123]{1}[\w\d]{42}/g,
            (match) => `"${encodePubKey(match.slice(2))}"`
        );

        return (
            <>
                <span>
                    execute a lambda function.
                </span>
                <details>
                    <summary>See Micheline code</summary>
                    <pre className='micheline-code'>
                        {encodedMichelineCode}
                    </pre>
                </details>
            </>
        );
    }

    return null;
}

function ProposalExtraInformation(props) {
    // Get the vote class name
    let voteClassName = '';

    if (props.vote !== undefined) {
        voteClassName = props.vote? ' yes-vote' : ' no-vote';
    }

    return (
        <div className='proposal-extra-information'>
            {props.executeProposal &&
                <Button text='execute' onClick={() => props.executeProposal(props.id)} />
            }

            <span className={'proposal-votes' + voteClassName}>{props.positiveVotes}</span>

            {props.voteProposal &&
                <Button text='YES' onClick={() => props.voteProposal(props.id, true)} />
            }

            {props.voteProposal &&
                <Button text='NO' onClick={() => props.voteProposal(props.id, false)} />
            }
        </div>
    );
}
