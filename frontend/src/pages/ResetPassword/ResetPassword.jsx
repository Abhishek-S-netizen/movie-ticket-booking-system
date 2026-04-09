import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FiLock, FiFilm, FiEye, FiEyeOff } from 'react-icons/fi';
import '../Login/Login.css';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError('Please fill in both fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setMessage('Password successfully reset! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>Create New Password</h2>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="password" className="login-label">New Password</label>
                        <div className="login-input-wrap">
                            <FiLock className="login-input-icon" />
                            <input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPass(s => !s)}
                            >
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="confirmPassword" className="login-label">Confirm New Password</label>
                        <div className="login-input-wrap">
                            <FiLock className="login-input-icon" />
                            <input
                                id="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                className="login-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowConfirm(s => !s)}
                            >
                                {showConfirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="login-server-error">{error}</div>}
                    {message && <div style={{ color: 'var(--c-success)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{message}</div>}

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
