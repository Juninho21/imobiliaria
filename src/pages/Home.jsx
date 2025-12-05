import React, { useEffect, useState, useRef } from 'react';
import ScrollReveal from 'scrollreveal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const AccordionItem = ({ item, isOpen, onClick }) => {
    const contentRef = useRef(null);

    return (
        <div className={`value__accordion-item ${isOpen ? 'accordion-open' : ''}`}>
            <header className="value__accordion-header" onClick={onClick}>
                <i className={`bx ${item.icon} value__accordion-icon`}></i>
                <h3 className="value__accordion-title">
                    {item.title}
                </h3>
                <div className="value__accordion-arrow">
                    <i className='bx bxs-down-arrow'></i>
                </div>
            </header>

            <div
                className="value__accordion-content"
                ref={contentRef}
                style={{ height: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
            >
                <p className="value__accordion-description">
                    {item.desc}
                </p>
            </div>
        </div>
    );
};

const Home = () => {
    useEffect(() => {
        const sr = ScrollReveal({
            origin: 'top',
            distance: '60px',
            duration: 2500,
            delay: 400,
            // reset: true
        });

        sr.reveal(`.home__title, .popular__container, .appointment-container, .footer__container`);
        sr.reveal(`.home__description, .footer__info`, { delay: 500 });
        sr.reveal(`.home__search`, { delay: 600 });
        sr.reveal(`.home__value`, { delay: 700 });
        sr.reveal(`.home__images`, { delay: 800, origin: 'bottom' });
        sr.reveal(`.logos__img`, { interval: 100 });
        sr.reveal(`.value__images, .contact__content`, { origin: 'left' });
        sr.reveal(`.value__content, .contact__images`, { origin: 'right' });
    }, []);

    const [activeAccordion, setActiveAccordion] = useState(null);

    const toggleAccordion = (index) => {
        if (activeAccordion === index) {
            setActiveAccordion(null);
        } else {
            setActiveAccordion(index);
        }
    };

    return (
        <main className="main">
            {/* HOME */}
            <section className="home section" id="home">
                <div className="home__container container grid">
                    <div className="home__data">
                        <h1 className="home__title">
                            Descubra <br /> as melhores <br /> residências
                        </h1>
                        <p className="home__description">
                            Encontre residências que combinam com você com muita facilidade. Esqueça todas as dificuldades em encontrar uma lar ideal para você.
                        </p>

                        <div className="home__value">
                            <div>
                                <h1 className="home__value-number">
                                    330mil<span>+</span>
                                </h1>
                                <span className="home__value-description">
                                    Produto <br /> Premium
                                </span>
                            </div>

                            <div>
                                <h1 className="home__value-number">
                                    150mil<span>+</span>
                                </h1>
                                <span className="home__value-description">
                                    Para<br /> Solteiros
                                </span>
                            </div>

                            <div>
                                <h1 className="home__value-number">
                                    300mil<span>+</span>
                                </h1>
                                <span className="home__value-description">
                                    Ideal para<br /> Casais
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="home__images">
                        <div className="home__orbe"></div>

                        <div className="home__img">
                            <img src="/assets/images/home.jpg" alt="" />
                        </div>
                    </div>
                </div>
            </section>

            {/* LOGOS */}
            <section className="logos section" id="logos">
                <div className="logos__container container grid">
                    {[1, 2, 3, 4].map(num => (
                        <div className="logos__img" key={num}>
                            <img src={`/assets/images/logo${num}.png`} alt="Construtora Parceira" />
                        </div>
                    ))}
                </div>
            </section>

            {/* POPULAR - Swiper */}
            <section className="popular section" id="popular">
                <div className="container">
                    <span className="section__subtitle">Melhor Escolha</span>
                    <h2 className="section__title">
                        Casas populares<span>.</span>
                    </h2>

                    <Swiper
                        spaceBetween={32}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        loop={true}
                        pagination={{ dynamicBullets: true, clickable: true }}
                        modules={[Pagination]}
                        breakpoints={{
                            600: { slidesPerView: 2, centeredSlides: false },
                            1024: { slidesPerView: 3, centeredSlides: false },
                        }}
                        className="popular__container"
                    >
                        <SwiperSlide className="popular__card">
                            <img src="/assets/images/popular1.jpg" alt="" className="popular__img" />
                            <div className="popular__data">
                                <h2 className="popular__price">
                                    <span>R$</span>250.000
                                </h2>
                                <h3 className="popular__title">
                                    Apartamento 3 Qts
                                </h3>
                                <p className="popular__description">
                                    Aguas Claras - Quadra 205,
                                    Torre 2, Apto 305
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="popular__card">
                            <img src="/assets/images/popular2.jpg" alt="" className="popular__img" />
                            <div className="popular__data">
                                <h2 className="popular__price">
                                    <span>R$</span>320.000
                                </h2>
                                <h3 className="popular__title">
                                    Casa 5 Suites
                                </h3>
                                <p className="popular__description">
                                    Aguas Claras - Quadra 105,
                                    Torre52, Apto 1003
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="popular__card">
                            <img src="/assets/images/popular3.jpg" alt="" className="popular__img" />
                            <div className="popular__data">
                                <h2 className="popular__price">
                                    <span>R$</span>1.250.000
                                </h2>
                                <h3 className="popular__title">
                                    Casa 2 Quartos
                                </h3>
                                <p className="popular__description">
                                    Guará,
                                    Quadra 3
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="popular__card">
                            <img src="/assets/images/popular4.jpg" alt="" className="popular__img" />
                            <div className="popular__data">
                                <h2 className="popular__price">
                                    <span>R$</span>150.000
                                </h2>
                                <h3 className="popular__title">
                                    Casa 3 Quartos
                                </h3>
                                <p className="popular__description">
                                    Vicente Pires, Rua 1
                                    Ch 5, Cond. Por do Sol
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="popular__card">
                            <img src="/assets/images/popular5.jpg" alt="" className="popular__img" />
                            <div className="popular__data">
                                <h2 className="popular__price">
                                    <span>R$</span>750.000
                                </h2>
                                <h3 className="popular__title">
                                    Lote 1000m²
                                </h3>
                                <p className="popular__description">
                                    ParWay, Qd 65
                                    Cond. Solar
                                </p>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>

            {/* VALUE - Accordion */}
            <section className="value section" id="value">
                <div className="value__container container grid">
                    <div className="value__images">
                        <div className="value__orbe"></div>
                        <div className="value__img">
                            <img src="/assets/images/value.jpg" alt="" />
                        </div>
                    </div>

                    <div className="value__content">
                        <div className="value_data">
                            <span className="section__subtitle">Nossos Valores</span>
                            <h2 className="section__title">
                                Damos valor a você<span>.</span>
                            </h2>
                            <p className="value__description">
                                Estamos sempre prontos em ajudar a encontrar o melhor lugar para sua vida.
                            </p>

                            <div className="value__accordion">
                                {[
                                    { icon: 'bxs-star', title: 'Os melhores imóveis para você.', desc: 'Imóveis de qualidade em regiões privilegiadas.' },
                                    { icon: 'bxs-bar-chart-square', title: 'Os melhores preços do mercado.', desc: 'Buscamos sempre as melhores ofertas do mercado, para que você possa encontrar seu lar com as melhores condições.' },
                                    { icon: 'bxs-check-square', title: 'Seus dados seguros', desc: 'Garantimos sua privacidade mantendo seus dados seguros sem qualquer compartilhamento.' }
                                ].map((item, index) => (
                                    <AccordionItem
                                        key={index}
                                        item={item}
                                        isOpen={activeAccordion === index}
                                        onClick={() => toggleAccordion(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section className="contact section" id="contact">
                <div className="contact__container container grid">
                    <div className="contact__images">
                        <div className="contact__orbe"></div>

                        <div className="contact__img">
                            <img src="/assets/images/contact.png" alt="Contato" />
                        </div>
                    </div>

                    <div className="contact__content">
                        <div className="contact__data">
                            <span className="section__subtitle">Contato</span>
                            <h2 className="section__title">
                                Entre em contato<span>.</span>
                            </h2>
                            <p className="contact__description">
                                É um problema encontrar a casa dos sonhos? Precisa de ajuda para comprar sua primeira casa? Ou precisa de uma consultoria para investir em imóveis? Entre em contato conosco.
                            </p>
                        </div>


                        <div className="contact__card">
                            <div className="contact_card-box">
                                <div className="contact__card-info">
                                    <i className='bx bxs-phone-call'></i>
                                    <div>
                                        <h3 className="contact__card-title">Telefone</h3>
                                        <p className="contact__card-description">61-35852021</p>
                                    </div>
                                </div>
                                <a href="tel:+5561999999999">
                                    <button className="contact__card-button">Ligue Agora</button>
                                </a>
                            </div>

                            <div className="contact_card-box">
                                <div className="contact__card-info">
                                    <i className='bx bxl-whatsapp'></i>
                                    <div>
                                        <h3 className="contact__card-title">Chat</h3>
                                        <p className="contact__card-description">61-35852021</p>
                                    </div>
                                </div>
                                <a href="https://wa.me/5561999999999" target="_blank">
                                    <button className="contact__card-button">WhatsApp</button>
                                </a>
                            </div>

                            <div className="contact_card-box">
                                <div className="contact__card-info">
                                    <i className='bx bxs-envelope'></i>
                                    <div>
                                        <h3 className="contact__card-title">E-mail</h3>
                                        <p className="contact__card-description">corretor@imobiliaria.com</p>
                                    </div>
                                </div>
                                <a href="mailto:jonathancosta746@gmail.com">
                                    <button className="contact__card-button">Mensagem</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* APPOINTMENT */}
            <section className="appointment section">
                <div className="appointment-container container">
                    <div className="info">
                        <h2>Envie uma mensagem<span>.</span></h2>
                        <p>Mande uma mensagem que entraremos em contato o mais breve possivel.</p>
                    </div>

                    <form action="https://formspree.io/f/xvolerzj" method="POST" className="form__appointment">
                        <div className="form__group">
                            <label htmlFor="name">Nome</label>
                            <input type="text" placeholder="Digite seu nome" name="Nome do Cliente" id="name" required />
                        </div>

                        <div className="form__group">
                            <label htmlFor="phone">Telefone</label>
                            <input type="number" placeholder="Digite seu telefone" name="Numero de Telefone" id="number" required />
                        </div>

                        <div className="form__group">
                            <label htmlFor="return">Selecione a forma de retorno</label>
                            <select name="return" required defaultValue="">
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
                            <textarea name="Mensagem" id="message" rows="6" placeholder="Adicione uma mensagem"></textarea>
                        </div>
                        <input type="submit" value="Enviar Mensagem" className="btn-primary" />
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Home;
