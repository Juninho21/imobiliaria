import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({ title: '', price: '', description: '', label: '', labelColor: '#4d7df2', code: '', hidePrice: false });
    const [editingId, setEditingId] = useState(null);
    const [originalPhotoCount, setOriginalPhotoCount] = useState(0);
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gallery & Modal State
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(false);

    // Unified Display Images (Cover + Gallery) for D&D
    const [displayImages, setDisplayImages] = useState([]);

    // Zoom/Expanded View State
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [allImages, setAllImages] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'properties'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setProperties(list);
        });
        return () => unsubscribe();
    }, []);

    // Load gallery
    useEffect(() => {
        if (selectedProperty) {
            setGalleryLoading(true);
            const galleryRef = collection(db, 'properties', selectedProperty.id, 'gallery');
            const unsubscribe = onSnapshot(galleryRef, (snapshot) => {
                const images = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => a.index - b.index);
                setGalleryImages(images);
                setGalleryLoading(false);
            });
            return () => unsubscribe();
        } else {
            setGalleryImages([]);
        }
    }, [selectedProperty]);

    // Sync Unified List (Cover + Gallery)
    useEffect(() => {
        if (selectedProperty && !draggedItemIndex && draggedItemIndex !== 0) { // Only sync if not dragging
            const currentProperty = properties.find(p => p.id === selectedProperty.id) || selectedProperty;
            const combined = [];
            // 1. Cover
            if (currentProperty.imageUrl) {
                combined.push({
                    id: 'COVER_PHOTO', // Special ID
                    isCover: true,
                    imageBase64: currentProperty.imageUrl,
                    name: 'Foto Principal'
                });
            }
            // 2. Gallery
            galleryImages.forEach(img => {
                combined.push({ ...img, isCover: false });
            });
            setDisplayImages(combined);
            setAllImages(combined.map(i => i.imageBase64));
        } else if (!selectedProperty) {
            setDisplayImages([]);
            setAllImages([]);
        }
    }, [selectedProperty, galleryImages, properties]);


    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 10) {
                alert("Máximo de 10 imagens permitidas.");
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
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const generateCode = () => {
        const min = 1000;
        const max = 9999;
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        return `REF-${num}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let coverImageUrl = '';

            if (imageFiles.length > 0) {
                console.log("Redimensionando capa...");
                coverImageUrl = await resizeImage(imageFiles[0]);
            }

            // Generate code if missing
            let propertyCode = formData.code;
            if (!propertyCode) {
                propertyCode = generateCode();
            }

            if (editingId) {
                console.log("Atualizando imóvel...", editingId);
                // Safety check
                if (!properties.find(p => p.id === editingId)) {
                    alert("Erro: Este imóvel não existe mais.");
                    setLoading(false);
                    return;
                }

                const docRef = doc(db, 'properties', editingId);
                const updateData = { ...formData, code: propertyCode };
                if (coverImageUrl) updateData.imageUrl = coverImageUrl;
                if (imageFiles.length > 0) updateData.photoCount = originalPhotoCount + imageFiles.length;

                await updateDoc(docRef, updateData);

            } else {
                console.log("Salvando imóvel...");
                const docRef = await addDoc(collection(db, 'properties'), {
                    ...formData,
                    code: propertyCode,
                    imageUrl: coverImageUrl,
                    photoCount: imageFiles.length > 0 ? imageFiles.length : 0,
                    createdAt: serverTimestamp()
                });
                var newDocId = docRef.id;
            }

            const targetId = editingId || newDocId;

            if (imageFiles.length > 0 && targetId) {
                console.log("Salvando galeria no ID:", targetId);
                const galleryRef = collection(db, 'properties', targetId, 'gallery');

                const uploadPromises = imageFiles.map(async (file, index) => {
                    const base64 = await resizeImage(file);
                    return addDoc(galleryRef, {
                        imageBase64: base64,
                        index: index,
                        name: file.name
                    });
                });
                await Promise.all(uploadPromises);
            }

            console.log("Sucesso!");
            setFormData({ title: '', price: '', description: '', label: '', labelColor: '#4d7df2', code: '', hidePrice: false });
            setEditingId(null);
            setOriginalPhotoCount(0);
            setImageFiles([]);
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = "";
            alert('Salvo com sucesso!');
        } catch (error) {
            console.error("Erro:", error);
            alert('Erro: ' + error.message);
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
            labelColor: property.labelColor || '#4d7df2',
            code: property.code || '',
            hidePrice: property.hidePrice || false,
        });
        setOriginalPhotoCount(property.photoCount || 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', price: '', description: '', label: '', labelColor: '#4d7df2', code: '', hidePrice: false });
        setOriginalPhotoCount(0);
        setImageFiles([]);
    }

    // --- DRAG AND DROP & DELETE (Unified) ---
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const handleDeleteImage = async (item, index) => {
        if (!window.confirm(`Excluir ${item.isCover ? 'a Foto Principal' : 'esta imagem'}?`)) return;

        try {
            const batch = writeBatch(db);
            const propRef = doc(db, 'properties', selectedProperty.id);

            // Removing item at 'index'.
            // If we remove item at 0 (Cover), item at 1 becomes Cover.

            const newOrder = [...displayImages];
            newOrder.splice(index, 1);

            // 1. Update Property Cover
            if (newOrder.length > 0) {
                // New Cover is newOrder[0]
                batch.update(propRef, { imageUrl: newOrder[0].imageBase64 });
            } else {
                // No images left
                batch.update(propRef, { imageUrl: '' });
            }

            // 2. Handle Old Cover (if we deleted the cover)
            // If item.isCover, we don't need to delete from gallery (it wasn't there).
            // But if we promoted index 1 to 0, index 1 (which was gallery) must be deleted from gallery to avoid duplication?
            // "Unified" means: Index 0 is stored ONLY in properties.imageUrl. Index >0 stored ONLY in gallery.
            // So if I delete Index 0:
            //   - Check if Index 1 exists.
            //   - If yes, take its content, put in settings.imageUrl.
            //   - DELETE Index 1's doc from gallery.

            if (index === 0) { // Deleting Cover
                // Old cover is gone (it was just a field).
                // New cover is old index 1.
                if (displayImages.length > 1) {
                    const splitItem = displayImages[1]; // The one moving to #0
                    // Delete it from gallery since it's now Cover
                    const subDoc = doc(db, 'properties', selectedProperty.id, 'gallery', splitItem.id);
                    batch.delete(subDoc);
                }
            } else {
                // Deleting a gallery item
                const subDoc = doc(db, 'properties', selectedProperty.id, 'gallery', item.id);
                batch.delete(subDoc);
            }

            await batch.commit();

            // Optimistic update will be overwritten by snapshot, but update immediately for feel
            setDisplayImages(newOrder);

        } catch (error) {
            console.error("Erro deletar:", error);
            alert("Erro ao deletar.");
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

        const newImages = [...displayImages];
        const [movedItem] = newImages.splice(draggedItemIndex, 1);
        newImages.splice(targetIndex, 0, movedItem);

        // Optimistic
        setDisplayImages(newImages);
        setDraggedItemIndex(null);

        // COMMIT LOGIC
        try {
            const batch = writeBatch(db);
            const propRef = doc(db, 'properties', selectedProperty.id);
            const galleryRef = collection(db, 'properties', selectedProperty.id, 'gallery');

            // 1. Handle New Cover (Index 0)
            const newCover = newImages[0];
            if (newCover) {
                // Update Property Field
                batch.update(propRef, { imageUrl: newCover.imageBase64 });

                // If this item CAME FROM gallery (has ID != COVER_PHOTO), delete from gallery
                if (!newCover.isCover) {
                    const oldDoc = doc(galleryRef, newCover.id);
                    batch.delete(oldDoc);
                }
            }

            // 2. Handle Gallery Items (Index 1+)
            for (let i = 1; i < newImages.length; i++) {
                const img = newImages[i];
                const realIndex = i - 1; // Gallery index starts at 0

                if (img.isCover) {
                    // This was the old cover, now moving to gallery. Create new doc.
                    const newDocRef = doc(galleryRef); // Auto ID
                    batch.set(newDocRef, {
                        imageBase64: img.imageBase64,
                        index: realIndex,
                        name: img.name || 'Foto'
                    });
                } else {
                    // Existing gallery item. Update index.
                    const docRef = doc(galleryRef, img.id);
                    batch.update(docRef, { index: realIndex });
                }
            }

            await batch.commit();

        } catch (error) {
            console.error("Erro salvar ordem:", error);
            alert("Erro ao salvar ordem.");
            // Revert would happen by next snapshot refresh essentially
        }
    };

    // Navigation (Zoom)
    const handleNext = (e) => {
        e.stopPropagation();
        if (expandedIndex !== null && expandedIndex < allImages.length - 1) setExpandedIndex(expandedIndex + 1);
    };
    const handlePrev = (e) => {
        e.stopPropagation();
        if (expandedIndex !== null && expandedIndex > 0) setExpandedIndex(expandedIndex - 1);
    };

    // Add Photos from Gallery Modal
    const handleAddGalleryPhotos = async (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const currentCount = displayImages.length;
            if (currentCount + files.length > 10) {
                alert(`Você só pode ter até 10 fotos. Atualmente há ${currentCount}.`);
                return;
            }

            setGalleryLoading(true);
            try {
                const galleryRef = collection(db, 'properties', selectedProperty.id, 'gallery');

                // Determine start index for new photos (append to end)
                // We find the max index currently in the gallery subcollection to ensure valid ordering
                const currentMaxIndex = galleryImages.length > 0 ? Math.max(...galleryImages.map(img => img.index || 0)) : -1;

                const uploadPromises = files.map(async (file, i) => {
                    const base64 = await resizeImage(file);
                    return addDoc(galleryRef, {
                        imageBase64: base64,
                        index: currentMaxIndex + 1 + i,
                        name: file.name
                    });
                });
                await Promise.all(uploadPromises);
            } catch (error) {
                console.error("Erro ao adicionar fotos:", error);
                alert("Erro ao adicionar fotos: " + error.message);
            } finally {
                setGalleryLoading(false);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (expandedIndex !== null) {
                if (e.key === 'ArrowRight') handleNext(e);
                if (e.key === 'ArrowLeft') handlePrev(e);
                if (e.key === 'Escape') setExpandedIndex(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedIndex, allImages]);


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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input type="text" name="title" placeholder="Título" value={formData.title} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                        <input type="text" name="code" placeholder="Código (Gerado Auto)" value={formData.code} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: '#f9f9f9' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="text" name="price" placeholder="Preço" value={formData.price} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', flex: 1 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <input type="checkbox" name="hidePrice" id="hidePrice" checked={formData.hidePrice} onChange={handleChange} style={{ cursor: 'pointer', accentColor: '#4d7df2' }} />
                                <label htmlFor="hidePrice" style={{ cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Ocultar</label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" name="label" placeholder="Etiqueta" value={formData.label} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['#4d7df2', '#00C853', '#FFD600', '#FF3D00', '#AA00FF'].map(c => (
                                    <div key={c} onClick={() => setFormData({ ...formData, labelColor: c })}
                                        style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: '2px solid white', boxShadow: formData.labelColor === c ? `0 0 0 2px ${c}` : 'none' }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <input id="fileInput" type="file" accept="image/*" multiple onChange={handleFileChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                        {imageFiles.length > 0 && <span style={{ fontSize: '0.8rem', color: 'green' }}>{imageFiles.length} fotos.</span>}
                    </div>
                    <textarea name="description" placeholder="Descrição" value={formData.description} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', height: '100px' }}></textarea>
                    <button type="submit" disabled={loading} className="button" style={{ cursor: loading ? 'wait' : 'pointer', maxWidth: '200px' }}>{loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}</button>
                </form>
            </div >

            {/* List */}
            < div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {
                    properties.map(property => (
                        <div key={property.id} style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setSelectedProperty(property)}>
                                {property.imageUrl ? (
                                    <img src={property.imageUrl} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '150px', backgroundColor: '#eee', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem Imagem</div>
                                )}
                                {property.label && <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: property.labelColor, color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>{property.label}</span>}

                                {/* Display Code if exists */}
                                {property.code && <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>{property.code}</span>}

                            </div>
                            <h4 style={{ color: 'var(--title-color)' }}>{property.title}</h4>
                            <span style={{ color: 'var(--first-color)', fontWeight: '600' }}>
                                {property.hidePrice ? <span style={{ color: '#888' }}>(Oculto)</span> : `R$ ${property.price}`}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignSelf: 'flex-end' }}>
                                <button onClick={() => handleEdit(property)} style={{ color: 'var(--first-color)', border: 'none', background: 'none', cursor: 'pointer' }}><i className='bx bx-edit' style={{ fontSize: '1.25rem' }}></i></button>
                                <button onClick={() => handleDelete(property.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><i className='bx bx-trash' style={{ fontSize: '1.25rem' }}></i></button>
                            </div>
                        </div>
                    ))
                }
            </div >

            {/* Gallery Modal */}
            {
                selectedProperty && (
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h3>{selectedProperty.title} - Galeria</h3>
                                    <label style={{ cursor: 'pointer', background: 'var(--first-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <i className='bx bx-plus'></i> Fotos
                                        <input type="file" multiple accept="image/*" onChange={handleAddGalleryPhotos} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <button onClick={() => setSelectedProperty(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            {galleryLoading ? <p>Carregando...</p> : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                                    {displayImages.map((img, idx) => (
                                        <div
                                            key={img.id || idx}
                                            style={{
                                                position: 'relative', overflow: 'hidden', borderRadius: '0.5rem',
                                                opacity: draggedItemIndex === idx ? 0.5 : 1,
                                                cursor: 'grab',
                                                border: idx === 0 ? '3px solid var(--first-color)' : (draggedItemIndex === idx ? '2px dashed #4d7df2' : 'none'),
                                                boxSizing: 'border-box'
                                            }}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, idx)}
                                        >
                                            <img src={img.imageBase64} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />

                                            {/* Badges */}
                                            {idx === 0 && (
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'var(--first-color)', color: 'white', fontSize: '0.75rem', textAlign: 'center', padding: '2px 0' }}>
                                                    Capa Principal
                                                </div>
                                            )}

                                            <div onClick={() => setExpandedIndex(idx)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'zoom-in' }}></div>

                                            <div style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 10 }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(img, idx); }}
                                                    style={{ cursor: 'pointer', background: 'rgba(255, 0, 0, 0.8)', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    title="Excluir"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!galleryLoading && displayImages.length === 0 && <p>Nenhuma foto.</p>}
                        </div>
                    </div>
                )
            }

            {/* Expanded Overlay */}
            {
                expandedIndex !== null && allImages[expandedIndex] && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setExpandedIndex(null)}>
                        {expandedIndex > 0 && <button onClick={handlePrev} style={{ position: 'absolute', left: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '2rem', cursor: 'pointer', zIndex: 10001 }}>&#8249;</button>}
                        <img src={allImages[expandedIndex]} style={{ width: '90vw', height: '85vh', objectFit: 'contain', borderRadius: '4px' }} onClick={e => e.stopPropagation()} />
                        {expandedIndex < allImages.length - 1 && <button onClick={handleNext} style={{ position: 'absolute', right: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '2rem', cursor: 'pointer', zIndex: 10001 }}>&#8250;</button>}
                        <button onClick={() => setExpandedIndex(null)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', zIndex: 10002 }}>&times;</button>
                    </div>
                )
            }
        </div >
    );
};

export default Properties;
