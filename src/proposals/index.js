import React, { useContext } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';
import { TezosAddressLink } from '../link';


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
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to approve the following text...
            </span>
        );
    }

    if (kind === 'transfer_mutez') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to transfer mutez to a given account.
            </span>
        );
    }

    if (kind === 'transfer_token') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to transfer tokens to a given account.
            </span>
        );
    }

    if (kind === 'add_user') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to add <TezosAddressLink address={proposal.user} /> to the multisign.
            </span>
        );
    }

    if (kind === 'remove_user') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to remove <TezosAddressLink address={proposal.user} /> from the multisign.
            </span>
        );
    }

    if (kind === 'minimum_votes') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to change the minimum positive votes required to approve a proposal to {proposal.minimum_votes} votes.
            </span>
        );
    }

    if (kind === 'expiration_time') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to change the proposals expiration time to {proposal.expiration_time} days.
            </span>
        );
    }

    if (kind === 'lambda') {
        return (
            <span className='proposal-description'>
                <TezosAddressLink address={issuer} shorten /> proposed to execute a lambda function.
            </span>
        );
    }

    return;
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
