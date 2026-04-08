import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiGlobe, FiStar } from 'react-icons/fi';
import './MovieCard.css';

/**
 * MovieCard — displays a movie poster card with metadata.
 *
 * Props:
 *  movie: {
 *    _id, title, genre[], language, duration, ageRating,
 *    posterUrl, releaseDate
 *  }
 *  featured? boolean — larger variant for hero spotlight
 */
export default function MovieCard({ movie, featured = false }) {
    if (!movie) return null;

    const { _id, title, genre = [], language, duration, ageRating, posterUrl } = movie;

    const durationText = duration
        ? `${Math.floor(duration / 60)}h ${duration % 60}m`
        : null;

    const fallbackPoster = `https://placehold.co/300x450/111318/00e5bf?text=${encodeURIComponent(title)}`;

    return (
        <Link
            to={`/movies/${_id}`}
            id={`movie-card-${_id}`}
            className={`movie-card${featured ? ' movie-card--featured' : ''}`}
            aria-label={`View details for ${title}`}
        >
            {/* Poster */}
            <div className="movie-card__poster-wrap">
                <img
                    className="movie-card__poster"
                    src={posterUrl || fallbackPoster}
                    alt={`${title} poster`}
                    loading="lazy"
                    onError={(e) => { e.target.src = fallbackPoster; }}
                />
                <div className="movie-card__overlay">
                    <span className="movie-card__play" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                </div>
                {ageRating && (
                    <span className="movie-card__rating-badge" aria-label={`Age rating: ${ageRating}`}>
                        {ageRating}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="movie-card__info">
                <div className="movie-card__title-row">
                    <h3 className="movie-card__title">{title}</h3>
                    {movie.rating > 0 && (
                        <span className="movie-card__rating">
                            <FiStar aria-hidden="true" />
                            {movie.rating.toFixed(1)}
                        </span>
                    )}
                </div>

                {/* Genre chips */}
                {genre.length > 0 && (
                    <div className="movie-card__genres" aria-label="Genres">
                        {genre.slice(0, 2).map((g) => (
                            <span key={g} className="movie-card__genre-chip">{g}</span>
                        ))}
                    </div>
                )}

                {/* Meta row */}
                <div className="movie-card__meta">
                    {language && (
                        <span className="movie-card__meta-item">
                            <FiGlobe aria-hidden="true" size={11} />
                            {language}
                        </span>
                    )}
                    {durationText && (
                        <span className="movie-card__meta-item">
                            <FiClock aria-hidden="true" size={11} />
                            {durationText}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
