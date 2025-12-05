import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({ title: '', price: '', description: '', imageUrl: '' });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'properties'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProperties(list);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'properties'), formData);
            setFormData({ title: '', price: '', description: '', imageUrl: '' });
            alert('Imóvel cadastrado!');
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert('Erro ao cadastrar.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            await deleteDoc(doc(db, 'properties', id));
        }
    }

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Imóveis (Venda)</h1>

            {/* Form */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Novo Imóvel</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <input
                        type="text" name="title" placeholder="Título (ex: Casa 3 Quartos)" value={formData.title} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input
                        type="text" name="price" placeholder="Preço (ex: 250.000)" value={formData.price} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input
                        type="text" name="imageUrl" placeholder="URL da Imagem (ex: /assets/images/home.jpg)" value={formData.imageUrl} onChange={handleChange}
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <textarea
                        name="description" placeholder="Descrição/Endereço" value={formData.description} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', height: '100px' }}
                    ></textarea>

                    <button type="submit" className="button" style={{ cursor: 'pointer', maxWidth: '200px' }}>Cadastrar</button>
                </form>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {properties.map(property => (
                    <div key={property.id} style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {property.imageUrl && <img src={property.imageUrl} alt={property.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />}
                        <h4 style={{ color: 'var(--title-color)' }}>{property.title}</h4>
                        <span style={{ color: 'var(--first-color)', fontWeight: '600' }}>R$ {property.price}</span>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-color)' }}>{property.description}</p>
                        <button onClick={() => handleDelete(property.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-end', marginTop: 'auto' }}>
                            <i className='bx bx-trash' style={{ fontSize: '1.25rem' }}></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Properties;
