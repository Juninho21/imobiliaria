import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import Clients from './pages/Admin/Clients';
import Properties from './pages/Admin/Properties';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="properties" element={<Properties />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
