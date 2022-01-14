import React from 'react';
import { Outlet } from 'react-router-dom';
import { MultisignContextProvider } from './context';
import { Header } from './header';
import { Footer } from './footer';
import { ContractSelectionForm, CreateProposalForms, OriginateMultisignForm } from './forms';
import { Parameters } from './parameters';
import { Proposals } from './proposals';


export function App() {
    return (
        <MultisignContextProvider>
            <div className='app-container'>
                <Header />
                <Outlet />
                <Footer />
            </div>
        </MultisignContextProvider>
    );
}

export function MultisignParameters() {
    return (
        <main>
            <h1>Tezos multisign / mini-DAO</h1>
            <ContractSelectionForm />
            <Parameters />
        </main>
    );
}

export function MultisignProposals() {
    return (
        <main>
            <h1>Multisign proposals</h1>
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

export function OriginateMultisign() {
    return (
        <main>
            <h1>Originate a new multisign</h1>
            <OriginateMultisignForm />
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
