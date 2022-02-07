import React, { createContext } from 'react';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { validateAddress } from '@taquito/utils';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { Parser } from '@taquito/michel-codec';
import axios from 'axios';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { stringToHex, hexToString } from '../utils';
import { InformationMessage, ConfirmationMessage, ErrorMessage } from '../messages';


// Load the multisig smart contrac code and metadata in JSON format
const multisigContractCode = require('../contract/multisigContract.json');
const multisigContractMetadata = require('../contract/multisigMetadata.json');

// Define the default network and multisig contract address
const defaultNetwork = 'mainnet';
const defaultContractAddress = 'KT1PKBTVmdxfgkFvSeNUQacYiEFsPBw16B4P';

// Clear the multisig local storage if the stored network does not coincide with the default
if (window.localStorage.multisigNetwork !== defaultNetwork) {
    window.localStorage.removeItem('multisigNetwork');
    window.localStorage.removeItem('multisigContractAddress');
}

// Set the connection parameters
const network = window.localStorage.multisigNetwork || defaultNetwork;
const rpcNode = `https://${network}.api.tez.ie`;

// Initialize the tezos toolkit
const tezos = new TezosToolkit(rpcNode);

// Initialize the wallet
const wallet = new BeaconWallet({
    name: 'multisig',
    preferredNetwork: network
});

// Pass the wallet to the tezos toolkit
tezos.setWalletProvider(wallet);

// Create an instance of the IPFS client
const ipfsClient = create('https://ipfs.infura.io:5001/api/v0');

// Create the multisig context
export const MultisigContext = createContext();

// Create the multisig context provider component
export class MultisigContextProvider extends React.Component {

    constructor(props) {
        // Pass the properties to the base class
        super(props);

        // Sets the multisig contract addresses that are similar to the default contract
        this.setContractAddresses = async () => {
            // Send a query to tzkt to get all the multisig contract addresses
            console.log('Querying tzKt to get the multisig contract addresses...');
            const response = await axios.get(`https://api.${this.state.network}.tzkt.io/v1/contracts/${this.state.contractAddress}/same`, {
                    params: {
                        select: 'address',
                    }
                })
                .catch((error) => console.log('Error while querying the multisig contract addresses:', error));

            // Update the component state
            this.setState({
                contractAddresses: response?.data.reverse()
            });
        };

        // Sets the current active account
        this.setActiveAccount = async () => {
            // Get the current active account
            console.log('Accessing the current active account...');
            const activeAccount = await wallet.client.getActiveAccount()
                .catch((error) => console.log('Error while accessing the active account:', error));

            // Update the component state
            this.setState({
                activeAccount: activeAccount
            });
        };

        // Sets the multisig contract balance
        this.setBalance = async () => {
            // Send a query to tzkt to get the contract balance
            console.log('Querying tzKt to get the multisig contract balance...');
            const response = await axios.get(`https://api.${this.state.network}.tzkt.io/v1/accounts/${this.state.contractAddress}/balance`)
                .catch((error) => console.log('Error while querying the contract balance:', error));

            // Update the component state
            this.setState({
                balance: response?.data
            });
        };

        // Sets the multisig contract storage
        this.setStorage = async () => {
            // Send a query to tzkt to get the contract storage
            console.log('Querying tzKt to get the multisig contract storage...');
            const response = await axios.get(`https://api.${this.state.network}.tzkt.io/v1/contracts/${this.state.contractAddress}/storage`)
                .catch((error) => console.log('Error while querying the contract storage:', error));

            // Update the component state
            this.setState({
                storage: response?.data
            });
        };

        // Sets the multisig user aliases
        this.setUserAliases = async () => {
            // Check if the contract storage is defined
            if (this.state.storage) {
                // Prepare the list of user wallets for the query
                let userWallets = this.state.storage.users.join(',');

                // The list needs at least two wallets, so add the same wallet again in the case of only one user
                if (this.state.storage.users.length === 1) {
                    userWallets += ',' + userWallets;
                }

                // Send a query to tzkt to get the user aliases from the H=N registries bigmap
                console.log('Querying tzKt to get the user aliases...');
                const response = await axios.get(`https://api.${this.state.network}.tzkt.io/v1/bigmaps/3919/keys`, {
                        params: {
                            'key.in': userWallets,
                            limit: 10000,
                            active: true,
                            select: 'key,value',
                        }
                    })
                    .catch((error) => console.log('Error while querying the user aliases:', error));

                // Rearange the user aliases in a dictionary
                const userAliases = response? {} : undefined;
                response?.data.forEach((user) => {userAliases[user.key] = hexToString(user.value);});

                // Update the component state
                this.setState({
                    userAliases: userAliases
                });
            } else {
                // Update the component state
                this.setState({
                    userAliases: undefined
                });
            }
        };

        // Sets the multisig proposals
        this.setProposals = async () => {
             // Check if the contract storage is defined
            if (this.state.storage) {
                // Send a query to tzkt to get all the proposals bigmap keys
                console.log('Querying tzKt to get the multisig proposals...');
                const response = await axios.get(`https://api.${this.state.network}.tzkt.io/v1/bigmaps/${this.state.storage.proposals}/keys`, {
                        params: {
                            limit: 10000,
                            active: true,
                            select: 'key,value',
                        }
                    })
                    .catch((error) => console.log('Error while querying the proposals bigmap:', error));

                // Update the component state
                this.setState({
                    proposals: response?.data.reverse()
                });
            } else {
                // Update the component state
                this.setState({
                    proposals: undefined
                });
            }
        };

        // Sets the votes from the active account
        this.setUserVotes = async () => {
             // Check if the active account and the contract storage are defined
            if (this.state.activeAccount && this.state.storage) {
                // Send a query to tzkt to get the user votes
                console.log('Querying tzKt to get the user votes...');
                const response = await axios.get(`https://api.${this.state.network}.tzkt.io/v1/bigmaps/${this.state.storage.votes}/keys`, {
                    params: {
                        'key.address': this.state.activeAccount.address,
                        limit: 10000,
                        active: true,
                        select: 'key,value',
                    }
                })
                .catch((error) => console.log('Error while querying the votes bigmap:', error));

                // Rearange the user votes information in a dictionary
                const userVotes = response? {} : undefined;
                response?.data.forEach((vote) => {userVotes[vote.key.nat] = vote.value;});

                // Update the component state
                this.setState({
                    userVotes: userVotes
                });
            } else {
                // Update the component state
                this.setState({
                    userVotes: undefined
                });
            }
        };

        // Sets the multisig contract reference
        this.setContract = async () => {
            // Get the multisig contract reference
            console.log('Accessing the multisig contract...');
            const contract = await tezos.wallet.at(this.state.contractAddress)
                .catch((error) => console.log('Error while accessing the contract:', error));

            // Update the component state
            this.setState({
                contract: contract
            });
        };

        // Sets the information message
        this.setInformationMessage = (message) => this.setState({
            informationMessage: message
        });

        // Sets the error message
        this.setErrorMessage = (message) => this.setState({
            errorMessage: message
        });

        // Checks if the multisig contract reference is available
        this.contractIsAvailable = async () => {
            // Try to set the multisig contract reference if it's undefined
            if (this.state.contract === undefined) await this.setContract();

            return this.state.contract !== undefined;
        };

        // Waits for an operation to be confirmed
        this.confirmOperation = async (operation) => {
            // Return if the operation is undefined
            if (operation === undefined) return;

            // Display the information message
            this.setInformationMessage('Waiting for the operation to be confirmed...');

            // Wait for the operation to be confirmed
            console.log('Waiting for the operation to be confirmed...');
            await operation.confirmation(1)
                .then(() => console.log(`Operation confirmed: https://tzkt.io/${operation.opHash}`))
                .catch((error) => console.log('Error while confirming the operation:', error));

            // Remove the information message
            this.setInformationMessage(undefined);
        };

        // Define the component state parameters
        this.state = {
            // The tezos network
            network: network,

            // The multisig contract address
            contractAddress: window.localStorage.multisigContractAddress || defaultContractAddress,

            // The list with all the available multisig contracts addresses
            contractAddresses: undefined,

            // The current active account
            activeAccount: undefined,

            // The multisig contract balance in mutez
            balance: undefined,

            // The multisig contract storage
            storage: undefined,

            // The multisig user aliases
            userAliases: undefined,

            // The multisig proposals
            proposals: undefined,

            // The user votes
            userVotes: undefined,

            // The multisig contract reference
            contract: undefined,

            // The information message
            informationMessage: undefined,

            // The confirmation message
            confirmationMessage: undefined,

            // The error message
            errorMessage: undefined,

            // Sets the multisig contract address
            setContractAddress: async (address) => {
                // Return if the contract address didn't change
                if (address === this.state.contractAddress) return;

                // Return if the contract address is not a proper address
                if (!(address && validateAddress(address) === 3)) {
                    this.setErrorMessage(`The provided address is not a valid contract address: ${address}`);
                    return;
                }

                // Update the contract address and reset other contract variables
                this.setState({
                    contractAddress: address,
                    balance: undefined,
                    storage: undefined,
                    userAliases: undefined,
                    proposals: undefined,
                    userVotes: undefined,
                    contract: undefined
                });
            },

            // Connects the user wallet if it was not connected before
            connectWallet: async () => {
                // Ask the user for the permission to use the wallet
                console.log('Connecting the user wallet...');
                await wallet.requestPermissions({network : {type: this.state.network, rpcUrl: rpcNode}})
                    .catch((error) => console.log('Error while requesting wallet permissions:', error));

                // Set the active account state
                await this.setActiveAccount();

                // Set the user votes
                await this.setUserVotes();
            },

            // Disconnects the user wallet
            disconnectWallet: async () => {
                // Clear the active account
                console.log('Disconnecting the user wallet...');
                await wallet.clearActiveAccount();

                // Reset the active account, the user votes and the contract reference as undefined
                this.setState({
                    activeAccount: undefined,
                    userVotes: undefined,
                    contract: undefined
                });
            },

            // Votes a proposal
            voteProposal: async (proposalId, approval) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Send the vote proposal operation
                console.log('Sending the vote proposal operation...');
                const operation = await this.state.contract.methods.vote_proposal(proposalId, approval).send()
                    .catch((error) => console.log('Error while sending the vote proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals and the user votes
                await this.setProposals();
                await this.setUserVotes();
            },

            // Executes a proposal
            executeProposal: async (proposalId) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Send the execute proposal operation
                console.log('Sending the execute proposal operation...');
                const operation = await this.state.contract.methods.execute_proposal(proposalId).send()
                    .catch((error) => console.log('Error while sending the execute proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the balance, storage and the proposals
                await this.setBalance();
                await this.setStorage();
                await this.setUserAliases();
                await this.setProposals();
            },

            // Creates a transfer mutez proposal
            createTransferMutezProposal: async (transfers) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Loop over the transfers information
                let totalAmount = 0;

                for (const transfer of transfers) {
                    // Check that the destination address is a valid address
                    const destination = transfer.destination;

                    if (!(destination && validateAddress(destination) === 3)) {
                        this.setErrorMessage(`The provided address is not a valid tezos address: ${destination}`);
                        return;
                    }

                    totalAmount += transfer.amount;
                }

                // Check that the total amount is smaller thant the contract balance
                if (totalAmount > this.state.balance) {
                    this.setErrorMessage('The total amount of tez to transfer is larger than the current contract balance');
                    return;
                }

                // Send the transfer mutez proposal operation
                console.log('Sending the transfer mutez proposal operation...');
                const operation = await this.state.contract.methods.transfer_mutez_proposal(transfers).send()
                    .catch((error) => console.log('Error while sending the trasfer mutez proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates a transfer token proposal
            createTransferTokenProposal: async (tokenContract, tokenId, transfers) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the token contract address is a valid address
                if (!(tokenContract && validateAddress(tokenContract) === 3)) {
                    this.setErrorMessage(`The provided token contract address is not a valid tezos address: ${tokenContract}`);
                    return;
                }

                // Loop over the transfers information
                for (const transfer of transfers) {
                    // Check that the destination address is a valid address
                    const destination = transfer.destination;

                    if (!(destination && validateAddress(destination) === 3)) {
                        this.setErrorMessage(`The provided address is not a valid tezos address: ${destination}`);
                        return;
                    }
                }

                // Send the transfer token proposal operation
                console.log('Sending the transfer token proposal operation...');
                const operation = await this.state.contract.methods.transfer_token_proposal(tokenContract, tokenId, transfers).send()
                    .catch((error) => console.log('Error while sending the trasfer token proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates an add user proposal
            createAddUserProposal: async (userAddress) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the user address is a valid address
                if (!(userAddress && validateAddress(userAddress) === 3)) {
                    this.setErrorMessage('The provided address is not a valid tezos address');
                    return;
                }

                // Check that the user address is not in the multisig users
                if (this.state.storage?.users.includes(userAddress)) {
                    this.setErrorMessage('The provided address is already a multisig user');
                    return;
                }

                // Send the add user proposal operation
                console.log('Sending the add user proposal operation...');
                const operation = await this.state.contract.methods.add_user_proposal(userAddress).send()
                    .catch((error) => console.log('Error while sending the add user proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates a remove user proposal
            createRemoveUserProposal: async (userAddress) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the user address is a valid address
                if (!(userAddress && validateAddress(userAddress) === 3)) {
                    this.setErrorMessage('The provided address is not a valid tezos address');
                    return;
                }

                // Check that the user address is in the multisig users
                if (!this.state.storage?.users.includes(userAddress)) {
                    this.setErrorMessage('The provided address is not a multisig user');
                    return;
                }

                // Send the remove user proposal operation
                console.log('Sending the remove user proposal operation...');
                const operation = await this.state.contract.methods.remove_user_proposal(userAddress).send()
                    .catch((error) => console.log('Error while sending the remove user proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates a minimum votes proposal
            createMinimumVotesProposal: async (minimumVotes) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the minimum votes are within the expected range
                if (minimumVotes <= 0 || minimumVotes > this.state.storage?.users.length) {
                    this.setErrorMessage('The minimum votes need to be higher than 0 and less or equal to the number of multisig users');
                    return;
                }

                // Send the minimum votes proposal operation
                console.log('Sending the minimum votes proposal operation...');
                const operation = await this.state.contract.methods.minimum_votes_proposal(minimumVotes).send()
                    .catch((error) => console.log('Error while sending the minimum votes proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates an expiration time proposal
            createExpirationTimeProposal: async (expirationTime) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the expiration time is higher than 1 day
                if (expirationTime <= 0) {
                    this.setErrorMessage('The expiration time needs to be higher than 1 day');
                    return;
                }

                // Send the expiration time proposal operation
                console.log('Sending the expiration time proposal operation...');
                const operation = await this.state.contract.methods.expiration_time_proposal(expirationTime).send()
                    .catch((error) => console.log('Error while sending the expiration time proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates a lambda function proposal
            createLambdaFunctionProposal: async (michelineCode) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Try to get the lambda function from the Micheline code
                let lambdaFunction;

                try {
                    const parser = new Parser();
                    lambdaFunction = parser.parseMichelineExpression(michelineCode);
                } catch (error) {
                    this.setErrorMessage('The provided lambda function Michelson code is not correct');
                    return;
                }

                // Send the lambda function proposal operation
                console.log('Sending the lambda function proposal operation...');
                const operation = await this.state.contract.methods.lambda_function_proposal(lambdaFunction).send()
                    .catch((error) => console.log('Error while sending the lambda function proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Creates a text proposal
            createTextProposal: async (ipfsPath) => {
                // Return if the multisig contract reference is not available
                if (!(await this.contractIsAvailable())) return;

                // Check that the IPFS path is not undefined
                if (!ipfsPath) {
                    this.setErrorMessage('The text proposal needs to be uploaded first to IPFS');
                    return;
                }

                // Send the text proposal operation
                console.log('Sending the text proposal operation...');
                const operation = await this.state.contract.methods.text_proposal(stringToHex('ipfs://' + ipfsPath)).send()
                    .catch((error) => console.log('Error while sending the text proposal operation:', error));

                // Wait for the confirmation
                await this.confirmOperation(operation);

                // Update the proposals
                await this.setProposals();
            },

            // Originates a new multisig smart contract
            originate: async (parameters) => {
                const { name, users, minimumVotes, expirationTime } = parameters;

                // Loop over the users information
                for (const userAddress of users) {
                    // Check that the user address is a valid address
                    if (!(userAddress && validateAddress(userAddress) === 3)) {
                        this.setErrorMessage(`The provided user address is not a valid tezos address: ${userAddress}`);
                        return;
                    }
                }

                // Check that the minimum votes are within the expected range
                if (minimumVotes <= 0 || minimumVotes > users.length) {
                    this.setErrorMessage('The minimum votes need to be higher than 0 and less or equal to the number of multisig users');
                    return;
                }

                // Check that the expiration time is higher than 1 day
                if (expirationTime <= 0) {
                    this.setErrorMessage('The expiration time needs to be higher than 1 day');
                    return;
                }

                // Update the contract metadata
                multisigContractMetadata.name = name;

                // Upload the contract metadata to ipfs
                const metadataIpfsPath = await this.state.uploadMetadataToIpfs(multisigContractMetadata, false);
                console.log(metadataIpfsPath);

                // Initalize the metadata big map
                const metadataBigmap = new MichelsonMap();
                metadataBigmap.set('', stringToHex('ipfs://' + metadataIpfsPath));

                // Initialize the contract storage
                const storage = {
                    counter: 0,
                    expiration_time: parameters.expirationTime,
                    metadata: metadataBigmap,
                    minimum_votes: parameters.minimumVotes,
                    proposals: new MichelsonMap(),
                    users: parameters.users,
                    votes: new MichelsonMap()
                };

                // Send the operation that will orininate the new multisig contract
                console.log('Sending the new multisig origination operation...');
                const operation = await tezos.wallet.originate({code: multisigContractCode, storage: storage}).send()
                    .catch((error) => console.log('Error while originating the contract:', error));

                // Display the information message
                this.setInformationMessage('Waiting for the operation to be confirmed...');

                // Wait for the operation to be confirmed
                console.log('Waiting for confirmation of origination...');
                const newContractAddress = await operation?.originationOperation()
                    .then((op) => op.metadata.operation_result.originated_contracts[0].address)
                    .catch((error) => console.log('Error while confirming the origination operation:', error));

                // Remove the information message
                this.setInformationMessage(undefined);

                console.log(`Origination completed for ${newContractAddress}.`);
            },

            // Uploads some metadata to ipfs and returns the ipfs path
            uploadMetadataToIpfs: async (metadata, displayUploadInformation) => {
                // Display the information message
                if (displayUploadInformation) this.setInformationMessage('Uploading the json metadata to ipfs...');

                // Upload the metadata IPFS
                console.log('Uploading the json metadata to ipfs...');
                const added = await ipfsClient.add(Buffer.from(JSON.stringify(metadata)))
                    .catch((error) => console.log('Error while uploading the json metadata to ipfs:', error));

                // Remove the information message
                if (displayUploadInformation) this.setInformationMessage(undefined);

                 // Return the IPFS path
                return added?.path;
            },

            // Uploads a file to ipfs and returns the ipfs path
            uploadFileToIpfs: async (file, displayUploadInformation) => {
                // Check that the file is not undefined
                if (!file) {
                    this.setErrorMessage('A file needs to be loaded before uploading to IPFS');
                    return;
                }

                // Display the information message
                if (displayUploadInformation) this.setInformationMessage(`Uploading ${file.name} to ipfs...`);

                // Upload the file to IPFS
                console.log(`Uploading ${file.name} to ipfs...`);
                const added = await ipfsClient.add(file)
                    .catch((error) => console.log(`Error while uploading ${file.name} to ipfs:`, error));

                // Remove the information message
                if (displayUploadInformation) this.setInformationMessage(undefined);

                 // Return the IPFS path
                return added?.path;
            },
        };
    }

    componentDidMount() {
        // Initialize all the relevant information in the correct order
        this.setContractAddresses();
        this.setActiveAccount()
            .then(() => this.setBalance())
            .then(() => this.setStorage())
            .then(() => this.setUserAliases())
            .then(() => this.setProposals())
            .then(() => this.setUserVotes());
    }

    componentDidUpdate(prevProps, prevState) {
        // Update all the multisig data if the contract address changed
        if (prevState.contractAddress !== this.state.contractAddress) {
            // Update all the multisig data
            this.setBalance()
                .then(() => this.setStorage())
                .then(() => this.setUserAliases())
                .then(() => this.setProposals())
                .then(() => this.setUserVotes());

            // Update the local storage
            window.localStorage.multisigNetwork = this.state.network;
            window.localStorage.multisigContractAddress = this.state.contractAddress;
        }
    }

    render() {
        return (
            <MultisigContext.Provider value={this.state}>
                {this.state.informationMessage &&
                    <InformationMessage message={this.state.informationMessage} />
                }

                {this.state.confirmationMessage &&
                    <ConfirmationMessage message={this.state.confirmationMessage} onClick={() => this.setConfirmationMessage(undefined)} />
                }

                {this.state.errorMessage &&
                    <ErrorMessage message={this.state.errorMessage} onClick={() => this.setErrorMessage(undefined)} />
                }

                {this.props.children}
            </MultisigContext.Provider>
        );
    }
}
