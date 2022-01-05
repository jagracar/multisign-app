import React, { useContext, useState } from 'react';
import { MultisignContext } from '../context';


export function ProposalForms(props) {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Return if the user is not connected or is not one of the multisign users
    if (!(context.activeAccount && context.storage?.users.includes(context.activeAccount.address))) {
        return <></>;
    }

    return (
        <section>
            <h2>Create new proposals:</h2>

            <AddUserProposalForm
                defaultValue='tz1abTpHKkdo5YTM1DosZZVx9p8cjv4hMMTB'
                handleSubmit={context.createAddUserProposal}
            />
            <RemoveUserProposalForm
                defaultValue='tz1g6JRCpsEnD2BLiAzPNK3GBD1fKicV9rCx'
                handleSubmit={context.createRemoveUserProposal}
            />
            <MinimumVotesProposalForm
                defaultValue='3'
                handleSubmit={context.createMinimumVotesProposal}
            />
            <ExpirationTimeProposalForm
                defaultValue='10'
                handleSubmit={context.createExpirationTimeProposal}
            />
        </section>
    );
}

function AddUserProposalForm(props) {
    // Set the component state
    const [user, setUser] = useState(props.defaultValue);

    // Define the on change handler
    const handleChange = (e) => {
        setUser(e.target.value);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(user);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Add user proposal</legend>
                <label>User to add:
                    <input type='text' value={user} onChange={handleChange} />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function RemoveUserProposalForm(props) {
    // Set the component state
    const [user, setUser] = useState(props.defaultValue);

    // Define the on change handler
    const handleChange = (e) => {
        setUser(e.target.value);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(user);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Remove user proposal</legend>
                <label>User to remove:
                    <input type='text' value={user} onChange={handleChange} />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function MinimumVotesProposalForm(props) {
    // Set the component state
    const [minimumVotes, setMinimumVotes] = useState(props.defaultValue);

    // Define the on change handler
    const handleChange = (e) => {
        setMinimumVotes(Math.round(e.target.value));
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(minimumVotes);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Minimum votes proposal</legend>
                <label>New minimum votes:
                    <input type='number' value={minimumVotes} step='1' onChange={handleChange} />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function ExpirationTimeProposalForm(props) {
    // Set the component state
    const [expirationTime, setExpirationTime] = useState(props.defaultValue);

    // Define the on change handler
    const handleChange = (e) => {
        setExpirationTime(Math.round(e.target.value));
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(expirationTime);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Expiration time proposal</legend>
                <label>New expiration time (days):
                    <input type='number' value={expirationTime} step='1' onChange={handleChange} />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}
