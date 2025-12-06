import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const Settings = () => {
    // Brand
    const [brandName, setBrandName] = useState('');

    // Hero Section
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDescription, setHeroDescription] = useState('');
    const [heroImage, setHeroImage] = useState(null); // Base64 string
    const [heroImageFile, setHeroImageFile] = useState(null); // File object for input display

    // Stats
    const [stats, setStats] = useState([
        { number: '330mil+', label1: 'Produto', label2: 'Premium' },
        { number: '150mil+', label1: 'Para', label2: 'Solteiros' },
        { number: '300mil+', label1: 'Ideal para', label2: 'Casais' }
    ]);

    // Popular Section
    const [popularSubTitle, setPopularSubTitle] = useState('');
    const [popularTitle, setPopularTitle] = useState('');

    // Partner Logos
    const [partnerLogos, setPartnerLogos] = useState([]);
    const [logoSectionSize, setLogoSectionSize] = useState('medium');

    // Contact Section
    const [contactTitle, setContactTitle] = useState('');
    const [contactDescription, setContactDescription] = useState('');
    const [contactImage, setContactImage] = useState(null);
    const [contactPhone, setContactPhone] = useState('');
    const [contactWhatsapp, setContactWhatsapp] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    // Footer
    const [footerDescription, setFooterDescription] = useState('');
    const [socialFacebook, setSocialFacebook] = useState('');
    const [socialInstagram, setSocialInstagram] = useState('');
    const [socialTiktok, setSocialTiktok] = useState('');

    // About Section
    const [aboutTitle, setAboutTitle] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [aboutImage, setAboutImage] = useState(null);


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const docRef = doc(db, 'settings', 'general');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBrandName(data.brandName || '');
                setHeroTitle(data.heroTitle || 'Descubra <br /> as melhores <br /> residências');
                setHeroDescription(data.heroDescription || 'Encontre residências que combinam com você com muita facilidade. Esqueça todas as dificuldades em encontrar uma lar ideal para você.');
                setHeroImage(data.heroImage || null);
                if (data.stats) setStats(data.stats);

                setPopularSubTitle(data.popularSubTitle || 'Melhor Escolha');
                setPopularTitle(data.popularTitle || 'Casas populares');

                if (data.partnerLogos) setPartnerLogos(data.partnerLogos);
                setLogoSectionSize(data.logoSectionSize || 'medium');

                setContactTitle(data.contactTitle || 'Entre em contato<span>.</span>');
                setContactDescription(data.contactDescription || 'É um problema encontrar a casa dos sonhos? Precisa de ajuda para comprar sua primeira casa? Ou precisa de uma consultoria para investir em imóveis? Entre em contato conosco.');
                setContactImage(data.contactImage || null);
                setContactPhone(data.contactPhone || '61-35852021');
                setContactWhatsapp(data.contactWhatsapp || '61-35852021');
                setContactEmail(data.contactEmail || 'corretor@imobiliaria.com');

                setFooterDescription(data.footerDescription || 'Minha missão é fazer as pessoas encontrarem o melhor lugar para viver.');
                setSocialFacebook(data.socialFacebook || 'https://www.facebook.com/');
                setSocialInstagram(data.socialInstagram || 'https://www.instagram.com/jonathansantos.costa/');
                setSocialTiktok(data.socialTiktok || 'https://www.tiktok.com/');

                setAboutTitle(data.aboutTitle || 'Sua História de Sucesso');
                setAboutText(data.aboutText || 'Conte um pouco sobre sua trajetória, experiência e como você ajuda seus clientes a realizarem seus sonhos.');
                setAboutImage(data.aboutImage || null);
            } else {
                setBrandName('Alberto Almeida');
                setLogoSectionSize('medium');
                // Defaults exist in state initialization
            }
        };
        fetchSettings();
    }, []);

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

    const handleHeroFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 750000) {
                alert("A imagem é muito grande (Máx 750KB).");
                return;
            }
            try {
                const base64 = await resizeImage(file);
                setHeroImage(base64);
                setHeroImageFile(file);
            } catch (err) {
                console.error("Erro ao processar imagem", err);
                alert("Erro ao processar imagem");
            }
        }
    };

    const handleContactFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 750000) {
                alert("A imagem é muito grande (Máx 750KB).");
                return;
            }
            try {
                const base64 = await resizeImage(file);
                setContactImage(base64);
            } catch (err) {
                console.error("Erro ao processar imagem", err);
                alert("Erro ao processar imagem");
            }
        }
    }


    const handleAboutFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 750000) {
                alert("A imagem é muito grande (Máx 750KB).");
                return;
            }
            try {
                const base64 = await resizeImage(file);
                setAboutImage(base64);
            } catch (err) {
                console.error("Erro ao processar imagem", err);
                alert("Erro ao processar imagem");
            }
        }
    };

    const handleLogoUpload = async (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newLogos = [];

            for (const file of files) {
                if (file.size > 750000) {
                    alert(`A imagem ${file.name} é muito grande (Máx 750KB). Ignorando.`);
                    continue;
                }
                try {
                    const base64 = await resizeImage(file);
                    newLogos.push(base64);
                } catch (err) {
                    console.error("Erro ao processar logo", err);
                }
            }

            setPartnerLogos([...partnerLogos, ...newLogos]);
        }
    };

    const removeLogo = (index) => {
        const newLogos = partnerLogos.filter((_, i) => i !== index);
        setPartnerLogos(newLogos);
    }

    const handleStatChange = (index, field, value) => {
        const newStats = [...stats];
        newStats[index][field] = value;
        setStats(newStats);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const docRef = doc(db, 'settings', 'general');
            await setDoc(docRef, {
                brandName,
                heroTitle,
                heroDescription,
                heroImage,
                stats,
                popularSubTitle,
                popularTitle,
                partnerLogos,
                logoSectionSize,
                contactTitle,
                contactDescription,
                contactImage,
                contactPhone,
                contactWhatsapp,
                contactEmail, // Fixed duplicate contactWhatsapp key in previous version
                footerDescription,
                socialFacebook,
                socialInstagram,
                socialTiktok, // Fixed duplicate keys in previous version
                aboutTitle,
                aboutText,
                aboutImage
            }, { merge: true });

            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert('Erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>Configurações</h1>

            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 4px 16px hsla(228, 66%, 45%, .1)', maxWidth: '600px' }}>
                <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Marca */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Geral</h3>
                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Nome da Imobiliária</label>
                        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} required style={inputStyle} />
                    </div>

                    {/* Hero Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Seção Principal (Hero)</h3>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Título Principal</label>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Use &lt;br /&gt; para quebrar linha.</span>
                        <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} required style={inputStyle} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Descrição</label>
                        <textarea value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} required style={{ ...inputStyle, height: '100px' }} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Imagem de Destaque</label>
                        <input type="file" accept="image/*" onChange={handleHeroFileChange} style={inputStyle} />
                        {heroImage && (
                            <img src={heroImage} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
                        )}
                    </div>



                    {/* Popular Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Seção de Imóveis (Popular)</h3>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Subtítulo (Laranja)</label>
                        <input type="text" value={popularSubTitle} onChange={(e) => setPopularSubTitle(e.target.value)} required style={inputStyle} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Título Principal</label>
                        <input type="text" value={popularTitle} onChange={(e) => setPopularTitle(e.target.value)} required style={inputStyle} />
                    </div>

                    {/* Partner Logos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Logos de Parceiros</h3>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Tamanho da Seção</label>
                        <select value={logoSectionSize} onChange={(e) => setLogoSectionSize(e.target.value)} style={inputStyle}>
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio</option>
                            <option value="large">Grande</option>
                        </select>

                        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#e67e22', backgroundColor: '#fff3cd', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ffeeba' }}>
                            <strong>Recomendação:</strong> Para uma melhor apresentação na página, utilize imagens de banner/logo com dimensões próximas a <strong>500x500 pixels</strong>.
                        </div>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Adicionar Logos</label>
                        <input type="file" accept="image/*" multiple onChange={handleLogoUpload} style={inputStyle} />

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem' }}>
                            {partnerLogos.length === 0 && <span style={{ color: '#888', fontSize: '0.9rem' }}>Nenhum logo adicionado.</span>}
                            {partnerLogos.map((logo, index) => (
                                <div key={index} style={{ position: 'relative', width: '80px', height: '50px', backgroundColor: 'white', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                    <img src={logo} alt={`Logo ${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    <button
                                        type="button"
                                        onClick={() => removeLogo(index)}
                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Estatísticas</h3>
                        {stats.map((stat, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>Número</label>
                                    <input type="text" value={stat.number} onChange={(e) => handleStatChange(index, 'number', e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>Texto 1</label>
                                    <input type="text" value={stat.label1} onChange={(e) => handleStatChange(index, 'label1', e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>Texto 2</label>
                                    <input type="text" value={stat.label2} onChange={(e) => handleStatChange(index, 'label2', e.target.value)} style={inputStyle} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* About Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Quem Sou (Sobre Mim)</h3>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Título</label>
                        <input type="text" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} style={inputStyle} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>História / Bio</label>
                        <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} style={{ ...inputStyle, height: '150px' }} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Foto de Perfil</label>
                        <input type="file" accept="image/*" onChange={handleAboutFileChange} style={inputStyle} />
                        {aboutImage && (
                            <img src={aboutImage} alt="About Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
                        )}
                    </div>

                    {/* Contact Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Seção de Contato</h3>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Título</label>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Use &lt;span&gt;.&lt;/span&gt; para o ponto colorido.</span>
                        <input type="text" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} required style={inputStyle} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Descrição</label>
                        <textarea value={contactDescription} onChange={(e) => setContactDescription(e.target.value)} required style={{ ...inputStyle, height: '100px' }} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Imagem do Corretor/Contato</label>
                        <input type="file" accept="image/*" onChange={handleContactFileChange} style={inputStyle} />
                        {contactImage && (
                            <img src={contactImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginTop: '0.5rem' }} />
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div>
                                <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Telefone (Display)</label>
                                <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>WhatsApp (Link)</label>
                                <input type="text" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>E-mail</label>
                            <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ color: 'var(--title-color)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Rodapé</h3>

                        <label style={{ fontWeight: '500', color: 'var(--title-color)' }}>Descrição (Missão)</label>
                        <textarea value={footerDescription} onChange={(e) => setFooterDescription(e.target.value)} style={{ ...inputStyle, height: '80px' }} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Facebook (Link)</label>
                        <input type="text" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} style={inputStyle} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>Instagram (Link)</label>
                        <input type="text" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} style={inputStyle} />

                        <label style={{ fontWeight: '500', color: 'var(--title-color)', marginTop: '0.5rem' }}>TikTok (Link)</label>
                        <input type="text" value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} style={inputStyle} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="button"
                        style={{ cursor: loading ? 'wait' : 'pointer', marginTop: '1rem' }}
                    >
                        {loading ? 'Salvando...' : 'Salvar Tudo'}
                    </button>
                </form>
            </div >
        </div >
    );
};

const inputStyle = {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit'
};

export default Settings;
