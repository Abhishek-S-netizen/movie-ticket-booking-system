import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiFilm, FiUser, FiLogOut, FiList, FiShield, FiSearch
} from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
    const { user, isAdmin, logout } = useAuth();

    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
            <div className="navbar__inner">
                {/* Logo */}
                <Link to="/" className="navbar__logo" aria-label="CineMax home">
                    <FiFilm className="navbar__logo-icon" aria-hidden="true" />
                    <span className="navbar__logo-text">CINEMAX</span>
                </Link>

                {/* Primary nav links */}
                <nav className="navbar__links" aria-label="Primary navigation">
                    <NavLink to="/" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`} end>Home</NavLink>
                    <NavLink to="/movies" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>Movies</NavLink>
                    <NavLink to="/theatres" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>Theatres</NavLink>
                    {user && (
                        <NavLink to="/my-bookings" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>My Bookings</NavLink>
                    )}
                </nav>

                {/* Right actions */}
                <div className="navbar__actions">
                    {/* Search */}
                    <button
                        id="navbar-search-btn"
                        className="navbar__icon-btn"
                        aria-label="Search movies"
                        onClick={() => setSearchOpen((s) => !s)}
                    >
                        <FiSearch />
                    </button>

                    {searchOpen && (
                        <form className="navbar__search-form" onSubmit={handleSearchSubmit} role="search">
                            <input
                                id="navbar-search-input"
                                className="navbar__search-input"
                                type="search"
                                placeholder="Search movies…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                aria-label="Search input"
                            />
                        </form>
                    )}

                    {user ? (
                        <div className="navbar__user-menu">
                            <button
                                id="navbar-user-btn"
                                className="navbar__user-btn"
                                onClick={() => setMenuOpen((o) => !o)}
                                aria-expanded={menuOpen}
                                aria-haspopup="true"
                            >
                                <span className="navbar__avatar" aria-hidden="true">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                                <span className="navbar__user-name">{user.name}</span>
                            </button>

                            {menuOpen && (
                                <div className="navbar__dropdown" role="menu" aria-label="User menu">
                                    {isAdmin ? (
                                        <Link to="/admin" className="navbar__dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                                            <FiShield aria-hidden="true" /> Admin Dashboard
                                        </Link>
                                    ) : (
                                        <Link to="/user-dashboard" className="navbar__dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                                            <FiUser aria-hidden="true" /> My Dashboard
                                        </Link>
                                    )}
                                    <Link to="/my-bookings" className="navbar__dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                                        <FiList aria-hidden="true" /> My Bookings
                                    </Link>
                                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" role="menuitem" onClick={handleLogout}>
                                        <FiLogOut aria-hidden="true" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" id="navbar-login-btn" className="navbar__login-btn">
                            <FiUser aria-hidden="true" /> Profile
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
