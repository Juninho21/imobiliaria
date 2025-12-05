import React from 'react';

const Footer = () => {
    return (
        <footer className="footer section">
            <div className="footer__container container grid">
                <div>
                    <a href="#" className="footer__logo">
                        Alberto Almeida<i className='bx bxs-home-alt-2'></i>
                    </a>
                    <p className="footer__description">
                        Minha missão é fazer as pessoas <br />
                        encontrarem o melhor lugar para viver.
                    </p>
                </div>

                <div className="footer__content">
                    <h3 className="footer__title">
                        Novidades
                    </h3>
                    <ul className="footer__social">
                        <a href="https://www.youtube.com/user/JonathanCosta746" target="_blank" className="footer__social-link">
                            <i className='bx bxl-youtube'></i>
                        </a>
                        <a href="https://www.instagram.com/jonathansantos.costa/" target="_blank" className="footer__social-link">
                            <i className='bx bxl-instagram-alt'></i>
                        </a>
                        <a href="https://www.tiktok.com/" target="_blank" className="footer__social-link">
                            <i className='bx bxl-tiktok'></i>
                        </a>
                    </ul>
                </div>
            </div>

            <div className="footer__info ">
                <span className="footer__copy">
                    &#169; Alberto Almeida. Todos os direitos reservados.
                </span>
            </div>
        </footer>
    );
};

export default Footer;
