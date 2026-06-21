import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [currentSessionId, setCurrentSessionId] = useState(() => {
        return localStorage.getItem('chatSessionId');
    });

    const [currentPhilosopherId, setCurrentPhilosopherId] = useState(() => {
        return localStorage.getItem('chatPhilosopherId');
    });

    const setSessionId = (id) => {
        setCurrentSessionId(id);
        if (id) {
            localStorage.setItem('chatSessionId', id);
        } else {
            localStorage.removeItem('chatSessionId');
        }
    };

    const setPhilosopherId = (id) => {
        setCurrentPhilosopherId(id);
        if (id) {
            localStorage.setItem('chatPhilosopherId', id);
        } else {
            localStorage.removeItem('chatPhilosopherId');
        }
    };

    const switchSession = (sessionId, philosopherId) => {
        setSessionId(sessionId);
        setPhilosopherId(philosopherId);
    };

    const clearSession = () => {
        setCurrentSessionId(null);
        localStorage.removeItem('chatSessionId');
    };

    return (
        <SessionContext.Provider value={{
            currentSessionId,
            setSessionId,
            currentPhilosopherId,
            setPhilosopherId,
            switchSession,
            clearSession
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
