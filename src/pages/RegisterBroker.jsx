import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const RegisterBroker = () => {
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [inviteDocId, setInviteDocId] = useState(null);
    const [verifying, setVerifying] = useState(true);
    const [tokenError, setTokenError] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setTokenError('Link inválido. Token não encontrado.');
                setVerifying(false);
                return;
            }
            try {
                const q = query(collection(db, 'invites'), where('token', '==', token), where('used', '==', false));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setTokenError('Este convite é inválido ou já foi utilizado.');
                } else {
                    setInviteDocId(querySnapshot.docs[0].id);
                }
            } catch (err) {
                console.error(err);
                setTokenError('Erro ao verificar convite.');
            } finally {
                setVerifying(false);
            }
        };
        verifyToken();
    }, [token]);

    const markTokenAsUsed = async () => {
        if (inviteDocId) {
            await updateDoc(doc(db, 'invites', inviteDocId), {
                used: true,
                usedAt: serverTimestamp()
            });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            return setError('A senha deve ter pelo menos 6 caracteres.');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            await markTokenAsUsed();
            alert('Conta criada com sucesso! Você será redirecionado para o painel.');
            navigate('/admin');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está em uso.');
            } else {
                setError('Falha ao criar conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            await markTokenAsUsed();
            navigate('/admin');
        } catch (err) {
            setError('Falha ao entrar com Google.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (verifying) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Verificando convite...</div>;
    }

    if (tokenError) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: 'red' }}>Acesso Negado</h2>
                <p>{tokenError}</p>
                <button onClick={() => navigate('/')} className="button" style={{ maxWidth: '200px' }}>Voltar ao Início</button>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '1rem' }}>
            <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)', maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--title-color)' }}>Cadastro de Corretor</h2>

                {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}

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
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                    <span style={{ padding: '0 0.5rem', color: '#888', fontSize: '0.8rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #ddd',
                        backgroundColor: '#fff',
                        color: '#333',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                    }}
                >
                    <i className='bx bxl-google' style={{ fontSize: '1.25rem', color: '#DB4437' }}></i>
                    Entrar com Google
                </button>
            </div>
        </div>
    );
};

export default RegisterBroker;
