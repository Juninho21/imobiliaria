import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--body-font)' }}>
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--body-color)',
                borderRight: '1px solid var(--border-color)',
                padding: '2rem 1rem'
            }}>
                <h2 style={{ fontSize: 'var(--h2-font-size)', marginBottom: '2rem', color: 'var(--title-color)' }}>
                    Admin
                </h2>
                <nav>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ marginBottom: '1rem' }}>
                            <Link to="/admin" style={{ color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className='bx bxs-dashboard'></i> Dashboard
                            </Link>
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            <Link to="/admin/clients" style={{ color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className='bx bxs-user-detail'></i> Clientes
                            </Link>
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            <Link to="/admin/properties" style={{ color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className='bx bxs-building-house'></i> Imóveis
                            </Link>
                        </li>
                        <li>
                            <Link to="/" style={{ color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className='bx bx-exit'></i> Voltar ao Site
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--container-color)', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
