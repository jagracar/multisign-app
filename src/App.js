import React from 'react';
import { Outlet } from 'react-router-dom';
import { MultisigContextProvider } from './context';
import { Header } from './header';
import { Footer } from './footer';
import { ContractSelectionForm, CreateProposalForms, OriginateMultisigForm } from './forms';
import { Parameters } from './parameters';
import { Proposals } from './proposals';


export function App() {
    return (
        <MultisigContextProvider>
            <div className='app-container'>
                <Header />
                <Outlet />
                <Footer />
            </div>
        </MultisigContextProvider>
    );
}

export function MultisigParameters() {
    return (
        <main>
            <h1>Tezos multisig / mini-DAO</h1>
            <ContractSelectionForm />
            <Parameters />
        </main>
    );
}

export function MultisigProposals() {
    return (
        <main>
            <h1>Multisig proposals</h1>
            <Proposals />
        </main>
    );
}

export function CreateProposals() {
    return (
        <main>
            <h1>Create new proposals</h1>
            <CreateProposalForms />
        </main>
    );
}

export function OriginateMultisig() {
    return (
        <main>
            <h1>Create a new multisig</h1>
            <OriginateMultisigForm />
        </main>
    );
}

export function NotFound() {
    return (
        <main>
            <p>Page not found...</p>
        </main>
    );
}
