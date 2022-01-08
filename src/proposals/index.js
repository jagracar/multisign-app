import React, { useContext } from 'react';
import { Parser, emitMicheline } from '@taquito/michel-codec';
import { encodePubKey } from '@taquito/utils';
import { MultisignContext } from '../context';
import { Button } from '../button';
import { TzktLink, TezosAddressLink } from '../link';


export function Proposals() {
    // Get the multisign context
    const context = useContext(MultisignContext);

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
        <section>
            <h2>Proposals</h2>

            <h3>Active proposals</h3>
            <ProposalList proposals={activeProposals} canVote={context.storage?.users.includes(context.activeAccount?.address)} />

            <h3>Executed proposals</h3>
            <ProposalList proposals={executedProposals} />

            <h3>Expired proposals</h3>
            <ProposalList proposals={expiredProposals} />
        </section>
    );
}

function ProposalList(props) {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Get the minimum votes parameter from the storage
    const minimumVotes = parseInt(context.storage?.minimum_votes);

    return (
        <ul className='proposal-list'>
            {props.proposals.map((proposal) => (
                <li key={proposal.key} className='proposal'>
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
        <>
            <ProposalTimestamp timestamp={props.proposal.timestamp} />
            <ProposalDescription proposal={props.proposal} />
            <ProposalExtraInformation
                proposalId={props.proposalId}
                vote={props.vote}
                positiveVotes={props.proposal.positive_votes}
                voteProposal={props.voteProposal}
                executeProposal={props.executeProposal}
            />
        </>
    );
}

function ProposalTimestamp(props) {
    return (
        <span className='proposal-timestamp'>{props.timestamp}</span>
    );
}

function ProposalDescription(props) {
    // Write a different proposal description depending of the proposal type
    const proposal = props.proposal;
    const kind = proposal.type;
    const issuer = proposal.issuer;

    if (kind === 'text') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to approve the following text...
            </p>
        );
    }

    if (kind === 'transfer_mutez') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to transfer {proposal.mutez_amount/1000000} ꜩ to
                {' '}
                <TezosAddressLink address={proposal.destination} shorten />.
            </p>
        );
    }

    if (kind === 'transfer_token') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to transfer
                {' '}
                {proposal.token_amount} edition{proposal.token_amount > 1? 's' : ''} of token
                {' '}
                <TzktLink address={proposal.token_contract} className='tezos-address'>
                    #{proposal.token_id}
                </TzktLink> to
                {' '}
                <TezosAddressLink address={proposal.destination} shorten />.
            </p>
        );
    }

    if (kind === 'add_user') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to add
                {' '}
                <TezosAddressLink address={proposal.user} shorten /> to the multisign.
            </p>
        );
    }

    if (kind === 'remove_user') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to remove
                {' '}
                <TezosAddressLink address={proposal.user} shorten /> from the multisign.
            </p>
        );
    }

    if (kind === 'minimum_votes') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to change the
                minimum positive votes required to approve a proposal to {proposal.minimum_votes} votes.
            </p>
        );
    }

    if (kind === 'expiration_time') {
        return (
            <p className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to change the
                proposals expiration time to {proposal.expiration_time} days.
            </p>
        );
    }

    if (kind === 'lambda') {
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
            <div className='proposal-description'>
                <p><TezosAddressLink address={issuer} shorten /> proposed to execute a lambda function.</p>

                <details>
                    <summary>See Micheline code</summary>
                    <pre className='micheline-code'>
                        {encodedMichelineCode}
                    </pre>
                </details>
            </div>
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
                <Button text='execute' onClick={() => props.executeProposal(props.proposalId)} />
            }

            <span className={'proposal-votes' + voteClassName}>{props.positiveVotes}</span>

            {props.voteProposal &&
                <Button text='YES' onClick={() => props.voteProposal(props.proposalId, true)} />
            }

            {props.voteProposal &&
                <Button text='NO' onClick={() => props.voteProposal(props.proposalId, false)} />
            }
        </div>
    );
}
