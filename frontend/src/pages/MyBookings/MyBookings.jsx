import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TicketModal from '../../components/TicketModal/TicketModal';
import { FiCalendar, FiMapPin, FiMonitor, FiTag, FiPackage, FiClock } from 'react-icons/fi';
import './MyBookings.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(d) {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        api.get('/bookings/mybookings')
            .then(r => setBookings(r.data))
            .catch(() => setError('Failed to load your bookings.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="mb-page fade-in">
            {selectedBooking && (
                <TicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
            )}
            <div className="container mb-inner">
                {/* Page header */}
                <div className="mb-page-header">
                    <h1 className="mb-page-title">My Bookings</h1>
                    <p className="mb-page-sub">Your complete screening history</p>
                </div>

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                        <div className="spinner" />
                    </div>
                )}

                {!loading && error && (
                    <div className="mb-error">{error}</div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="mb-empty">
                        <div className="mb-empty__icon">🎬</div>
                        <h3 className="mb-empty__title">No bookings yet</h3>
                        <p className="mb-empty__sub">Browse movies and book your first screening.</p>
                        <button className="btn-primary" onClick={() => navigate('/')}>Explore Movies</button>
                    </div>
                )}

                {!loading && bookings.length > 0 && (
                    <div className="mb-list">
                        {bookings.map(booking => {
                            const show = booking.showId;
                            const movie = show?.movieId;
                            const theatre = show?.theatreId;
                            const isPast = show?.showTime ? new Date(show.showTime) < new Date() : false;

                            return (
                                <div
                                    key={booking._id}
                                    className={`mb-card ${isPast ? 'mb-card--past' : 'mb-card--upcoming'}`}
                                >
                                    {/* Poster */}
                                    <div className="mb-card__poster-wrap">
                                        {movie?.posterUrl
                                            ? <img src={movie.posterUrl} alt={movie?.title} className="mb-card__poster" />
                                            : <div className="mb-card__poster mb-card__poster--placeholder">🎬</div>
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="mb-card__info">
                                        <div className="mb-card__header">
                                            <h2 className="mb-card__title">{movie?.title || 'Unknown Movie'}</h2>
                                            <span className={`mb-status-badge mb-status-badge--${booking.bookingStatus.toLowerCase()}`}>
                                                {booking.bookingStatus}
                                            </span>
                                        </div>

                                        <div className="mb-card__meta">
                                            {show?.showTime && (
                                                <>
                                                    <span><FiCalendar /> {formatDate(show.showTime)}</span>
                                                    <span><FiClock /> {formatTime(show.showTime)}</span>
                                                </>
                                            )}
                                            {theatre && (
                                                <span><FiMapPin /> {theatre.name}, {theatre.city}</span>
                                            )}
                                            {show?.screenNumber && (
                                                <span><FiMonitor /> Screen {show.screenNumber}</span>
                                            )}
                                        </div>

                                        <div className="mb-card__seats">
                                            <span className="mb-seats-label"><FiTag /> Seats:</span>
                                            {booking.seats.sort().map(s => (
                                                <span key={s} className="mb-seat-chip">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="mb-card__amount-wrap">
                                        <span className="mb-amount">${booking.totalAmount.toFixed(2)}</span>
                                        <span className="mb-amount-label">{booking.paymentStatus}</span>
                                        <div className="mb-booking-id">
                                            <FiPackage />
                                            <span title={booking._id}>{booking._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        {isPast && <span className="mb-past-tag">Screened</span>}
                                        {booking.bookingStatus === 'Confirmed' && (
                                            <button
                                                className="mb-get-ticket-btn"
                                                onClick={() => setSelectedBooking(booking)}
                                                aria-label={`Get ticket for ${movie?.title}`}
                                            >
                                                🎟 Get Ticket
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
