import React, { useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import './InfoModal.css';

const InfoModal = ({ isOpen, onClose, type }) => {
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.className === 'info-modal-overlay') {
            onClose();
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitted(false);
            onClose();
        }, 2000);
    };

    const renderContent = () => {
        if (type === 'about') {
            return (
                <div className="info-modal-body">
                    <h2>Our Story</h2>
                    <p>
                        Welcome to <strong>Cinemax</strong>, where the magic of the silver screen meets absolute luxury.
                        Founded with a passion for high-fidelity storytelling, we've redefined the cinema experience for the modern era.
                    </p>
                    <p>
                        At Cinemax, we believe that watching a movie shouldn't just be an activity—it should be an escape.
                        From our 4K laser projection systems to the custom-engineered Dolby Atmos soundscapes in every hall,
                        every detail is designed to pull you deeper into the story.
                    </p>
                    <p>
                        Our flagship theatres feature premium recliner seating, artisanal dining, and a selection of the
                        world's finest films, ranging from pulse-pounding blockbusters to independent masterpieces.
                    </p>
                    <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                        <p style={{ color: 'var(--color-accent-primary)', fontSize: '14px', fontWeight: 'bold' }}>
                            Experience the pinnacle of cinema. Only at Cinemax.
                        </p>
                    </div>
                </div>
            );
        }

        if (type === 'contact') {
            return (
                <div className="info-modal-body">
                    <h2>Contact Us</h2>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FaCheckCircle size={60} color="var(--color-accent-primary)" style={{ marginBottom: '20px' }} />
                            <h3>Message Sent!</h3>
                            <p>Thank you for reaching out. A Cinemax representative will get back to you shortly.</p>
                        </div>
                    ) : (
                        <>
                            <p>Have a question or feedback? We'd love to hear from you.</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>
                                * This form is a frontend simulation for demonstration purposes.
                            </p>
                            <form className="contact-form" onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="John Doe" required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="john@example.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea rows="4" placeholder="How can we help you?" required></textarea>
                                </div>
                                <button type="submit" className="submit-btn shadow-glow">Send Message</button>
                            </form>
                        </>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="info-modal-overlay" onClick={handleBackdropClick}>
            <div className="info-modal-card">
                <button className="info-modal-close" onClick={onClose} aria-label="Close modal">
                    <FaTimes />
                </button>
                <div className="info-modal-scroll-area">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
