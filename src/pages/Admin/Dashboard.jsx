import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
    const [stats, setStats] = useState({ clients: 0, properties: 0 });

    useEffect(() => {
        const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
            setStats(prev => ({ ...prev, clients: snap.size }));
        });

        const unsubProperties = onSnapshot(collection(db, 'properties'), (snap) => {
            setStats(prev => ({ ...prev, properties: snap.size }));
        });

        return () => {
            unsubClients();
            unsubProperties();
        };
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-color)' }}>Bem-vindo ao painel administrativo.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Clientes</h3>
                    <span style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--first-color)' }}>{stats.clients}</span>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Imóveis</h3>
                    <span style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--first-color)' }}>{stats.properties}</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
