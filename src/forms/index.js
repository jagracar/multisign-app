import React, { useContext, useState } from 'react';
import { MultisignContext } from '../context';
import { ErrorMessage } from '../messages';


export function CreateProposalForms(props) {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Return if the user is not connected or is not one of the multisign users
    if (!(context.activeAccount && context.storage?.users.includes(context.activeAccount.address))) {
        return null;
    }

    return (
        <section>
            <h2>Create new proposals</h2>

            {context.errorMessage &&
                <ErrorMessage message={context.errorMessage} onClick={() => context.setErrorMessage(undefined)} />
            }

            <AddUserProposalForm
                defaultValue=''
                handleSubmit={context.createAddUserProposal}
            />

            <RemoveUserProposalForm
                defaultValue={context.storage.users[0]}
                users={context.storage.users}
                handleSubmit={context.createRemoveUserProposal}
            />

            <MinimumVotesProposalForm
                defaultValue={context.storage.minimum_votes}
                maxValue={context.storage.users.length}
                handleSubmit={context.createMinimumVotesProposal}
            />

            <ExpirationTimeProposalForm
                defaultValue={context.storage.expiration_time}
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
                    <input
                        type='text'
                        className='tezos-wallet-input'
                        minLength='36'
                        maxLength='36'
                        value={user}
                        onChange={handleChange}
                    />
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
                    <select value={user} onChange={handleChange}>
                        {props.users.map((userWallet) => (
                            <option key={userWallet} value={userWallet}>
                                {userWallet}
                            </option>
                        ))}
                    </select>
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
                    <input type='number' value={minimumVotes} min='1' max={props.maxValue} step='1' onChange={handleChange} />
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
                    <input type='number' value={expirationTime} min='1' step='1' onChange={handleChange} />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}
