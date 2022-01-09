import React, { createContext } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { validateAddress } from '@taquito/utils';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { Parser } from '@taquito/michel-codec';
import axios from 'axios';
import { ConfirmationMessage } from '../messages';


// Define some of the main connection parameters
const rpcNode = 'https://mainnet.api.tez.ie';
const network = 'mainnet';
const multisignContractAddress = 'KT1Cecn3A2A4i9EmSqug45iyzUUQc4F7C9yM';

// Initialize the tezos toolkit
const tezos = new TezosToolkit(rpcNode);

// Initialize the wallet
const wallet = new BeaconWallet({
    name: 'multisign',
    preferredNetwork: network
});

// Pass the wallet to the tezos toolkit
tezos.setWalletProvider(wallet);

// Create the multisign context
export const MultisignContext = createContext();

// Create the multisign context provider component
export class MultisignContextProvider extends React.Component {

    constructor(props) {
        // Pass the properties to the base class
        super(props);

        // Gets the current active account
        this.getActiveAccount = async () => {
            console.log('Accessing the current active account...');
            return await wallet.client.getActiveAccount()
                .catch((error) => console.log('Error while accessing the active account:', error));
        };

        // Gets the multisign contract balance
        this.getBalance = async () => {
            // Send a query to tzkt to get the contract balance
            console.log('Querying tzKt to get the multisign contract balance...');
            const response = await axios.get(`https://api.${network}.tzkt.io/v1/accounts/${this.state.contractAddress}/balance`)
                .catch((error) => console.log('Error while querying the contract balance:', error));

            return response?.data;
        };

        // Gets the multisign contract storage
        this.getStorage = async () => {
            // Send a query to tzkt to get the contract storage
            console.log('Querying tzKt to get the multisign contract storage...');
            const response = await axios.get(`https://api.${network}.tzkt.io/v1/contracts/${this.state.contractAddress}/storage`)
                .catch((error) => console.log('Error while querying the contract storage:', error));

            return response?.data;
        };

        // Gets the multisign proposals
        this.getProposals = async () => {
            // Return if the contract storage is undefined
            if (this.state.storage === undefined) return undefined;

            // Send a query to tzkt to get all the proposals bigmap keys
            console.log('Querying tzKt to get the multisign proposals...');
            const response = await axios.get(`https://api.${network}.tzkt.io/v1/bigmaps/${this.state.storage.proposals}/keys`, {
                    params: {
                        limit: 10000,
                        active: true,
                        select: 'key,value',
                    }
                })
                .catch((error) => console.log('Error while querying the proposals bigmap:', error));

            return response?.data.reverse();
        };

        // Gets the votes from a given multisign user
        this.getUserVotes = async (userAddress) => {
            // Return if the user address is undefined
            if (userAddress === undefined) return undefined;

            // Return if the contract storage is undefined
            if (this.state.storage === undefined) return undefined;

            // Send a query to tzkt to get the desired votes bigmap keys
            console.log('Querying tzKt to get the user votes...');
            const response = await axios.get(`https://api.${network}.tzkt.io/v1/bigmaps/${this.state.storage.votes}/keys`, {
                    params: {
                        'key.address': userAddress,
                        limit: 10000,
                        active: true,
                        select: 'key,value',
                    }
                })
                .catch((error) => console.log('Error while querying the votes bigmap:', error));

            // Rearange the user votes information in a dictionary
            const userVotes = response? {} : undefined;
            response?.data.forEach((vote) => {userVotes[vote.key.nat] = vote.value;});

            return userVotes;
        };

        // Gets the multisign contract reference
        this.getContract = async () => {
            console.log('Accessing multisign contract...');
            return await tezos.wallet.at(this.state.contractAddress)
                .catch((error) => console.log('Error while accessing the contract:', error));
        };

        // Checks if the multisign contract reference is available
        this.contractIsAvailable = async () => {
            // Set the multisign contract if it's undefined
            if (this.state.contract === undefined) await this.state.setContract();

            return this.state.contract !== undefined;
        };

        // Waits for an operation to be confirmed
        this.confirmOperation = async (operation) => {
            // Return if the operation is undefined
            if (operation === undefined) return;

            // Display the confirmation message
            this.state.setConfirmationMessage('Waiting for the operation to be confirmed...');

            // Wait for the operation to be confirmed
            console.log('Waiting for the operation to be confirmed...');
            await operation.confirmation(1)
                .then(() => console.log(`Operation confirmed: https://tzkt.io/${operation.opHash}`))
                .catch((error) => console.log('Error while confirming the operation:', error));

            // Remove the confirmation message
            this.state.setConfirmationMessage(undefined);
        };

        // Define the component state parameters
        this.state = {
            // The tezos network
            network: network,

            // The multisign contract address
            contractAddress: multisignContractAddress,

            // The current active account
            activeAccount: undefined,

            // Sets the current active account
            setActiveAccount: async () => this.setState({
                activeAccount: await this.getActiveAccount()
            }),

            // The multisign contract balance in mutez
            balance: undefined,

            // Sets the multisign contract balance in mutez
            setBalance: async () => this.setState({
                balance: await this.getBalance()
            }),

            // The multisign contract storage
            storage: undefined,

            // Sets the multisign contract storage
            setStorage: async () => this.setState({
                storage: await this.getStorage()
            }),

            // The multisign proposals
            proposals: undefined,

            // Sets the multisign proposals
            setProposals: async () => this.setState({
                proposals: await this.getProposals()
            }),

            // The user votes
            userVotes: undefined,

            // Sets the user votes
            setUserVotes: async () => this.setState({
                userVotes: await this.getUserVotes(this.state.activeAccount?.address)
            }),

            // The multisign contract reference
            contract: undefined,

            // Sets the multisign contract reference
            setContract: async () => this.setState({
                contract: await this.getContract()
            }),

            // The confirmation message
            confirmationMessage: undefined,

            // Sets the confirmation message
            setConfirmationMessage: (message) => this.setState({
                confirmationMessage: message
            }),

            // The error message
            errorMessage: undefined,

            // Sets the error message
            setErrorMessage: (message) => this.setState({
                errorMessage: message
            }),

            // Connects the user wallet if it was not connected before
            connectWallet: async () => {
                // Return if there is already an active account
                if (this.state.activeAccount) return;

                // Ask the user for the permission to use the wallet
                console.log('Connecting the user wallet...');
                await wallet.requestPermissions({network: {type: network, rpcUrl: rpcNode}})
                    .catch((error) => console.log('Error while requesting wallet permissions:', error));

                // Set the active account state
                await this.state.setActiveAccount();

                // Set the user votes
                await this.state.setUserVotes();
            },

            // Disconnects the user wallet
            disconnectWallet: async () => {
                // Clear the active account
                console.log('Disconnecting the user wallet...');
                await wallet.client.clearActiveAccount();

                // Update the active account state
                await this.state.setActiveAccount();

                // Set the user votes and the contract reference as undefined
                this.setState({
                    userVotes: undefined,
                    contract: undefined
                });
            },

            // Votes a proposal
            voteProposal: async (proposalId, approval) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Send the vote proposal operation
                console.log('Sending the vote proposal operation...');
                const operation = await this.state.contract.methods.vote_proposal(proposalId, approval).send()
                    .catch((error) => console.log('Error while sending the vote proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals and the user votes
                await this.state.setProposals();
                await this.state.setUserVotes();
            },

            // Executes a proposal
            executeProposal: async (proposalId) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Send the execute proposal operation
                console.log('Sending the execute proposal operation...');
                const operation = await this.state.contract.methods.execute_proposal(proposalId).send()
                    .catch((error) => console.log('Error while sending the execute proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the balance, storage and the proposals
                await this.state.setBalance();
                await this.state.setStorage();
                await this.state.setProposals();
            },

            // Creates a transfer mutez proposal
            createTransferMutezProposal: async (amount, destination) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the amount is smaller thant the contract balance
                if (amount >= this.state.balance) {
                    this.state.setErrorMessage('The provided tez amount is larger than the current contract balance');
                    return;
                }

                // Check that the destination address is a valid address
                if (!(destination && destination !== '' && validateAddress(destination) === 3)) {
                    this.state.setErrorMessage('The provided address is not a valid tezos address');
                    return;
                }

                // Send the transfer mutez proposal operation
                console.log('Sending the transfer mutez proposal operation...');
                const operation = await this.state.contract.methods.transfer_mutez_proposal(amount, destination).send()
                    .catch((error) => console.log('Error while sending the trasfer mutez proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },

            // Creates a transfer token proposal
            createTransferTokenProposal: async (tokenContract, tokenId, tokenAmount, destination) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the token contract address is a valid address
                if (!(tokenContract && tokenContract !== '' && validateAddress(tokenContract) === 3)) {
                    this.state.setErrorMessage('The provided token contract address is not a valid tezos address');
                    return;
                }

                // Check that the destination address is a valid address
                if (!(destination && destination !== '' && validateAddress(destination) === 3)) {
                    this.state.setErrorMessage('The provided address is not a valid tezos address');
                    return;
                }

                // Send the transfer token proposal operation
                console.log('Sending the transfer token proposal operation...');
                const operation = await this.state.contract.methods.transfer_token_proposal(tokenContract, tokenId, tokenAmount, destination).send()
                    .catch((error) => console.log('Error while sending the trasfer token proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },

            // Creates an add user proposal
            createAddUserProposal: async (userAddress) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the user address is a valid address
                if (!(userAddress && userAddress !== '' && validateAddress(userAddress) === 3)) {
                    this.state.setErrorMessage('The provided address is not a valid tezos address');
                    return;
                }

                // Check that the user address is not in the multisign users
                if (this.state.storage?.users.includes(userAddress)) {
                    this.state.setErrorMessage('The provided address is already a multisign user');
                    return;
                }

                // Send the add user proposal operation
                console.log('Sending the add user proposal operation...');
                const operation = await this.state.contract.methods.add_user_proposal(userAddress).send()
                    .catch((error) => console.log('Error while sending the add user proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },

            // Creates a remove user proposal
            createRemoveUserProposal: async (userAddress) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the user address is a valid address
                if (!(userAddress && userAddress !== '' && validateAddress(userAddress) === 3)) {
                    this.state.setErrorMessage('The provided address is not a valid tezos address');
                    return;
                }

                // Check that the user address is in the multisign users
                if (!this.state.storage?.users.includes(userAddress)) {
                    this.state.setErrorMessage('The provided address is not a multisign user');
                    return;
                }

                // Send the remove user proposal operation
                console.log('Sending the remove user proposal operation...');
                const operation = await this.state.contract.methods.remove_user_proposal(userAddress).send()
                    .catch((error) => console.log('Error while sending the remove user proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },

            // Creates a minimum votes proposal
            createMinimumVotesProposal: async (minimumVotes) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the minimum votes are within the expected range
                if (minimumVotes <= 0 || minimumVotes > this.state.storage?.users.length) {
                    this.state.setErrorMessage('The minimum votes need to be higher than 0 and less or equal to the number of multisign users');
                    return;
                }

                // Send the minimum votes proposal operation
                console.log('Sending the minimum votes proposal operation...');
                const operation = await this.state.contract.methods.minimum_votes_proposal(minimumVotes).send()
                    .catch((error) => console.log('Error while sending the minimum votes proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },

            // Creates an expiration time proposal
            createExpirationTimeProposal: async (expirationTime) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the expiration time is higher than 1 day
                if (expirationTime <= 0) {
                    this.state.setErrorMessage('The expiration time needs to be higher than 1 day');
                    return;
                }

                // Send the expiration time proposal operation
                console.log('Sending the expiration time proposal operation...');
                const operation = await this.state.contract.methods.expiration_time_proposal(expirationTime).send()
                    .catch((error) => console.log('Error while sending the expiration time proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },

            // Creates a lambda function proposal
            createLambdaFunctionProposal: async (michelineCode) => {
                // Return if the multisign contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Try to get the lambda function from the Micheline code
                let lambdaFunction;

                try {
                    const parser = new Parser();
                    lambdaFunction = parser.parseMichelineExpression(michelineCode);
                } catch (error) {
                    this.state.setErrorMessage('The provided lambda function Michelson code is not correct');
                    return;
                }

                // Send the lambda function proposal operation
                console.log('Sending the lambda function proposal operation...');
                const operation = await this.state.contract.methods.lambda_proposal(lambdaFunction).send()
                    .catch((error) => console.log('Error while sending the lambda function proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.state.setProposals();
            },
        };
    }

    componentDidMount() {
        // Set the active account, the contract storage, the proposals and the user votes
        this.state.setActiveAccount()
            .then(() => this.state.setBalance())
            .then(() => this.state.setStorage())
            .then(() => this.state.setProposals())
            .then(() => this.state.setUserVotes());
    }

    render() {
        return (
            <MultisignContext.Provider value={this.state}>
                {this.state.confirmationMessage &&
                    <ConfirmationMessage message={this.state.confirmationMessage} />
                }

                {this.props.children}
            </MultisignContext.Provider>
        );
    }
}
