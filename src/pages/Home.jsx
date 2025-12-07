import React, { useEffect, useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';



import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import RevealOnScroll from '../components/RevealOnScroll';




const Home = () => {
    const { settings, loading } = useSettings();
    const [properties, setProperties] = useState([]);



    // Gallery State
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        returnPreference: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Optimistic UI update
        setIsSubmitted(true);
        const submissionData = { ...formData };
        setFormData({ name: '', phone: '', returnPreference: '', message: '' });

        setTimeout(() => {
            setIsSubmitted(false);
        }, 3000);

        try {
            await addDoc(collection(db, 'messages'), {
                ...submissionData,
                read: false,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao enviar mensagem: ", error);
            // Optionally revert state here if needed, but for "speed" feel we often silence non-critical failures
            // or show a toast. For now, just logging.
        }
    };
    const [galleryLoading, setGalleryLoading] = useState(false);

    // Zoom/Expanded View State
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [allImages, setAllImages] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'properties'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    // Update allImages list
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
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedIndex, allImages, selectedProperty]);


    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando...</div>;
    }

    return (
        <main className="main">
            {/* HOME */}
            <section className="home section" id="home">
                <div className="home__container container grid">
                    <RevealOnScroll className="home__data">
                        <h1 className="home__title" dangerouslySetInnerHTML={{ __html: settings?.heroTitle || 'Descubra <br /> as melhores <br /> residências' }}>
                        </h1>
                        <p className="home__description">
                            {settings?.heroDescription || 'Encontre residências que combinam com você com muita facilidade. Esqueça todas as dificuldades em encontrar uma lar ideal para você.'}
                        </p>
                        <a href="#appointment" className="button" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            Enviar mensagem <i className='bx bx-send'></i>
                        </a>

                        <div className="home__value">
                            {(settings?.stats || [
                                { number: '330mil+', label1: 'Produto', label2: 'Premium' },
                                { number: '150mil+', label1: 'Para', label2: 'Solteiros' },
                                { number: '300mil+', label1: 'Ideal para', label2: 'Casais' }
                            ]).map((stat, index) => (
                                <div key={index}>
                                    <h1 className="home__value-number">
                                        {stat.number.replace('+', '')}<span>+</span>
                                    </h1>
                                    <span className="home__value-description">
                                        {stat.label1} <br /> {stat.label2}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll className="home__images" direction="up" delay={800}>
                        <div className="home__orbe"></div>

                        <div className="home__img">
                            <img src={settings?.heroImage || "/assets/images/home.jpg"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '246px 246px 16px 16px' }} />
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* POPULAR - Swiper */}
            <section className="popular section" id="popular">
                <div className="container">
                    <RevealOnScroll>
                        <span className="section__subtitle">{settings?.popularSubTitle || 'Melhor Escolha'}</span>
                        <h2 className="section__title" dangerouslySetInnerHTML={{ __html: settings?.popularTitle || 'Casas populares<span>.</span>' }}></h2>
                    </RevealOnScroll>

                    <div className="popular__container">
                        {properties.length === 0 ? (
                            <div style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>
                                <p>Carregando imóveis...</p>
                            </div>
                        ) : (
                            properties.map((property, index) => (
                                <RevealOnScroll key={property.id} className="popular__card" delay={index * 100}>
                                    <div
                                        style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '1rem' }}
                                        onClick={() => setSelectedProperty(property)}
                                    >
                                        <img
                                            src={property.imageUrl || "/assets/images/popular1.jpg"}
                                            alt={property.title}
                                            className="popular__img"
                                            style={{ height: '250px', objectFit: 'cover', width: '100%' }}
                                        />
                                        {property.photoCount > 1 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                right: '10px',
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                zIndex: 10
                                            }}>
                                                <i className='bx bxs-camera'></i> {property.photoCount}
                                            </div>
                                        )}
                                        {property.label && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                backgroundColor: property.labelColor || 'var(--first-color)',
                                                color: '#fff',
                                                fontSize: '0.75rem',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                zIndex: 10,
                                                fontWeight: '600',
                                                textTransform: 'uppercase'
                                            }}>
                                                {property.label}
                                            </span>
                                        )}
                                    </div>

                                    <div className="popular__data">
                                        <h2 className="popular__price">
                                            <span>R$</span>{property.price}
                                        </h2>
                                        <h3 className="popular__title">
                                            {property.title}
                                        </h3>
                                        <p className="popular__description">
                                            {property.description}
                                        </p>
                                    </div>
                                </RevealOnScroll>
                            ))
                        )}
                    </div>
                </div>
            </section>



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
                                <h3 style={{ color: 'var(--title-color)' }}>{selectedProperty.title}</h3>
                                <button onClick={() => setSelectedProperty(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--title-color)' }}>&times;</button>
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
                                            onClick={() => setExpandedIndex(0)}
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
                                <p>Nenhuma foto disponível.</p>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Expanded Image Modal Overlay with Navigation */}
            {
                expandedIndex !== null && allImages[expandedIndex] && (
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
                            style={{ width: '90vw', height: '85vh', objectFit: 'contain', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpandedIndex((expandedIndex + 1) % allImages.length);
                            }}
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
                )
            }




            {/* ABOUT US (QUEM SOU) */}
            <section className="about section" id="about">
                <div className="about__container container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center', gap: '3rem' }}>
                    <RevealOnScroll className="about__images" style={{ display: 'flex', justifyContent: 'center' }} direction="left">
                        <div className="about__img" style={{
                            width: '300px', height: '400px', overflow: 'hidden',
                            borderRadius: '160px 160px 16px 16px', border: '8px solid white',
                            boxShadow: '0 4px 16px hsla(228, 66%, 25%, .1)'
                        }}>
                            <img
                                src={settings?.aboutImage || "/assets/images/home.jpg"}
                                alt="Quem Sou"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll className="about__data" direction="right">
                        <span className="section__subtitle">Quem Sou</span>
                        <h2 className="section__title" style={{ marginBottom: '1.5rem' }}>
                            {settings?.aboutTitle || 'Sua História de Sucesso'}
                        </h2>
                        <p className="about__description" style={{ color: 'var(--text-color)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            {settings?.aboutText || 'Conte um pouco sobre sua trajetória, experiência e como você ajuda seus clientes a realizarem seus sonhos.'}
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* CONTACT */}
            <section className="contact section" id="contact">
                <div className="contact__container container grid">
                    <RevealOnScroll className="contact__images" direction="left">
                        <div className="contact__orbe"></div>

                        <div className="contact__img">
                            <img src={settings?.contactImage || "/assets/images/contact.png"} alt="Contato" style={{ borderRadius: '1rem', width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll className="contact__content" direction="right">
                        <div className="contact__data">
                            <span className="section__subtitle">Contato</span>
                            <h2 className="section__title" dangerouslySetInnerHTML={{ __html: settings?.contactTitle || 'Entre em contato<span>.</span>' }}>
                            </h2>
                            <p className="contact__description">
                                {settings?.contactDescription || 'É um problema encontrar a casa dos sonhos? Precisa de ajuda para comprar sua primeira casa? Ou precisa de uma consultoria para investir em imóveis? Entre em contato conosco.'}
                            </p>
                        </div>


                        <div className="contact__card">
                            <div className="contact_card-box">
                                <div className="contact__card-info">
                                    <i className='bx bxs-phone-call'></i>
                                    <div>
                                        <h3 className="contact__card-title">Telefone</h3>
                                        <p className="contact__card-description">{settings?.contactPhone || '61-35852021'}</p>
                                    </div>
                                </div>
                                <a href={`tel:+55${(settings?.contactPhone || '61999999999').replace(/[^0-9]/g, '')}`}>
                                    <button className="contact__card-button">Ligue Agora</button>
                                </a>
                            </div>

                            <div className="contact_card-box">
                                <div className="contact__card-info">
                                    <i className='bx bxl-whatsapp'></i>
                                    <div>
                                        <h3 className="contact__card-title">Chat</h3>
                                        <p className="contact__card-description">{settings?.contactWhatsapp || '61-35852021'}</p>
                                    </div>
                                </div>
                                <a href={`https://wa.me/55${(settings?.contactWhatsapp || '61999999999').replace(/[^0-9]/g, '')}`} target="_blank">
                                    <button className="contact__card-button">WhatsApp</button>
                                </a>
                            </div>

                            <div className="contact_card-box">
                                <div className="contact__card-info">
                                    <i className='bx bxs-envelope'></i>
                                    <div>
                                        <h3 className="contact__card-title">E-mail</h3>
                                        <p className="contact__card-description" style={{ fontSize: '0.75rem' }}>{settings?.contactEmail || 'corretor@imobiliaria.com'}</p>
                                    </div>
                                </div>
                                <a href={`mailto:${settings?.contactEmail || 'jonathancosta746@gmail.com'}`}>
                                    <button className="contact__card-button">Mensagem</button>
                                </a>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* APPOINTMENT */}
            <section className="appointment section" id="appointment">
                <RevealOnScroll className="appointment-container container">
                    <div className="info">
                        <h2>Envie uma mensagem<span>.</span></h2>
                        <p>Mande uma mensagem que entraremos em contato o mais breve possivel.</p>
                    </div>

                    {isSubmitted ? (
                        <div className="contact__success-message" style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 16px hsla(228, 66%, 25%, .1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <i className='bx bxs-check-circle' style={{ fontSize: '4rem', color: 'var(--first-color)' }}></i>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--title-color)' }}>Mensagem enviada com sucesso!</h3>
                            <p style={{ color: 'var(--text-color)' }}>Entraremos em contato em breve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="form__appointment">
                            <div className="form__group">
                                <label htmlFor="name">Nome</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form__group">
                                <label htmlFor="phone">Telefone</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu telefone"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form__group">
                                <label htmlFor="returnPreference">Selecione a forma de retorno</label>
                                <select
                                    name="returnPreference"
                                    id="returnPreference"
                                    value={formData.returnPreference}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Selecione...</option>
                                    <option value="ligação-durante-manha">Ligação durante o período da manhã</option>
                                    <option value="ligação-durante-tarde">Ligação durante o período da tarde</option>
                                    <option value="ligação-durante-noite">Ligação durante o período da noite</option>
                                    <option value="whatsApp">WhatsApp</option>
                                    <option value="email">E-mail</option>
                                </select>
                            </div>


                            <div className="form__group">
                                <label htmlFor="message">Mensagem</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows="6"
                                    placeholder="Adicione uma mensagem"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <input type="submit" value="Enviar Mensagem" className="btn-primary" />
                        </form>
                    )}
                </RevealOnScroll>
            </section>


            {/* LOGOS */}
            <section className="logos section" id="logos">
                <RevealOnScroll className="logos__container container" delay={400}>
                    <Swiper
                        modules={[Autoplay]}
                        spaceBetween={50}
                        slidesPerView={2}
                        loop={true}
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                        }}
                        breakpoints={{
                            576: {
                                slidesPerView: 3,
                            },
                            768: {
                                slidesPerView: 4,
                            },
                            1024: {
                                slidesPerView: 5,
                            },
                        }}
                        className="mySwiper"
                    >
                        {(() => {
                            // Default to medium (200px)
                            let logoHeight = '200px';

                            if (settings?.logoSectionSize === 'small') logoHeight = '100px';
                            if (settings?.logoSectionSize === 'medium') logoHeight = '200px';
                            if (settings?.logoSectionSize === 'large') logoHeight = '300px';

                            const renderLogos = (items) => items.map((logo, index) => (
                                <SwiperSlide key={index} className="logos__img">
                                    <img src={logo} alt={`Parceiro ${index + 1}`} style={{ height: logoHeight, objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                                </SwiperSlide>
                            ));

                            if (settings?.partnerLogos && settings.partnerLogos.length > 0) {
                                return renderLogos(settings.partnerLogos);
                            } else {
                                const placeholderLogos = [1, 2, 3, 4, 1, 2, 3, 4].map(num => `/assets/images/logo${num}.png`);
                                return renderLogos(placeholderLogos);
                            }
                        })()}
                    </Swiper>
                </RevealOnScroll>
            </section>
        </main >

    );
};

export default Home;
