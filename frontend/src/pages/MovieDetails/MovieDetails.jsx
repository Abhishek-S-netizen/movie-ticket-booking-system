import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useUIFeedback } from '../../context/UIFeedbackContent';
import { FiClock, FiGlobe, FiCalendar, FiStar, FiPlay, FiInfo } from 'react-icons/fi';
import './MovieDetails.css';

// Group shows by calendar date string (YYYY-MM-DD)
function groupByDate(shows) {
    return shows.reduce((acc, show) => {
        const key = new Date(show.showTime).toDateString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(show);
        return acc;
    }, {});
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDuration(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
}

function getShowStatus(showTime) {
    const now = new Date();
    const start = new Date(showTime);
    const lateCutoff = new Date(start.getTime() + 15 * 60 * 1000);

    if (now > lateCutoff) return 'ended';
    if (now > start) return 'started';
    return 'upcoming';
}

export default function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useUIFeedback();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loadingMovie, setLoadingMovie] = useState(true);
    const [loadingShows, setLoadingShows] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedShow, setSelectedShow] = useState(null);

    useEffect(() => {
        setLoadingMovie(true);
        api.get(`/movies/${id}`)
            .then(r => setMovie(r.data))
            .catch(() => setError('Movie not found.'))
            .finally(() => setLoadingMovie(false));

        api.get(`/shows/movie/${id}`)
            .then(r => { setShows(r.data); })
            .catch(() => { })
            .finally(() => setLoadingShows(false));
    }, [id]);

    const dateGroups = useMemo(() => groupByDate(shows), [shows]);
    const dateKeys = Object.keys(dateGroups);

    // Auto-select first available date
    useEffect(() => {
        if (dateKeys.length && !selectedDate) {
            setSelectedDate(dateKeys[0]);
        }
    }, [dateKeys]);

    // Clear selected show when date changes
    useEffect(() => { setSelectedShow(null); }, [selectedDate]);

    const handleBookNow = () => {
        if (!selectedShow) return;
        const status = getShowStatus(selectedShow.showTime);

        if (status === 'ended') {
            showAlert('This show has already started and the 15-minute entry window has passed.', 'error');
            return;
        }

        navigate(`/shows/${selectedShow._id}/seats`);
    };

    if (loadingMovie) return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
            <div className="spinner" />
        </div>
    );

    if (error || !movie) return (
        <div className="md-error">
            <p>{error || 'Movie not found.'}</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
    );

    const trailerEmbedUrl = movie.trailerUrl
        ? movie.trailerUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
        : null;

    return (
        <div className="md-page fade-in">
            {/* ── Hero ── */}
            <div
                className="md-hero"
                style={movie.posterUrl ? { '--hero-bg': `url(${movie.posterUrl})` } : {}}
            >
                <div className="md-hero__overlay" />
                <div className="md-hero__content container">
                    <div className="md-hero__poster-wrap">
                        {movie.posterUrl
                            ? <img src={movie.posterUrl} alt={movie.title} className="md-hero__poster" />
                            : <div className="md-hero__poster md-hero__poster--placeholder">🎬</div>
                        }
                    </div>

                    <div className="md-hero__info">
                        {movie.genre?.length > 0 && (
                            <div className="md-hero__genres">
                                {movie.genre.map(g => (
                                    <span key={g} className="badge badge--outline">{g}</span>
                                ))}
                            </div>
                        )}
                        <h1 className="md-hero__title">{movie.title}</h1>
                        <div className="md-hero__meta">
                            <span className="md-meta-pill"><FiStar className="text-yellow" /> {movie.rating?.toFixed(1) || '0.0'} / 10</span>
                            <span className="md-meta-pill"><FiClock /> {formatDuration(movie.duration)}</span>
                            <span className="md-meta-pill"><FiGlobe /> {movie.language}</span>
                            <span className="md-meta-pill">Age: {movie.ageRating}</span>
                            <span className="md-meta-pill"><FiCalendar /> {new Date(movie.releaseDate).getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="md-body container">
                {/* Left column */}
                <div className="md-left">
                    <section className="md-section">
                        <h2 className="md-section-title">— The Synopsis</h2>
                        <p className="md-synopsis">{movie.description}</p>
                    </section>

                    {trailerEmbedUrl && (
                        <section className="md-section">
                            <h2 className="md-section-title"><FiPlay /> Trailer</h2>
                            <div className="md-trailer-wrap">
                                <iframe
                                    src={trailerEmbedUrl}
                                    title={`${movie.title} trailer`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="md-trailer"
                                />
                            </div>
                        </section>
                    )}
                </div>

                {/* Right column — showtime picker */}
                <aside className="md-showtime-panel">
                    <h3 className="md-panel-title">Select Showtime</h3>

                    {loadingShows ? (
                        <div className="spinner" style={{ width: 24, height: 24, margin: '16px auto' }} />
                    ) : dateKeys.length === 0 ? (
                        <p className="md-no-shows">No upcoming shows available.</p>
                    ) : (
                        <>
                            {/* Date tabs */}
                            <div className="md-date-tabs">
                                {dateKeys.slice(0, 5).map(dk => (
                                    <button
                                        key={dk}
                                        id={`date-tab-${dk.replace(/\s/g, '-')}`}
                                        className={`md-date-btn ${selectedDate === dk ? 'md-date-btn--active' : ''}`}
                                        onClick={() => setSelectedDate(dk)}
                                    >
                                        <span className="md-date-btn__month">{new Date(dk).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="md-date-btn__day">{new Date(dk).getDate()}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Time slots */}
                            {selectedDate && (
                                <div className="md-time-slots">
                                    <p className="md-time-label">Available Times</p>
                                    <div className="md-times-grid">
                                        {(dateGroups[selectedDate] || [])
                                            .filter(show => getShowStatus(show.showTime) !== 'ended')
                                            .map(show => {
                                                const status = getShowStatus(show.showTime);
                                                const isStarted = status === 'started';

                                                return (
                                                    <button
                                                        key={show._id}
                                                        id={`show-time-${show._id}`}
                                                        className={`md-time-btn ${selectedShow?._id === show._id ? 'md-time-btn--active' : ''}`}
                                                        onClick={() => setSelectedShow(show)}
                                                    >
                                                        <div className="md-time-btn__top">
                                                            {formatTime(show.showTime)}
                                                            {isStarted && <span className="md-time-tag md-time-tag--live">STARTED</span>}
                                                        </div>
                                                        {show.theatreId?.name && (
                                                            <span className="md-time-btn__theatre">{show.theatreId.name}</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Price + CTA */}
                            {selectedShow && (
                                <div className="md-booking-footer">
                                    <div className="md-price-info">
                                        <span className="md-price-label">From</span>
                                        <span className="md-price">
                                            ${selectedShow.pricing?.standard?.toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        id="btn-book-now"
                                        className="btn-primary md-book-btn"
                                        onClick={handleBookNow}
                                    >
                                        🎬 Book Now
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}
