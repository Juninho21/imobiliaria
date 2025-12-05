import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const cached = localStorage.getItem('appSettings');
        return cached ? JSON.parse(cached) : null;
    });
    const [loading, setLoading] = useState(() => !localStorage.getItem('appSettings'));

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSettings(data);
                localStorage.setItem('appSettings', JSON.stringify(data));
            } else {
                // Creates default if not exists
                setDoc(doc.ref, { brandName: 'Alberto Almeida' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
