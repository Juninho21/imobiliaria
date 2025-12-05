import React from 'react';
import { Outlet, Link } from 'react-router-dom';

import { useSettings } from '../../contexts/SettingsContext';

const AdminLayout = () => {
    const { settings } = useSettings();
    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <a href="/#home" className="admin-logo">
                    {settings?.brandName}<i className='bx bxs-home-alt-2'></i>
                </a>
                <nav>
                    <ul className="admin-nav-ul">
                        <li className="admin-nav-li">
                            <Link to="/admin" className="admin-nav-link">
                                <i className='bx bxs-dashboard'></i> Dashboard
                            </Link>
                        </li>
                        <li className="admin-nav-li">
                            <Link to="/admin/clients" className="admin-nav-link">
                                <i className='bx bxs-user-detail'></i> Clientes
                            </Link>
                        </li>
                        <li className="admin-nav-li">
                            <Link to="/admin/properties" className="admin-nav-link">
                                <i className='bx bxs-building-house'></i> Imóveis
                            </Link>
                        </li>
                        <li className="admin-nav-li">
                            <Link to="/admin/messages" className="admin-nav-link">
                                <i className='bx bxs-message-dots'></i> Mensagens
                            </Link>
                        </li>
                        <li className="admin-nav-li">
                            <Link to="/admin/settings" className="admin-nav-link">
                                <i className='bx bxs-cog'></i> Configurações
                            </Link>
                        </li>
                        <li className="admin-nav-li">
                            <Link to="/admin/users" className="admin-nav-link">
                                <i className='bx bxs-user-plus'></i> Usuários
                            </Link>
                        </li>
                        <li>
                            <Link to="/" className="admin-nav-link-exit">
                                <i className='bx bx-exit'></i> Voltar ao Site
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
