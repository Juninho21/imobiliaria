import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClients(list);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'clients'), formData);
            setFormData({ name: '', email: '', phone: '' });
            alert('Cliente cadastrado!');
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert('Erro ao cadastrar.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            await deleteDoc(doc(db, 'clients', id));
        }
    }

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Clientes</h1>

            {/* Form */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Novo Cliente</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <input
                        type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input
                        type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input
                        type="tel" name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <button type="submit" className="button" style={{ cursor: 'pointer', maxWidth: '200px' }}>Cadastrar</button>
                </form>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {clients.map(client => (
                    <div key={client.id} style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ color: 'var(--title-color)' }}>{client.name}</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-color)' }}>{client.email} | {client.phone}</p>
                        </div>
                        <button onClick={() => handleDelete(client.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                            <i className='bx bx-trash'></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Clients;
