import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { App, MultisigParameters, MultisigProposals, CreateProposals, OriginateMultisig, NotFound } from './App';
import reportWebVitals from './reportWebVitals';
import './styles/index.scss';


ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}>
                    <Route index element={<MultisigParameters />} />
                    <Route path='proposals' element={<MultisigProposals />} />
                    <Route path='create' element={<CreateProposals />} />
                    <Route path='originate' element={<OriginateMultisig />} />
                    <Route path='*' element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
