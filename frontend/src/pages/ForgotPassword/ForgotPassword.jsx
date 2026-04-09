import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiMail, FiFilm, FiArrowLeft } from 'react-icons/fi';
import '../Login/Login.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.message || 'Email sent. Please check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg" aria-hidden="true" />
            <div className="login-card fade-in">
                <div className="login-logo">
                    <FiFilm className="login-logo__icon" />
                    <span className="login-logo__text">CINEMAX</span>
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--c-text-muted)' }}>
                    Enter your email and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="email" className="login-label">Email Address</label>
                        <div className="login-input-wrap">
                            <FiMail className="login-input-icon" />
                            <input
                                id="email"
                                type="email"
                                className="login-input"
                                placeholder="you@cinemax.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="login-server-error">{error}</div>}
                    {message && <div style={{ color: 'var(--c-success)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{message}</div>}

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/login" style={{ color: 'var(--c-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <FiArrowLeft /> Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
