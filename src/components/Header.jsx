import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useSettings } from '../contexts/SettingsContext';

const Header = () => {
    const { settings } = useSettings();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY >= 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? 'scroll-header' : ''}`} id="header">
            <nav className="nav container">
                <a href="/#home" className="nav__logo">
                    {settings?.brandName}<i className='bx bxs-home-alt-2'></i>
                </a>
                <div className="nav__menu">
                    <ul className="nav__list">

                        <li className="nav__item">
                            <a href="#popular" className="nav__link">
                                <i className='bx bx-building-house' ></i>
                                <span>Imóveis</span>
                            </a>
                        </li>

                        <li className="nav__item">
                            <a href="#about" className="nav__link">
                                <i className='bx bx-user-pin'></i>
                                <span>Quem Sou</span>
                            </a>
                        </li>

                        <li className="nav__item">
                            <a href="#contact" className="nav__link">
                                <i className='bx bx-phone'></i>
                                <span>Contato</span>
                            </a>
                        </li>

                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
