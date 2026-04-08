import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiCalendar, FiHome, FiSettings, FiLogOut } from 'react-icons/fi';
import './UserDashboard.css';

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Guard block (just in case ProtectedRoute leaks, though it shouldn't)
    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
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
                        <h2 className="ud-card-title"><FiSettings className="ud-icon" /> Profile Details</h2>
                        <div className="ud-profile-info">
                            <div className="ud-info-group">
                                <span className="ud-label"><FiUser /> Full Name</span>
                                <span className="ud-value">{user.name}</span>
                            </div>
                            <div className="ud-info-group">
                                <span className="ud-label"><FiMail /> Email Address</span>
                                <span className="ud-value">{user.email}</span>
                            </div>
                            <div className="ud-info-group">
                                <span className="ud-label"><FiSettings /> Account Role</span>
                                <span className="ud-value ud-role-badge">{user.role}</span>
                            </div>
                        </div>
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
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
