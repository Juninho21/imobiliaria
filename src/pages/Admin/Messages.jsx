import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(list);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja apagar esta mensagem?')) {
            await deleteDoc(doc(db, 'messages', id));
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Mensagens Recebidas</h1>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {messages.length === 0 && <p>Nenhuma mensagem recebida ainda.</p>}

                {messages.map(msg => (
                    <div key={msg.id} style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h3 style={{ color: 'var(--title-color)' }}>{msg.name}</h3>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{formatDate(msg.createdAt)}</span>
                        </div>

                        <p style={{ marginBottom: '0.25rem' }}><strong>Telefone:</strong> {msg.phone}</p>
                        <p style={{ marginBottom: '0.25rem' }}><strong>Preferência:</strong> {msg.returnPreference}</p>

                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '0.5rem' }}>
                            <p style={{ fontStyle: 'italic' }}>"{msg.message}"</p>
                        </div>

                        <button
                            onClick={() => handleDelete(msg.id)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                color: 'red',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.25rem'
                            }}
                            title="Excluir mensagem"
                        >
                            <i className='bx bx-trash'></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Messages;
