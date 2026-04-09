import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiChevronRight, FiFilm, FiX, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import './Theatres.css';

export default function Theatres() {
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCity, setActiveCity] = useState('All');

    // For the "Quick View" panel
    const [selectedTheatre, setSelectedTheatre] = useState(null);
    const [theatreMovies, setTheatreMovies] = useState([]);
    const [loadingMovies, setLoadingMovies] = useState(false);

    // 1. Fetch all theatres
    useEffect(() => {
        fetchTheatres();
    }, []);

    const fetchTheatres = async () => {
        try {
            setLoading(true);
            const res = await api.get('/theatres');
            setTheatres(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch theatres:', err);
            setError('Could not load cinemas. Please check back later.');
            setLoading(false);
        }
    };

    // 2. Fetch movies for selected theatre
    const handleViewMovies = async (theatre) => {
        setSelectedTheatre(theatre);
        setLoadingMovies(true);
        try {
            const res = await api.get(`/theatres/${theatre._id}/movies`);
            setTheatreMovies(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch theatre movies:', err);
            setTheatreMovies([]);
        } finally {
            setLoadingMovies(false);
        }
    };

    // 3. Derived city list for filter buttons
    const cities = useMemo(() => {
        const list = ['All'];
        theatres.forEach(t => {
            if (t.city && !list.includes(t.city)) list.push(t.city);
        });
        return list;
    }, [theatres]);

    // 4. Filtered list
    const visibleTheatres = useMemo(() => {
        if (activeCity === 'All') return theatres;
        return theatres.filter(t => t.city === activeCity);
    }, [theatres, activeCity]);

    if (loading) return <div className="spinner" style={{ marginTop: '10rem' }} />;
    if (error) return <div className="th-page"><div className="mb-error">{error}</div></div>;

    return (
        <div className="th-page">
            <div className="th-container">

                {/* Header */}
                <header className="th-header">
                    <h1 className="th-title">Find Your Cinema</h1>
                    <p className="th-subtitle">Browse {theatres.length} locations across the country</p>

                    <div className="th-filters">
                        {cities.map(city => (
                            <button
                                key={city}
                                className={`th-filter-btn ${activeCity === city ? 'th-filter-btn--active' : ''}`}
                                onClick={() => setActiveCity(city)}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Grid */}
                <div className="th-grid">
                    {visibleTheatres.length === 0 ? (
                        <div className="mb-empty" style={{ gridColumn: '1/-1' }}>
                            <div className="mb-empty__icon">📍</div>
                            <h3 className="mb-empty__title">No cinemas found in {activeCity}</h3>
                        </div>
                    ) : (
                        visibleTheatres.map(theatre => (
                            <div key={theatre._id} className="th-card" onClick={() => handleViewMovies(theatre)}>
                                <span className="th-card__city">{theatre.city}</span>
                                <h3 className="th-card__name">{theatre.name}</h3>
                                <div className="th-card__location">
                                    <FiMapPin /> {theatre.location}
                                </div>

                                <div className="th-card__footer">
                                    <div className="th-card__movies-pill">
                                        <FiFilm /> Screen {theatre.screens?.length || 0}
                                    </div>
                                    <div className="th-card__btn">
                                        Check Now Playing <FiChevronRight />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Movie Quick-View Modal */}
                {selectedTheatre && (
                    <div className="th-details-overlay" onClick={() => setSelectedTheatre(null)}>
                        <div className="th-details" onClick={e => e.stopPropagation()}>
                            <button className="th-details__close" onClick={() => setSelectedTheatre(null)}>
                                <FiX size={20} />
                            </button>

                            <header className="th-details__header">
                                <span className="th-card__city">{selectedTheatre.city}</span>
                                <h2 className="th-details__title">{selectedTheatre.name}</h2>
                                <div className="th-details__info">
                                    <span><FiMapPin /> {selectedTheatre.location}</span>
                                    <span><FiCheckCircle /> Professional Audio & Seating</span>
                                </div>
                            </header>

                            <section className="th-movies-section">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Now Playing</h3>

                                {loadingMovies ? (
                                    <div className="spinner" style={{ margin: '3rem auto' }} />
                                ) : theatreMovies.length === 0 ? (
                                    <div className="text-muted" style={{ padding: '2rem 0', textAlign: 'center' }}>
                                        No movies scheduled for today at this cinema.
                                    </div>
                                ) : (
                                    <div className="th-movies-grid">
                                        {theatreMovies.map(movie => (
                                            <Link to={`/movies/${movie._id}`} key={movie._id} className="th-movie-item">
                                                {movie.posterUrl ? (
                                                    <img src={movie.posterUrl} alt={movie.title} className="th-movie-poster" />
                                                ) : (
                                                    <div className="th-movie-poster" style={{ background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FiFilm size={40} color="#444" />
                                                    </div>
                                                )}
                                                <span className="th-movie-title">{movie.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
