import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AdminUsers = () => {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const [inviteLink, setInviteLink] = useState('');

    const generateInviteLink = async () => {
        try {
            setLoading(true);
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await addDoc(collection(db, 'invites'), {
                token: token,
                used: false,
                createdAt: serverTimestamp()
            });
            const url = window.location.origin + '/register-broker?token=' + token;
            setInviteLink(url);
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar convite.');
        } finally {
            setLoading(false);
        }
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert('Link copiado!');
    }

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

            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Gerar Convite Único</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Gera um link que só pode ser usado uma única vez para cadastro.
                </p>

                {!inviteLink ? (
                    <button
                        onClick={generateInviteLink}
                        disabled={loading}
                        className="button"
                        style={{ cursor: loading ? 'wait' : 'pointer' }}
                    >
                        {loading ? 'Gerando...' : 'Gerar Novo Convite'}
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: '#f5f5f5', borderRadius: '0.5rem', wordBreak: 'break-all', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                            {inviteLink}
                        </div>
                        <button
                            onClick={copyInviteLink}
                            className="button"
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <i className='bx bx-copy'></i> Copiar Link
                        </button>
                        <button
                            onClick={() => setInviteLink('')}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem', marginTop: '0.5rem' }}
                        >
                            Gerar Outro
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Cadastrar Manualmente</h3>
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
            </div >
        </div >
    );
};

export default AdminUsers;
