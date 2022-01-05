import React, { createContext } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import axios from 'axios';


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

        // Waits for an operation to be confirmed
        this.confirmOperation = async (operation) => {
            // Return if the operation is undefined
            if (operation === undefined) return;

            console.log(`Waiting for the operation to be confirmed...`);
            await operation.confirmation(1)
                .then(() => console.log(`Operation confirmed: https://tzkt.io/${operation.opHash}`))
                .catch((error) => console.log('Error while confirming the operation:', error));
        };

        // Define the component state parameters
        this.state = {
            // The current active account
            activeAccount: undefined,

            // Sets the current active account
            setActiveAccount: async () => this.setState({
                activeAccount: await wallet.client.getActiveAccount()
                    .catch((error) => console.log('Error while accessing the active account:', error))
            }),

            // The multisign contract reference
            contract: undefined,

            // Sets the multisign contract reference
            setContract: async () => this.setState({
                contract: await tezos.wallet.at(multisignContractAddress)
                    .catch((error) => console.log('Error while accessing the contract:', error))
            }),

            // The multisign contract storage
            storage: undefined,

            // Sets the multisign contract storage
            setStorage: async () => this.setState({
                storage: await this.state.getStorage()
            }),

            // Gets the multisign contract storage
            getStorage: async () => {
                // Send a query to tzkt to get the contract storage
                const response = await axios.get(`https://api.${network}.tzkt.io/v1/contracts/${multisignContractAddress}/storage`)
                    .catch((error) => console.log('Error while querying the contract storage:', error));

                return response?.data;
            },

            // The multisign proposals
            proposals: undefined,

            // Sets the multisign proposals
            setProposals: async () => this.setState({
                proposals: await this.state.getProposals()
            }),

            // Gets the multisign proposals
            getProposals: async () => {
                // Set the contract storage if it's undefined
                if (this.state.storage === undefined) {
                    await this.state.setStorage();

                    // Return if the contract storage is still undefined
                    if (this.state.storage === undefined) return;
                }

                // Send a query to tzkt to get all the bigmap keys
                const response = await axios.get(`https://api.${network}.tzkt.io/v1/bigmaps/${this.state.storage.proposals}/keys`, {
                        params: {
                            limit: 10000,
                            active: true,
                            select: 'key,value',
                        }
                    })
                    .catch((error) => console.log('Error while querying the proposals bigmap:', error));

                return response?.data.reverse();
            },

            // The user votes
            userVotes: undefined,

            // Sets the user votes
            setUserVotes: async () => this.setState({
                userVotes: await this.state.getUserVotes((await wallet.client.getActiveAccount())?.address)
            }),

            // Gets the votes from a given multisign user
            getUserVotes: async (userAddress) => {
                // Return if the user address is undefined
                if (userAddress === undefined) return;

                // Set the contract storage if it's undefined
                if (this.state.storage === undefined) {
                    await this.state.setStorage();

                    // Return if the contract storage is still undefined
                    if (this.state.storage === undefined) return;
                }

                // Send a query to tzkt to get the desired bigmap keys
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
                let userVotes = undefined;

                if (response) {
                    userVotes = {};

                    for (const vote of response.data) {
                        userVotes[vote.key.nat] = vote.value;
                    }
                }

                return userVotes;
            },

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

                // Set the user votes as undefined
                this.setState({userVotes: undefined});
            },

            // Votes a proposal
            voteProposal: async (proposalId, approval) => {
                // Set the multisign contract if it's undefined
                if (this.state.contract === undefined) {
                    await this.state.setContract();

                    // Return if the contract is still undefined
                    if (this.state.contract === undefined) return;
                }

                // Send the vote proposal operation
                console.log('Sending the vote proposal operation...');
                const operation = await this.state.contract.methods.vote_proposal(proposalId, approval).send()
                    .catch((error) => console.log('Error while sending the vote proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals and the user votes
                await this.state.setProposals();
                await this.state.setUserVotes()
            },

            // Executes a proposal
            executeProposal: async (proposalId) => {
                // Set the multisign contract if it's undefined
                if (this.state.contract === undefined) {
                    await this.state.setContract();

                    // Return if the contract is still undefined
                    if (this.state.contract === undefined) return;
                }

                // Send the execute proposal operation
                console.log('Sending the execute proposal operation...');
                const operation = await this.state.contract.methods.execute_proposal(proposalId).send()
                    .catch((error) => console.log('Error while sending the execute proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the storage and the proposals
                await this.state.setStorage();
                await this.state.setProposals();
            },

            // Creates an add user proposal
            createAddUserProposal: async (userAddress) => {
                // Set the multisign contract if it's undefined
                if (this.state.contract === undefined) {
                    await this.state.setContract();

                    // Return if the contract is still undefined
                    if (this.state.contract === undefined) return;
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
                // Set the multisign contract if it's undefined
                if (this.state.contract === undefined) {
                    await this.state.setContract();

                    // Return if the contract is still undefined
                    if (this.state.contract === undefined) return;
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
                // Set the multisign contract if it's undefined
                if (this.state.contract === undefined) {
                    await this.state.setContract();

                    // Return if the contract is still undefined
                    if (this.state.contract === undefined) return;
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
                // Set the multisign contract if it's undefined
                if (this.state.contract === undefined) {
                    await this.state.setContract();

                    // Return if the contract is still undefined
                    if (this.state.contract === undefined) return;
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
        };
    }

    componentDidMount() {
        // Set the active account in case the user was connected already
        this.state.setActiveAccount();

        // Set the multisign proposals
        this.state.setProposals();

        // Set the user votes
        this.state.setUserVotes();
    }

    render() {
        return (
            <MultisignContext.Provider value={this.state}>
                {this.props.children}
            </MultisignContext.Provider>
        );
    }
}
