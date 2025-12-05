import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SetupAdmin() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleCreateAdmin() {
        try {
            setMessage('');
            setError('');
            setLoading(true);

            // Creating the requested admin user
            await signup('juninhomarinho22@gmail.com', 'Ju2025BR');

            setMessage('Administrador criado com sucesso! Redirecionando para login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else {
                setError('Falha ao criar conta: ' + err.message);
            }
        }
        setLoading(false);
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f3f4f6'
        }}>
            <div style={{
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Configuração Inicial</h2>
                <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>Clique abaixo para registrar o primeiro administrador.</p>

                {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                <button
                    onClick={handleCreateAdmin}
                    disabled={loading}
                    style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Criando...' : 'Criar Admin: juninhomarinho22@gmail.com'}
                </button>
            </div>
        </div>
    );
}
