import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsers = () => {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (password.length < 6) {
            return setError('A senha deve ter pelo menos 6 caracteres.');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);
            await signup(email, password);
            setSuccess('Usuário criado com sucesso! ATENÇÃO: Você foi logado na nova conta.');
            setEmail('');
            setPassword('');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está em uso.');
            } else {
                setError('Falha ao criar conta. Verifique os dados.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Gerenciar Usuários (Corretores)</h1>

            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Cadastrar Novo Corretor</h3>
                {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: '0.5rem' }}>{error}</div>}
                {success && <div style={{ color: 'green', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e8f5e9', borderRadius: '0.5rem' }}>{success}</div>}

                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    <i className='bx bx-info-circle'></i> Nota: Ao criar um novo usuário, o sistema fará login automaticamente na nova conta.
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Senha (Min. 6 caracteres)</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="button"
                        style={{ cursor: loading ? 'wait' : 'pointer', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Criando...' : 'Cadastrar Corretor'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminUsers;
