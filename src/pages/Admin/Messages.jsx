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
                    <div key={msg.id} style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ color: 'var(--title-color)' }}>{msg.name}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{formatDate(msg.createdAt)}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(msg.id)}
                                style={{
                                    color: 'red',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'background 0.3s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffebee'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Excluir mensagem"
                            >
                                <i className='bx bx-trash'></i>
                            </button>
                        </div>

                        <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Telefone</span>
                                    <span style={{ fontWeight: '500' }}>{msg.phone || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Preferência</span>
                                    <span style={{ fontWeight: '500' }}>{msg.returnPreference || '-'}</span>
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Mensagem</span>
                                <p style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Messages;
