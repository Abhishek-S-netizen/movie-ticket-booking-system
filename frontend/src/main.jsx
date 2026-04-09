import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIFeedbackProvider } from './context/UIFeedbackContent';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <UIFeedbackProvider>
                    <App />
                </UIFeedbackProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
