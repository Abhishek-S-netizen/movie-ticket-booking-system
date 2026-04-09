import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useUIFeedback } from '../../context/UIFeedbackContent';
import { FiUser, FiMail, FiCalendar, FiHome, FiSettings, FiLogOut, FiEdit2, FiPhone, FiLock } from 'react-icons/fi';
import './UserDashboard.css';

export default function UserDashboard() {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useUIFeedback();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        currentPassword: '',
        newPassword: ''
    });

    // Guard block
    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', form);
            if (res.data?.requiresRelogin) {
                showAlert("Credentials updated successfully. Please log in again.", "success");
                logout();
                navigate('/login');
            } else if (res.data?.user) {
                login(res.data.token, res.data.user);
                showAlert("Profile updated successfully.", "success");
                setIsEditing(false);
                setForm({ ...form, currentPassword: '', newPassword: '' });
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update profile.";
            showAlert(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = await showConfirm({
            title: "Delete Account?",
            message: "Are you absolutely sure? This will permanently delete your account and all personal data. IMPORTANT: Any upcoming tickets will be automatically cancelled and seats released.",
            confirmText: "Delete Forever",
            cancelText: "Keep My Account"
        });

        if (!confirmed) return;

        setLoading(true);
        try {
            await api.delete('/auth/profile');
            showAlert("Your account has been successfully deleted.", "success");
            logout();
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete account.";
            showAlert(msg, "error");
            setLoading(false);
        }
    };

    return (
        <div className="ud-page fade-in">
            <div className="container ud-container">

                {/* Header Section */}
                <div className="ud-header">
                    <div className="ud-header__text">
                        <h1 className="ud-title">Welcome back, {user.name || 'Cinephile'}!</h1>
                        <p className="ud-subtitle">Manage your profile and cinematic adventures.</p>
                    </div>
                </div>

                <div className="ud-content">

                    {/* Profile Card */}
                    <div className="ud-card ud-profile-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="ud-card-title" style={{ margin: 0 }}><FiSettings className="ud-icon" /> Profile Details</h2>
                            {!isEditing && (
                                <button className="btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                                    <FiEdit2 /> Edit Profile
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} className="ud-profile-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="form-group">
                                        <label><FiUser /> Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FiPhone /> Phone Number</label>
                                        <input
                                            type="tel"
                                            value={form.phoneNumber}
                                            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label><FiMail /> Email Address (Changing requires re-login)</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                    />
                                </div>

                                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}><FiLock /> Change Password (Optional)</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                placeholder="Required if changing password"
                                                value={form.currentPassword}
                                                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Leave blank to keep old password"
                                                value={form.newPassword}
                                                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="ud-profile-info">
                                <div className="ud-info-group">
                                    <span className="ud-label"><FiUser /> Full Name</span>
                                    <span className="ud-value">{user.name}</span>
                                </div>
                                <div className="ud-info-group">
                                    <span className="ud-label"><FiMail /> Email Address</span>
                                    <span className="ud-value">{user.email}</span>
                                </div>
                                {user.phoneNumber && (
                                    <div className="ud-info-group">
                                        <span className="ud-label"><FiPhone /> Phone Number</span>
                                        <span className="ud-value">{user.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="ud-info-group">
                                    <span className="ud-label"><FiSettings /> Account Role</span>
                                    <span className="ud-value ud-role-badge">{user.role}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="ud-card ud-actions-card">
                        <h2 className="ud-card-title">Quick Actions</h2>
                        <div className="ud-action-grid">
                            <button
                                className="ud-action-btn"
                                onClick={() => navigate('/my-bookings')}
                            >
                                <div className="ud-btn-icon"><FiCalendar /></div>
                                <div className="ud-btn-text">
                                    <h3>My Bookings</h3>
                                    <p>View upcoming and past tickets</p>
                                </div>
                            </button>

                            <button
                                className="ud-action-btn ud-action-btn--secondary"
                                onClick={() => navigate('/')}
                            >
                                <div className="ud-btn-icon"><FiHome /></div>
                                <div className="ud-btn-text">
                                    <h3>Browse Movies</h3>
                                    <p>Discover new screenings</p>
                                </div>
                            </button>

                            <button
                                className="ud-action-btn ud-action-btn--danger"
                                onClick={handleLogout}
                            >
                                <div className="ud-btn-icon"><FiLogOut /></div>
                                <div className="ud-btn-text">
                                    <h3>Sign Out</h3>
                                    <p>Securely log out of your account</p>
                                </div>
                            </button>

                            <button
                                className="ud-action-btn ud-action-btn--danger ud-action-btn--outline"
                                onClick={handleDeleteAccount}
                                disabled={loading}
                            >
                                <div className="ud-btn-icon"><FiUser /></div>
                                <div className="ud-btn-text">
                                    <h3>Delete Account</h3>
                                    <p>Permanently remove your data</p>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
