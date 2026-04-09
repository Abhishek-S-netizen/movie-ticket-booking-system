import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlay, FiCalendar, FiChevronRight, FiStar } from 'react-icons/fi';
import api from '../../services/api';
import MovieCard from '../../components/MovieCard/MovieCard';
import './Home.css';

// Filter categories
const FILTERS = ['Now Showing', 'Coming Soon', 'Action', 'Sci-Fi', 'Drama', 'Horror', 'Comedy'];

// Languages
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu'];

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('Now Showing');
    const [activeLang, setActiveLang] = useState('');
    const [heroIndex, setHeroIndex] = useState(0);

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    // Fetch all movies
    useEffect(() => {
        setLoading(true);
        api.get('/movies')
            .then((res) => {
                setMovies(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch movies:', err);
                setError('Failed to load movies. Please try again later.');
                setLoading(false);
                // Use demo data so the UI isn't blank during development
                setMovies(DEMO_MOVIES);
            });
    }, []);

    // Auto-cycle hero
    useEffect(() => {
        if (movies.length <= 1) return;
        const id = setInterval(() => {
            setHeroIndex((i) => (i + 1) % Math.min(movies.length, 5));
        }, 6000);
        return () => clearInterval(id);
    }, [movies.length]);

    // Filtered + searched movie list
    const visibleMovies = useMemo(() => {
        const today = new Date();
        let list = movies;

        // Search query takes precedence
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter((m) => m.title?.toLowerCase().includes(q));
        }

        // Filter by tab
        if (activeFilter === 'Now Showing') {
            list = list.filter(m => new Date(m.releaseDate) <= today);
        } else if (activeFilter === 'Coming Soon') {
            list = list.filter(m => new Date(m.releaseDate) > today);
        } else {
            // Genre filters - Only show released movies of that genre
            list = list.filter(m => m.genre?.includes(activeFilter) && new Date(m.releaseDate) <= today);
        }

        // Filter by language
        if (activeLang) {
            list = list.filter((m) => m.language === activeLang);
        }

        return list;
    }, [movies, searchQuery, activeFilter, activeLang]);

    const heroMovie = movies[heroIndex] || DEMO_MOVIES[0];

    const heroPoster = heroMovie?.backdropUrl || heroMovie?.posterUrl || '';
    const heroTitle = heroMovie?.title || 'Neon Revenant';
    const heroDesc = heroMovie?.description || 'In a world where memories are traded like currency, one detective must find the girl who stole his past before the clock strikes midnight on his existence.';
    const heroGenre = heroMovie?.genre?.join(' · ') || 'Action · Thriller';
    const heroRating = heroMovie?.ageRating || 'UA';
    const heroDur = heroMovie?.duration
        ? `${Math.floor(heroMovie.duration / 60)}h ${heroMovie.duration % 60}m`
        : '2h 18m';

    return (
        <main className="home" id="home-main">
            {/* ══ HERO BANNER ══ */}
            <section
                className="hero"
                aria-label="Featured movie"
            >
                {/* Background layers */}
                <div className="hero__bg" aria-hidden="true">
                    {(movies.length > 0 ? movies : []).slice(0, 5).map((m, i) => (
                        <div
                            key={m._id || i}
                            className={`hero__bg-layer ${i === heroIndex ? 'hero__bg-layer--active' : ''}`}
                        >
                            {(m.backdropUrl || m.posterUrl) ? (
                                <img src={m.backdropUrl || m.posterUrl} alt="" className="hero__bg-img" />
                            ) : (
                                <div className="hero__bg-fallback" />
                            )}
                        </div>
                    ))}
                    <div className="hero__bg-vignette" />
                    <div className="hero__bg-gradient" />
                </div>

                {/* Content */}
                <div className="hero__content container" key={heroMovie?._id || heroIndex}>
                    {/* Label */}
                    {new Date(heroMovie?.releaseDate) <= new Date() ? (
                        <span className="hero__label badge badge--teal">Now Showing</span>
                    ) : (
                        <span className="hero__label badge badge--orange">Coming Soon</span>
                    )}

                    {/* Title */}
                    <h1 className="hero__title">{heroTitle}</h1>

                    {/* Description */}
                    <p className="hero__desc">{heroDesc.slice(0, 160)}{heroDesc.length > 160 ? '…' : ''}</p>

                    {/* Badges row */}
                    <div className="hero__badges">
                        <span className="hero__meta-chip">{heroRating}</span>
                        <span className="hero__meta-sep" aria-hidden="true" />
                        <span className="hero__meta-chip">{heroGenre}</span>
                        <span className="hero__meta-sep" aria-hidden="true" />
                        <span className="hero__meta-chip">{heroDur}</span>
                    </div>

                    {/* CTA row */}
                    <div className="hero__cta-row">
                        <Link
                            to={heroMovie?._id ? `/movies/${heroMovie._id}` : '/movies'}
                            id="hero-book-tickets-btn"
                            className="btn-primary hero__cta-main"
                        >
                            Book Tickets
                            <FiCalendar aria-hidden="true" />
                        </Link>
                        {heroMovie?.trailerUrl && (
                            <a
                                href={heroMovie.trailerUrl}
                                id="hero-watch-trailer-btn"
                                className="btn-ghost hero__cta-ghost"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FiPlay aria-hidden="true" />
                                Watch Trailer
                            </a>
                        )}
                        {!heroMovie?.trailerUrl && (
                            <button disabled className="btn-ghost hero__cta-ghost">
                                <FiPlay aria-hidden="true" />
                                Watch Trailer
                            </button>
                        )}
                    </div>

                    {/* Rating chip — bottom right */}

                    {/* Hero dots nav */}
                    {movies.length > 1 && (
                        <div className="hero__dots" role="tablist" aria-label="Featured movies">
                            {movies.slice(0, 5).map((_, i) => (
                                <button
                                    key={i}
                                    id={`hero-dot-${i}`}
                                    className={`hero__dot${i === heroIndex ? ' hero__dot--active' : ''}`}
                                    role="tab"
                                    aria-selected={i === heroIndex}
                                    aria-label={`Feature ${i + 1}`}
                                    onClick={() => setHeroIndex(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ══ MOVIE GRID SECTION ══ */}
            <section className="movies-section" aria-labelledby="movies-heading">
                <div className="container">

                    {/* Filter bar */}
                    <div className="filter-bar" role="toolbar" aria-label="Movie filters">
                        {/* Genre tabs */}
                        <div className="filter-bar__tabs" role="tablist" aria-label="Genre filter">
                            {FILTERS.map((f) => (
                                <button
                                    key={f}
                                    id={`filter-${f.replace(/\s+/g, '-').toLowerCase()}`}
                                    role="tab"
                                    aria-selected={activeFilter === f}
                                    className={`filter-bar__tab${activeFilter === f ? ' filter-bar__tab--active' : ''}`}
                                    onClick={() => setActiveFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Right controls */}
                        <div className="filter-bar__right">
                            <label className="filter-bar__lang-label" htmlFor="lang-select">Language</label>
                            <select
                                id="lang-select"
                                className="filter-bar__select"
                                value={activeLang}
                                onChange={(e) => setActiveLang(e.target.value)}
                                aria-label="Filter by language"
                            >
                                <option value="">All</option>
                                {LANGUAGES.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>

                            <button
                                id="filter-sort-btn"
                                className="filter-bar__sort-btn"
                                aria-label="Sort movies"
                            >
                                Sort
                            </button>
                        </div>
                    </div>

                    {/* Section heading */}
                    <div className="movies-section__header">
                        <h2 id="movies-heading" className="section-title">
                            {searchQuery
                                ? `Results for "${searchQuery}"`
                                : activeFilter === 'Now Showing'
                                    ? 'Now Showing'
                                    : activeFilter}
                        </h2>
                        <Link to="/movies" className="movies-section__see-all" id="see-all-movies-link">
                            See All <FiChevronRight aria-hidden="true" />
                        </Link>
                    </div>

                    {/* States */}
                    {loading && (
                        <div className="spinner" role="status" aria-label="Loading movies…" />
                    )}

                    {!loading && error && movies.length === 0 && (
                        <p className="movies-section__error" role="alert">{error}</p>
                    )}

                    {!loading && visibleMovies.length === 0 && (
                        <p className="movies-section__empty">No movies found.</p>
                    )}

                    {/* Grid */}
                    {!loading && visibleMovies.length > 0 && (
                        <div
                            className="movies-grid fade-in"
                            role="list"
                            aria-label="Movie list"
                        >
                            {visibleMovies.map((movie) => (
                                <div key={movie._id} role="listitem">
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

/* ── Demo data shown when backend isn't running ── */
const DEMO_MOVIES = [
    {
        _id: 'demo-1',
        title: 'The Silent Void',
        genre: ['Action', 'Thriller'],
        language: 'English',
        duration: 132,
        ageRating: 'UA',
        description: 'A detective navigates a city gripped by silence, hunting a ghost that shouldn\'t exist.',
        posterUrl: '',
        trailerUrl: '',
    },
    {
        _id: 'demo-2',
        title: 'Monolith',
        genre: ['Sci-Fi', 'Drama'],
        language: 'English',
        duration: 118,
        ageRating: 'U',
        description: 'Safe Power Work — a thriller set in the near future.',
        posterUrl: '',
        trailerUrl: '',
    },
    {
        _id: 'demo-3',
        title: 'The Last Reel',
        genre: ['Drama', 'Comedy'],
        language: 'Hindi',
        duration: 142,
        ageRating: 'A',
        description: 'Two rival filmmakers compete for the same story.',
        posterUrl: '',
        trailerUrl: '',
    },
    {
        _id: 'demo-4',
        title: 'Vengeance',
        genre: ['Action', 'Horror'],
        language: 'English',
        duration: 105,
        ageRating: 'UA',
        description: 'Safe for Work — a quiet revenge story.',
        posterUrl: '',
        trailerUrl: '',
    },
];
