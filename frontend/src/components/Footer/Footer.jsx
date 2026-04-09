import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import InfoModal from '../InfoModal/InfoModal';
import './Footer.css';

const Footer = () => {
    const location = useLocation();
    const path = location.pathname;
    const [activeModal, setActiveModal] = useState(null); // 'about' | 'contact' | null

    // Define routes where footer should be hidden for better focus/UX
    const hideFooterRoutes = [
        '/login',
        '/forgot-password',
        '/admin',
        '/checkout',
        '/my-bookings',
        '/user-dashboard'
    ];

    // Specific regex/logic for dynamic routes
    const isSeatSelection = path.includes('/seats');
    const isResetPassword = path.includes('/reset-password');
    const isAdminPath = path.startsWith('/admin');

    if (hideFooterRoutes.includes(path) || isSeatSelection || isResetPassword || isAdminPath) {
        return null;
    }

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2>Cinemax</h2>
                    <p>
                        The ultimate destination for movie lovers. Experience cinema like never before with high-end comfort and state-of-the-art technology.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/theatres">Theatres</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Information</h3>
                    <ul className="footer-links">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('about'); }}>About Us</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('contact'); }}>Contact Us</a></li>
                        <li><a href="#">Terms of Use</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Locations</h3>
                    <ul className="footer-links">
                        <li><a href="#">Mumbai, IN</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} Cinemax. All rights reserved.
                    </p>
                    <div className="footer-legal">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </div>

            {/* Info Modals */}
            <InfoModal
                isOpen={activeModal !== null}
                onClose={() => setActiveModal(null)}
                type={activeModal}
            />
        </footer>
    );
};

export default Footer;
