import React, { createContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra token khi app khởi động
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // Decode JWT payload để lấy username (không verify signature)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(base64));
                setUser({
                    username: payload.sub || payload.username || 'User'
                });
            } catch (e) {
                localStorage.removeItem('accessToken');
            }
        }
        setLoading(false);
    }, []);

    async function doLogin(credentials) {
        try {
            const res = await authService.login(credentials);
            const token = res.data?.result?.accessToken || res.data?.accessToken;

            if (!token) {
                throw new Error('No token received');
            }

            localStorage.setItem('accessToken', token);

            // Decode username từ token
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                username: payload.sub || credentials.username || 'User'
            });

            return res;
        } catch (err) {
            throw err;
        }
    }

    async function doLogout() {
        try {
            await authService.logout();
        } catch (e) {
            console.warn('Logout API failed:', e);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
        }
    }

    async function doRegister(data) {
        try {
            return await authService.register(data);
        } catch (err) {
            throw err;
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login: doLogin,
            logout: doLogout,
            register: doRegister
        }}>
            {children}
        </AuthContext.Provider>
    );
}