import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AmbientLayer from './components/ui/AmbientLayer';
import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

function App() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <SocketProvider>
                    {/* User Authentication Context Provider */}
                    <BrowserRouter>
                        {/* Global Ambient Background - Persistent across all routes */}
                        <AmbientLayer />
                        {/* Main Content Container */}
                        <Routes />
                    </BrowserRouter>
                </SocketProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
