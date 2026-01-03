import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const userData = await userAPI.getMe();
                    setUser({
                        ...userData,
                        name: `${userData.firstName} ${userData.lastName}`,
                        avatar: userData.profileImage || `https://i.pravatar.cc/150?u=${userData.email}`,
                    });
                } catch (error) {
                    // Token is invalid, clear it
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await authAPI.login(email, password);
            
            // Check if result has the expected structure
            if (!result || !result.user || !result.accessToken) {
                throw new Error('Invalid response from server');
            }
            
            const { user: userData, accessToken, refreshToken } = result;
            
            // Store tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Set user state
            setUser({
                ...userData,
                name: `${userData.firstName} ${userData.lastName}`,
                avatar: userData.profileImage || `https://i.pravatar.cc/150?u=${userData.email}`,
            });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'Login failed. Please check your credentials.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear tokens and user state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
