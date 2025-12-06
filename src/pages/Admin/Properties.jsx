import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({ title: '', price: '', description: '', label: '', labelColor: '#4d7df2' });
    const [editingId, setEditingId] = useState(null);
    const [originalPhotoCount, setOriginalPhotoCount] = useState(0); // To track count during edit
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gallery & Modal State
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(false);

    // Zoom/Expanded View State
    const [expandedIndex, setExpandedIndex] = useState(null); // Changed from expandedImage to Index
    const [allImages, setAllImages] = useState([]); // Array of all images in current view

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'properties'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by createdAt descending
            list.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setProperties(list);
        });
        return () => unsubscribe();
    }, []);

    // Load gallery when a property is selected
    useEffect(() => {
        if (selectedProperty) {
            setGalleryLoading(true);
            const galleryRef = collection(db, 'properties', selectedProperty.id, 'gallery');
            const unsubscribe = onSnapshot(galleryRef, (snapshot) => {
                const images = snapshot.docs
                    .map(doc => doc.data())
                    .sort((a, b) => a.index - b.index); // Sort by index
                setGalleryImages(images);
                setGalleryLoading(false);
            });
            return () => unsubscribe();
        } else {
            setGalleryImages([]);
        }
    }, [selectedProperty]);

    // Update allImages list whenever selectedProperty or galleryImages changes
    useEffect(() => {
        if (selectedProperty) {
            const imgs = [];
            if (selectedProperty.imageUrl) imgs.push(selectedProperty.imageUrl);
            galleryImages.forEach(img => imgs.push(img.imageBase64));
            setAllImages(imgs);
        } else {
            setAllImages([]);
        }
    }, [selectedProperty, galleryImages]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 8) {
                alert("Máximo de 8 imagens permitidas.");
                e.target.value = "";
                setImageFiles([]);
                return;
            }
            setImageFiles(files);
        }
    };

    const resizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG at 80% quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let coverImageUrl = '';

            // Validacao
            if (imageFiles.length > 0) {
                for (let file of imageFiles) {
                    if (file.size > 750000) {
                        alert(`A imagem ${file.name} é muito grande (Máx 750KB).`);
                        setLoading(false);
                        return;
                    }
                }
                // Capa = Primeira Imagem
                console.log("Redimensionando capa...");
                coverImageUrl = await resizeImage(imageFiles[0]);
            }

            if (editingId) {
                // UPDATE
                console.log("Atualizando imóvel...", editingId);
                const docRef = doc(db, 'properties', editingId);
                const updateData = { ...formData };

                if (coverImageUrl) {
                    updateData.imageUrl = coverImageUrl;
                }

                if (imageFiles.length > 0) {
                    updateData.photoCount = originalPhotoCount + imageFiles.length;
                }

                await updateDoc(docRef, updateData);
                console.log("Imóvel atualizado!");

            } else {
                // CREATE
                console.log("Salvando imóvel...");
                const docRef = await addDoc(collection(db, 'properties'), {
                    ...formData,
                    imageUrl: coverImageUrl,
                    photoCount: imageFiles.length > 0 ? imageFiles.length : 0,
                    createdAt: serverTimestamp()
                });
                console.log("Imóvel criado:", docRef.id);
                // Assign for gallery usage below (for new docs)
                var newDocId = docRef.id;
            }

            // Subcolecao Galeria (Common logic, needs docId)
            const targetId = editingId || newDocId;

            if (imageFiles.length > 0 && targetId) {
                console.log("Salvando galeria no ID:", targetId);
                const galleryRef = collection(db, 'properties', targetId, 'gallery');

                const uploadPromises = imageFiles.map(async (file, index) => {
                    const base64 = await resizeImage(file);
                    // If editing, we append to end? Or just add. Index might overlap but sorting handles it?
                    // Let's just add.
                    return addDoc(galleryRef, {
                        imageBase64: base64,
                        index: index, // This might duplicate indices if editing, but typically fine for basic list
                        name: file.name
                    });
                });
                await Promise.all(uploadPromises);
            }

            console.log("Sucesso!");
            setFormData({ title: '', price: '', description: '', label: '', labelColor: '#4d7df2' });
            setEditingId(null);
            setOriginalPhotoCount(0);
            setImageFiles([]);
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = "";

            alert('Imóvel e fotos cadastrados com sucesso!');
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert('Erro ao cadastrar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            await deleteDoc(doc(db, 'properties', id));
        }
    }

    const handleEdit = (property) => {
        setEditingId(property.id);
        setFormData({
            title: property.title,
            price: property.price,
            description: property.description,
            label: property.label || '',
            labelColor: property.labelColor || '#4d7df2'
        });
        setOriginalPhotoCount(property.photoCount || 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', price: '', description: '', label: '', labelColor: '#4d7df2' });
        setOriginalPhotoCount(0);
        setImageFiles([]);
    }

    // Navigation Handlers
    const handleNext = (e) => {
        e.stopPropagation();
        if (expandedIndex !== null && expandedIndex < allImages.length - 1) {
            setExpandedIndex(expandedIndex + 1);
        }
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (expandedIndex !== null && expandedIndex > 0) {
            setExpandedIndex(expandedIndex - 1);
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (expandedIndex !== null) {
                if (e.key === 'ArrowRight') handleNext(e);
                if (e.key === 'ArrowLeft') handlePrev(e);
                if (e.key === 'Escape') setExpandedIndex(null);
            } else if (selectedProperty) {
                if (e.key === 'Escape') setSelectedProperty(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedIndex, allImages, selectedProperty]);


    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Imóveis (Venda)</h1>

            {/* Form */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>{editingId ? 'Editar Imóvel' : 'Novo Imóvel'}</h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} style={{ background: '#ccc', color: '#333', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <input
                        type="text" name="title" placeholder="Título (ex: Casa 3 Quartos)" value={formData.title} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                        <input
                            type="text" name="price" placeholder="Preço (ex: 250.000)" value={formData.price} onChange={handleChange} required
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="text" name="label" placeholder="Etiqueta (ex: Lançamento)" value={formData.label} onChange={handleChange}
                                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                            />

                            {/* Color Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-color)' }}>Cor:</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[
                                        '#4d7df2', // Blue
                                        '#00C853', // Green
                                        '#FFD600', // Yellow
                                        '#FF3D00', // Red
                                        '#AA00FF'  // Purple
                                    ].map(color => (
                                        <div
                                            key={color}
                                            onClick={() => setFormData({ ...formData, labelColor: color })}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: color,
                                                cursor: 'pointer',
                                                border: '2px solid white',
                                                boxShadow: formData.labelColor === color ? `0 0 0 2px ${color}` : '0 1px 3px rgba(0,0,0,0.1)',
                                                transform: formData.labelColor === color ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s'
                                            }}
                                            title={color}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-color)' }}>Fotos do Imóvel (Máx 8 fotos, Máx 750KB cada)</label>
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                        />
                        {imageFiles.length > 0 && (
                            <span style={{ fontSize: '0.8rem', color: 'green' }}>{imageFiles.length} fotos selecionadas.</span>
                        )}
                    </div>

                    <textarea
                        name="description" placeholder="Descrição/Endereço" value={formData.description} onChange={handleChange} required
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', height: '100px' }}
                    ></textarea>

                    <button
                        type="submit"
                        disabled={loading}
                        className="button"
                        style={{ cursor: loading ? 'wait' : 'pointer', maxWidth: '200px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                    </button>
                </form>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {properties.map(property => (
                    <div key={property.id} style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                        {/* Imagem + Badge Contadora */}
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setSelectedProperty(property)}>
                            {property.imageUrl ? (
                                <img src={property.imageUrl} alt={property.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                            ) : (
                                <div style={{ width: '100%', height: '150px', backgroundColor: '#eee', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Sem Imagem</div>
                            )}

                            {property.photoCount > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '8px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <i className='bx bxs-camera'></i> {property.photoCount}
                                </div>
                            )}

                            {property.label && (
                                <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '8px',
                                    backgroundColor: property.labelColor || 'var(--first-color)',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}>
                                    {property.label}
                                </span>
                            )}
                        </div>

                        <h4 style={{ color: 'var(--title-color)' }}>{property.title}</h4>
                        <span style={{ color: 'var(--first-color)', fontWeight: '600' }}>R$ {property.price}</span>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-color)' }}>{property.description}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignSelf: 'flex-end' }}>
                            <button onClick={() => handleEdit(property)} style={{ color: 'var(--first-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <i className='bx bx-edit' style={{ fontSize: '1.25rem' }}></i>
                            </button>
                            <button onClick={() => handleDelete(property.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <i className='bx bx-trash' style={{ fontSize: '1.25rem' }}></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gallery Modal */}
            {selectedProperty && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={() => setSelectedProperty(null)}>

                    <div style={{
                        width: '90%', maxWidth: '800px', maxHeight: '90vh',
                        backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem',
                        overflowY: 'auto', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>{selectedProperty.title} - Galeria</h3>
                            <button onClick={() => setSelectedProperty(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {galleryLoading ? (
                            <p>Carregando fotos...</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                                {/* Capa Sempre Primeiro */}
                                {selectedProperty.imageUrl && (
                                    <img
                                        src={selectedProperty.imageUrl}
                                        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '0.5rem', border: '2px solid var(--first-color)', cursor: 'zoom-in' }}
                                        onClick={() => setExpandedIndex(0)} // Index 0 is always cover if exists
                                    />
                                )}

                                {/* Outras Fotos */}
                                {galleryImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.imageBase64}
                                        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '0.5rem', cursor: 'zoom-in' }}
                                        onClick={() => setExpandedIndex(selectedProperty.imageUrl ? idx + 1 : idx)}
                                    />
                                ))}
                            </div>
                        )}
                        {!galleryLoading && galleryImages.length === 0 && !selectedProperty.imageUrl && (
                            <p>Nenhuma foto encontrada.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Expanded Image Modal Overlay with Navigation */}
            {expandedIndex !== null && allImages[expandedIndex] && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={() => setExpandedIndex(null)}>

                    {/* Previous Button */}
                    {expandedIndex > 0 && (
                        <button
                            onClick={handlePrev}
                            style={{
                                position: 'absolute', left: '20px', color: 'white',
                                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                                width: '50px', height: '50px', fontSize: '2rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 10001
                            }}
                        >
                            &#8249;
                        </button>
                    )}

                    <img
                        src={allImages[expandedIndex]}
                        style={{ width: '90vw', height: '85vh', objectFit: 'contain', borderRadius: '4px' }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />

                    {/* Next Button */}
                    {expandedIndex < allImages.length - 1 && (
                        <button
                            onClick={handleNext}
                            style={{
                                position: 'absolute', right: '20px', color: 'white',
                                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                                width: '50px', height: '50px', fontSize: '2rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 10001
                            }}
                        >
                            &#8250;
                        </button>
                    )}

                    <button
                        onClick={() => setExpandedIndex(null)}
                        style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', zIndex: 10002 }}
                    >
                        &times;
                    </button>

                    <div style={{ position: 'absolute', bottom: '20px', color: 'white' }}>
                        {expandedIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Properties;
