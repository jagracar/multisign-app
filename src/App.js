import React from 'react';
import { MultisignContextProvider } from './context';
import { Header } from './header';
import { Parameters } from './parameters';
import { Proposals } from './proposals';
import { ProposalForms } from './forms';
import { Footer } from './footer';


export default function App() {

    return (
        <div className='app-container'>
            <MultisignContextProvider>
                <div className='content-container'>
                    <Header />
                    <Parameters />
                    <Proposals />
                    <ProposalForms />
                </div>
                <Footer />
            </MultisignContextProvider>
        </div>
    );
}
