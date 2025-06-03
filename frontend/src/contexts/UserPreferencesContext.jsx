import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
};

const DEFAULT_PREFERENCES = {
    // Editor preferences
    theme: 'dark',
    fontSize: 14,
    fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
    tabSize: 4,
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    
    // UI preferences
    sidebarCollapsed: false,
    chatNotifications: true,
    autoSave: true,
    
    // Coding preferences
    autoCompletion: true,
    bracketMatching: true,
    highlightActiveLine: true,
    indentWithTabs: false,
    
    // Terminal preferences
    terminalFontSize: 12,
    terminalTheme: 'dark'
};

export const UserPreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [isLoading, setIsLoading] = useState(true);

    // Load preferences from localStorage when component mounts or user changes
    useEffect(() => {
        const loadPreferences = () => {
            try {
                const userId = auth.currentUser?.uid;
                if (userId) {
                    const storageKey = `userPreferences_${userId}`;
                    const savedPreferences = localStorage.getItem(storageKey);
                    if (savedPreferences) {
                        const parsed = JSON.parse(savedPreferences);
                        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
                    }
                }
            } catch (error) {
                console.error('Error loading user preferences:', error);
                setPreferences(DEFAULT_PREFERENCES);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();

        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(() => {
            loadPreferences();
        });

        return () => unsubscribe();
    }, []);

    // Save preferences to localStorage whenever they change
    useEffect(() => {
        if (!isLoading && auth.currentUser?.uid) {
            try {
                const userId = auth.currentUser.uid;
                const storageKey = `userPreferences_${userId}`;
                localStorage.setItem(storageKey, JSON.stringify(preferences));
            } catch (error) {
                console.error('Error saving user preferences:', error);
            }
        }
    }, [preferences, isLoading]);

    const updatePreference = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const updatePreferences = (newPreferences) => {
        setPreferences(prev => ({
            ...prev,
            ...newPreferences
        }));
    };

    const resetPreferences = () => {
        setPreferences(DEFAULT_PREFERENCES);
    };

    const getPreference = (key) => {
        return preferences[key] ?? DEFAULT_PREFERENCES[key];
    };

    const value = {
        preferences,
        updatePreference,
        updatePreferences,
        resetPreferences,
        getPreference,
        isLoading
    };

    return (
        <UserPreferencesContext.Provider value={value}>
            {children}
        </UserPreferencesContext.Provider>
    );
};
