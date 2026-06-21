import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [currentSessionId, setCurrentSessionId] = useState(() => {
        return localStorage.getItem('chatSessionId');
    });

    const setSessionId = (id) => {
        setCurrentSessionId(id);
        if (id) {
            localStorage.setItem('chatSessionId', id);
        } else {
            localStorage.removeItem('chatSessionId');
        }
    };

    const clearSession = () => {
        setCurrentSessionId(null);
        localStorage.removeItem('chatSessionId');
    };

    return (
        <SessionContext.Provider value={{ currentSessionId, setSessionId, clearSession }}>
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
