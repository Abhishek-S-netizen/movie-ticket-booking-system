// Placeholder for Login Page
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiFilm } from 'react-icons/fi';
import './Login.css';

function validate(tab, form) {
    const errors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (tab === 'login') {
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!emailRe.test(form.email)) errors.email = 'Enter a valid email';
        if (!form.password) errors.password = 'Password is required';
    } else {
        if (!form.name.trim()) errors.name = 'Name is required';
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!emailRe.test(form.email)) errors.email = 'Enter a valid email';
        if (!form.password) errors.password = 'Password is required';
        else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    }
    return errors;
}

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('login');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        name: '', email: '', password: '', phoneNumber: '',
    });

    // Already logged in → go home
    if (user) return <Navigate to="/" replace />;

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }));
        setServerError('');
    };

    const switchTab = (t) => {
        setTab(t);
        setFieldErrors({});
        setServerError('');
        setForm({ name: '', email: '', password: '', phoneNumber: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(tab, form);
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }

        setLoading(true);
        setServerError('');
        try {
            const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
            const payload = tab === 'login'
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password, phoneNumber: form.phoneNumber };

            const { data } = await api.post(endpoint, payload);
            // Auth response is NOT enveloped — it returns { token, user } directly
            const token = data.token;
            const userData = data.user;
            login(token, userData);
            navigate(userData.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg" aria-hidden="true" />

            <div className="login-card fade-in">
                {/* Logo */}
                <div className="login-logo">
                    <FiFilm className="login-logo__icon" />
                    <span className="login-logo__text">CINEMAX</span>
                </div>
                <p className="login-tagline">The Digital Auteur Experience</p>

                {/* Tab switcher */}
                <div className="login-tabs" role="tablist">
                    <button
                        id="tab-login"
                        role="tab"
                        aria-selected={tab === 'login'}
                        className={`login-tab ${tab === 'login' ? 'login-tab--active' : ''}`}
                        onClick={() => switchTab('login')}
                    >Login</button>
                    <button
                        id="tab-register"
                        role="tab"
                        aria-selected={tab === 'register'}
                        className={`login-tab ${tab === 'register' ? 'login-tab--active' : ''}`}
                        onClick={() => switchTab('register')}
                    >Sign Up</button>
                </div>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {/* Name — register only */}
                    {tab === 'register' && (
                        <div className="login-field">
                            <label htmlFor="login-name" className="login-label">Full Name</label>
                            <div className="login-input-wrap">
                                <FiUser className="login-input-icon" />
                                <input
                                    id="login-name"
                                    name="name"
                                    type="text"
                                    className={`login-input ${fieldErrors.name ? 'login-input--error' : ''}`}
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                />
                            </div>
                            {fieldErrors.name && <span className="login-error">{fieldErrors.name}</span>}
                        </div>
                    )}

                    {/* Email */}
                    <div className="login-field">
                        <label htmlFor="login-email" className="login-label">Email Address</label>
                        <div className="login-input-wrap">
                            <FiMail className="login-input-icon" />
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                className={`login-input ${fieldErrors.email ? 'login-input--error' : ''}`}
                                placeholder="you@cinemax.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                        {fieldErrors.email && <span className="login-error">{fieldErrors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="login-field">
                        <label htmlFor="login-password" className="login-label">Password</label>
                        <div className="login-input-wrap">
                            <FiLock className="login-input-icon" />
                            <input
                                id="login-password"
                                name="password"
                                type={showPass ? 'text' : 'password'}
                                className={`login-input ${fieldErrors.password ? 'login-input--error' : ''}`}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPass(s => !s)}
                                aria-label={showPass ? 'Hide password' : 'Show password'}
                            >
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {fieldErrors.password && <span className="login-error">{fieldErrors.password}</span>}
                    </div>

                    {/* Phone — register only */}
                    {tab === 'register' && (
                        <div className="login-field">
                            <label htmlFor="login-phone" className="login-label">Phone Number <span className="login-optional">(optional)</span></label>
                            <div className="login-input-wrap">
                                <FiPhone className="login-input-icon" />
                                <input
                                    id="login-phone"
                                    name="phoneNumber"
                                    type="tel"
                                    className="login-input"
                                    placeholder="+1 555 000 0000"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                />
                            </div>
                        </div>
                    )}

                    {serverError && (
                        <div className="login-server-error" role="alert">{serverError}</div>
                    )}

                    <button
                        id={tab === 'login' ? 'btn-enter-theater' : 'btn-create-account'}
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait…'
                            : tab === 'login' ? 'Enter the Theater →' : 'Create Account →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
