import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import Clients from './pages/Admin/Clients';
import Properties from './pages/Admin/Properties';
import Login from './pages/Login';
import SetupAdmin from './pages/SetupAdmin';
import SeedDatabase from './pages/SeedDatabase';

import RegisterBroker from './pages/RegisterBroker';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SettingsProvider } from './contexts/SettingsContext';
import Settings from './pages/Admin/Settings';
import Messages from './pages/Admin/Messages';
import AdminUsers from './pages/Admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/seed-database" element={<SeedDatabase />} />
          <Route path="/register-broker" element={<RegisterBroker />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="properties" element={<Properties />} />
            <Route path="settings" element={<Settings />} />

            <Route path="messages" element={<Messages />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
