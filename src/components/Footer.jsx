import React from 'react';
import { Link } from 'react-router-dom';

import { useSettings } from '../contexts/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();
    return (
        <footer className="footer section">
            <div className="footer__container container grid">
                <div>
                    <a href="#" className="footer__logo">
                        {settings?.brandName}<i className='bx bxs-home-alt-2'></i>
                    </a>
                    <p className="footer__description">
                        {settings?.footerDescription || 'Minha missão é fazer as pessoas encontrarem o melhor lugar para viver.'}
                    </p>
                </div>

                <div className="footer__content">
                    <h3 className="footer__title">
                        Novidades
                    </h3>
                    <ul className="footer__social">
                        <a href={settings?.socialFacebook || "https://www.facebook.com/"} target="_blank" className="footer__social-link">
                            <i className='bx bxl-facebook'></i>
                        </a>
                        <a href={settings?.socialInstagram || "https://www.instagram.com/jonathansantos.costa/"} target="_blank" className="footer__social-link">
                            <i className='bx bxl-instagram-alt'></i>
                        </a>
                        <a href={settings?.socialTiktok || "https://www.tiktok.com/"} target="_blank" className="footer__social-link">
                            <i className='bx bxl-tiktok'></i>
                        </a>
                    </ul>
                </div>
            </div>

            <div className="footer__info ">
                <span className="footer__copy">
                    &#169; {settings?.brandName}. Todos os direitos reservados.
                    <Link to="/admin" style={{ color: 'var(--text-color-light)', marginLeft: '0.5rem' }}>
                        <i className='bx bxs-lock-alt'></i>
                    </Link>
                </span>
            </div>
        </footer>
    );
};

export default Footer;
