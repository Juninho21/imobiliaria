import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
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
                <Link to="/" className="nav__logo">
                    Alberto Almeida<i className='bx bxs-home-alt-2'></i>
                </Link>
                <div className="nav__menu">
                    <ul className="nav__list">
                        <li className="nav__item">
                            <a href="#home" className="nav__link activate-link">
                                <i className='bx bx-home-alt-2'></i>
                                <span>Home</span>
                            </a>
                        </li>
                        <li className="nav__item">
                            <a href="#popular" className="nav__link">
                                <i className='bx bx-building-house' ></i>
                                <span>Casas</span>
                            </a>
                        </li>
                        <li className="nav__item">
                            <a href="#value" className="nav__link">
                                <i className='bx bx-award' ></i>
                                <span>Valores</span>
                            </a>
                        </li>
                        <li className="nav__item">
                            <a href="#contact" className="nav__link">
                                <i className='bx bx-phone'></i>
                                <span>Contato</span>
                            </a>
                        </li>
                        <li className="nav__item">
                            <Link to="/admin" className="nav__link">
                                <i className='bx bx-user'></i>
                                <span>Admin</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
