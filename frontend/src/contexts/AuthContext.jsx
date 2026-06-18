import React, { createContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra token khi app khởi động
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token) {
                try {
                    // Decode JWT payload để lấy username (không verify signature)
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(atob(base64));
                    const now = Date.now() / 1000;

                    if (payload.exp < now) {
                        // Access token hết hạn, thử refresh token
                        if (refreshToken) {
                            try {
                                const res = await authService.refresh(refreshToken);
                                const newAccessToken = res.data?.result?.accessToken || res.data?.accessToken;
                                const newRefreshToken = res.data?.result?.refreshToken || res.data?.refreshToken || refreshToken;

                                if (newAccessToken) {
                                    localStorage.setItem('accessToken', newAccessToken);
                                    localStorage.setItem('refreshToken', newRefreshToken);

                                    const storedUser = localStorage.getItem("user");
                                    if (storedUser) {
                                        setUser(JSON.parse(storedUser));
                                    } else {
                                        setUser({
                                            username: payload.sub || payload.username || 'User'
                                        });
                                    }
                                } else {
                                    throw new Error('No access token in refresh response');
                                }
                            } catch (e) {
                                console.error('Refresh token failed during init:', e);
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                setUser(null);
                            }
                        } else {
                            localStorage.removeItem('accessToken');
                            setUser(null);
                        }
                    } else {
                        // Token vẫn còn hạn
                        const storedUser = localStorage.getItem("user");
                        if (storedUser) {
                            setUser(JSON.parse(storedUser));
                        } else {
                            setUser({
                                username: payload.sub || payload.username || 'User'
                            });
                        }
                    }
                } catch (e) {
                    console.error('Auth init error:', e);
                    localStorage.removeItem('accessToken');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    async function doLogin(credentials) {
        try {
            const res = await authService.login(credentials);
            const token = res.data?.result?.accessToken || res.data?.accessToken;
            const refreshToken = res.data?.result?.refreshToken || res.data?.refreshToken;

            if (!token) {
                throw new Error('No token received');
            }

            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refreshToken);

            const authData = res.data?.result || res.data;

            setUser({
                id: authData.id,
                username: authData.username,
                fullName: authData.fullName,
                biography: authData.biography,
                avatarUrl: authData.avatarUrl,
                email: authData.email
            });

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: authData.id,
                    username: authData.username,
                    fullName: authData.fullName,
                    biography: authData.biography,
                    avatarUrl: authData.avatarUrl,
                    email: authData.email
                })
            );

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
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
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