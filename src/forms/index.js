import React, { useContext, useState } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';
import { IpfsLink } from '../link';
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

            <TextProposalForm
                uploadToIpfs={context.uploadToIpfs}
                handleSubmit={context.createTextProposal}
            />

            <TransferTezProposalForm
                handleSubmit={context.createTransferMutezProposal}
            />

            <TransferTokenProposalForm
                handleSubmit={context.createTransferTokenProposal}
            />

            <AddUserProposalForm
                handleSubmit={context.createAddUserProposal}
            />

            <RemoveUserProposalForm
                users={context.storage.users}
                handleSubmit={context.createRemoveUserProposal}
            />

            <MinimumVotesProposalForm
                defaultValue={context.storage.minimum_votes}
                handleSubmit={context.createMinimumVotesProposal}
            />

            <ExpirationTimeProposalForm
                defaultValue={context.storage.expiration_time}
                handleSubmit={context.createExpirationTimeProposal}
            />

            <LambdaFunctionProposalForm
                handleSubmit={context.createLambdaFunctionProposal}
            />
        </section>
    );
}

function TextProposalForm(props) {
    // Set the component state
    const [file, setFile] = useState(undefined);
    const [ipfsPath, setIpfsPath] = useState(undefined);

    // Define the on change handler
    const handleChange = (e) => {
        setFile(e.target.files[0]);
        setIpfsPath(undefined);
    };

    // Define the on click handler
    const handleClick = async (e) => {
        e.preventDefault();

        // Update the component state
        setIpfsPath(await props.uploadToIpfs(file));
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(ipfsPath);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Text proposal</legend>
                <div className='proposal-input'>
                    <label>File with the text to approve:
                        {' '}
                        <input
                            type='file'
                            onChange={handleChange}
                        />
                    </label>
                    {file &&
                        <div>
                            <Button text={ipfsPath? 'uploaded' : 'upload to IPFS'} onClick={handleClick} />
                            {' '}
                            {ipfsPath &&
                                <IpfsLink path={ipfsPath} />
                            }
                        </div>
                    }
                </div>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function TransferTezProposalForm(props) {
    // Set the component state
    const [transfers, setTransfers] = useState([
        {amount: 0, destination: ''}
    ]);

    // Define the on change handler
    const handleChange = (index, parameter, value) => {
        // Create a new transfers array
        const newTransfers = transfers.map((transfer, i) => {
            // Create a new transfer
            const newTransfer = {
                amount: transfer.amount,
                destination: transfer.destination
            };

            // Update the value if we are at the correct index position
            if (i === index) {
                newTransfer[parameter] = value;
            }

            return newTransfer;
        });

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on click handler
    const handleClick = (e, increase) => {
        e.preventDefault();

        // Create a new transfers array
        const newTransfers = transfers.map((transfer) => (
            {amount: transfer.amount, destination: transfer.destination}
        ));

        // Add or remove a transfer from the list
        if (increase) {
            newTransfers.push({amount: 0, destination: ''});
        } else if (newTransfers.length > 1) {
            newTransfers.pop();
        }

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(
            transfers.map((transfer) => ({
                amount: transfer.amount * 1000000,
                destination: transfer.destination
            }))
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Transfer tez proposal</legend>
                <div className='proposal-input'>
                    {transfers.map((transfer, index) => (
                        <div key={index}  className='transfer-input'>
                            <label>Amount to transfer (ꜩ):
                                {' '}
                                <input
                                    type='number'
                                    min='0'
                                    step='0.000001'
                                    value={transfer.amount}
                                    onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                />
                            </label>
                            <br />
                            <label>Destination address:
                                {' '}
                                <input
                                    type='text'
                                    spellCheck='false'
                                    minLength='36'
                                    maxLength='36'
                                    className='tezos-wallet-input'
                                    value={transfer.destination}
                                    onChange={(e) => handleChange(index, 'destination', e.target.value)}
                                />
                            </label>
                        </div>
                    ))}
                    <Button text='+' onClick={(e) => handleClick(e, true)} />
                    {' '}
                    <Button text='-' onClick={(e) => handleClick(e, false)} />
                </div>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function TransferTokenProposalForm(props) {
    // Set the component state
    const [tokenContract, setTokenContract] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [transfers, setTransfers] = useState([
        {amount: 0, destination: ''}
    ]);

    // Define the on change handler
    const handleChange = (index, parameter, value) => {
        // Create a new transfers array
        const newTransfers = transfers.map((transfer, i) => {
            // Create a new transfer
            const newTransfer = {
                amount: transfer.amount,
                destination: transfer.destination
            };

            // Update the value if we are at the correct index position
            if (i === index) {
                newTransfer[parameter] = value;
            }

            return newTransfer;
        });

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on click handler
    const handleClick = (e, increase) => {
        e.preventDefault();

        // Create a new transfers array
        const newTransfers = transfers.map((transfer) => (
            {amount: transfer.amount, destination: transfer.destination}
        ));

        // Add or remove a transfer from the list
        if (increase) {
            newTransfers.push({amount: 0, destination: ''});
        } else if (newTransfers.length > 1) {
            newTransfers.pop();
        }

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(tokenContract, tokenId, transfers);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Transfer token proposal</legend>
                <div className='proposal-input'>
                    <label>Token contract address:
                        {' '}
                        <input
                            type='text'
                            list='tokenContracts'
                            spellCheck='false'
                            minLength='36'
                            maxLength='36'
                            className='token-contract-input'
                            value={tokenContract}
                            onChange={(e) => setTokenContract(e.target.value)}
                            onMouseDown={() => setTokenContract('')}
                        />
                        <datalist id='tokenContracts'>
                            <option value=''></option>
                            <option value='KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton'>OBJKT</option>
                            <option value='KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW'>hDAO</option>
                            <option value='KT1LHHLso8zQWQWg1HUukajdxxbkGfNoHjh6'>Tezzardz</option>
                            <option value='KT1VbHpQmtkA3D4uEbbju26zS8C42M5AGNjZ'>PRJKTNEON</option>
                            <option value='KT1LbLNTTPoLgpumACCBFJzBEHDiEUqNxz5C'>Art Cardz</option>
                            <option value='KT1SyPgtiXTaEfBuMZKviWGNHqVrBBEjvtfQ'>GOGOs</option>
                            <option value='KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ'>NEONZ</option>
                            <option value='KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih'>Randomly Common Skeles</option>
                            <option value='KT1PNcZQkJXMQ2Mg92HG1kyrcu3auFX5pfd8'>ZIGGURATS</option>
                        </datalist>
                    </label>
                    <br />
                    <label>Token Id:
                        {' '}
                        <input
                            type='number'
                            min='0'
                            step='1'
                            value={tokenId}
                            onChange={(e) => setTokenId(e.target.value)} />
                    </label>
                    <br />
                    {transfers.map((transfer, index) => (
                        <div key={index}  className='transfer-input'>
                            <label>Token editions:
                                {' '}
                                <input
                                    type='number'
                                    min='1'
                                    step='1'
                                    value={transfer.amount}
                                    onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                />
                            </label>
                            <br />
                            <label>Destination address:
                                {' '}
                                <input
                                    type='text'
                                    spellCheck='false'
                                    minLength='36'
                                    maxLength='36'
                                    className='tezos-wallet-input'
                                    value={transfer.destination}
                                    onChange={(e) => handleChange(index, 'destination', e.target.value)}
                                />
                            </label>
                        </div>
                    ))}
                    <Button text='+' onClick={(e) => handleClick(e, true)} />
                    {' '}
                    <Button text='-' onClick={(e) => handleClick(e, false)} />
                </div>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function AddUserProposalForm(props) {
    // Set the component state
    const [user, setUser] = useState('');

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
                <label className='proposal-input'>User to add:
                    {' '}
                    <input
                        type='text'
                        spellCheck='false'
                        minLength='36'
                        maxLength='36'
                        className='tezos-wallet-input'
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
    const [user, setUser] = useState(props.users[0]);

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
                <label className='proposal-input'>User to remove:
                    {' '}
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
                <label className='proposal-input'>New minimum votes:
                    {' '}
                    <input
                        type='number'
                        min='1'
                        step='1'
                        value={minimumVotes}
                        onChange={handleChange} />
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
                <label className='proposal-input'>New expiration time (days):
                    {' '}
                    <input
                        type='number'
                        min='1'
                        step='1'
                        value={expirationTime}
                        onChange={handleChange}
                    />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}

function LambdaFunctionProposalForm(props) {
    // Set the component state
    const [michelineCode, setMichelineCode] = useState('');

    // Define the on change handler
    const handleChange = (e) => {
        setMichelineCode(e.target.value);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(michelineCode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Lambda function proposal</legend>
                <label className='proposal-input'>Lambda function code in Micheline format:
                    {' '}
                    <textarea
                        className='micheline-code'
                        spellCheck='false'
                        value={michelineCode}
                        onChange={handleChange}
                    />
                </label>
                <input type='submit' value='send proposal' />
            </fieldset>
        </form>
    );
}
