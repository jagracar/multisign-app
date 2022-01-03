import React, { createContext } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';


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

// Create the multisign context provider
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
                .catch((error) => console.log('Error while confirming the vote proposal operation:', error));
        };

        // Define the component state parameters
        this.state = {
            // The current active account
            activeAccount: undefined,

            // Sets the current active account calling the wallet client
            setActiveAccount: async () => this.setState({
                activeAccount: await wallet.client.getActiveAccount()
            }),

            // The multisign contract reference
            contract: undefined,

            // Sets the multisign contract reference
            setContract: async () => this.setState({
                contract: await tezos.wallet.at(multisignContractAddress)
                    .catch((error) => console.log('Error while accessing the contract:', error))
            }),

            // Connects the user wallet if it was not connected before
            connectWallet: async () => {
                // Return if there is already an active account
                if (this.state.activeAccount) return;

                // Ask the user for the permission to use the wallet
                console.log(`Connecting the user wallet...`);
                await wallet.requestPermissions({network: {type: network, rpcUrl: rpcNode}})
                    .catch((error) => console.log('Error while requesting wallet permissions:', error));

                // Set the active account state
                await this.state.setActiveAccount();
            },

            // Disconnects the user wallet
            disconnectWallet: async () => {
                // Clear the active account
                console.log(`Disconnecting the user wallet...`);
                await wallet.client.clearActiveAccount();

                // Update the active account state
                await this.state.setActiveAccount();
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
                console.log(`Sending the vote proposal operation...`);
                const operation = await this.state.contract.methods.vote_proposal(proposalId, approval).send()
                    .catch((error) => console.log('Error while sending the vote proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);
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
                console.log(`Sending the execute proposal operation...`);
                const operation = await this.state.contract.methods.execute_proposal(proposalId).send()
                    .catch((error) => console.log('Error while sending the execute proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);
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
                console.log(`Sending the add user proposal operation...`);
                const operation = await this.state.contract.methods.add_user_proposal(userAddress).send()
                    .catch((error) => console.log('Error while sending the add user proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);
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
                console.log(`Sending the remove user proposal operation...`);
                const operation = await this.state.contract.methods.remove_user_proposal(userAddress).send()
                    .catch((error) => console.log('Error while sending the remove user proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);
            }
        };
    }

    componentDidMount() {
        // Set the active account in case the user was connected already
        this.state.setActiveAccount();
    }

    render() {
        return (
            <MultisignContext.Provider value={this.state}>
                {this.props.children}
            </MultisignContext.Provider>
        );
    }
}
