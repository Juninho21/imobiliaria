import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function SeedDatabase() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const sampleClients = [
        { name: "Maria Silva", email: "maria@example.com", phone: "(11) 99999-1111" },
        { name: "João Santos", email: "joao@example.com", phone: "(21) 98888-2222" },
        { name: "Ana Oliveira", email: "ana@example.com", phone: "(31) 97777-3333" }
    ];

    const sampleProperties = [
        {
            title: "Casa de Luxo no Lago",
            price: "1.250.000",
            description: "Linda casa com vista para o lago, 4 quartos, piscina.",
            imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "Apartamento Moderno Centro",
            price: "450.000",
            description: "Apartamento 2 quartos, perto de tudo, acabamento fino.",
            imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "Chácara Recanto Verde",
            price: "890.000",
            description: "Para quem busca paz e natureza. 5000m² de área verde.",
            imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
        }
    ];

    async function handleSeed() {
        setLoading(true);
        setMessage('Iniciando...');
        try {
            const clientsRef = collection(db, 'clients');
            const propsRef = collection(db, 'properties');

            // Add Clients
            for (const client of sampleClients) {
                await addDoc(clientsRef, client);
            }

            // Add Properties
            for (const prop of sampleProperties) {
                await addDoc(propsRef, prop);
            }

            setMessage(`Sucesso! Criados ${sampleClients.length} clientes e ${sampleProperties.length} imóveis.`);
        } catch (error) {
            console.error(error);
            setMessage('Erro ao popular banco de dados: ' + error.message);
        }
        setLoading(false);
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Popular Banco de Dados</h1>
            <p>Clique abaixo para criar dados de exemplo (Clientes e Imóveis).</p>

            {message && <p style={{ margin: '1rem 0', fontWeight: 'bold' }}>{message}</p>}

            <button
                onClick={handleSeed}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'var(--first-color, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem'
                }}
            >
                {loading ? 'Criando...' : 'Criar Tabelas e Dados'}
            </button>
        </div>
    );
}
