import React from 'react';
import { MultisignContextProvider } from './context';
import { Header } from './header';
import { Users } from './users';
import { Proposals } from './proposals';
import { Footer } from './footer';
import './App.css';


export default function App() {

    return (
        <div className="App">
            <MultisignContextProvider>
                <Header />
                <Users />
                <Proposals />
                <Footer />
            </MultisignContextProvider>
        </div>
    );
}
