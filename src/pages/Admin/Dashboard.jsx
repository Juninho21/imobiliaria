import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-color)' }}>Bem-vindo ao painel administrativo.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Clientes</h3>
                    <span style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--first-color)' }}>-</span>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Imóveis</h3>
                    <span style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--first-color)' }}>-</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
