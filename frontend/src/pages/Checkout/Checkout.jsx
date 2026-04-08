// Placeholder for Checkout Page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiMapPin, FiCalendar, FiMonitor, FiArrowLeft, FiCheck } from 'react-icons/fi';
import './Checkout.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}
function formatTime(d) {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [checkoutData, setCheckoutData] = useState(null);
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const raw = sessionStorage.getItem('checkoutData');
        if (!raw) { navigate('/'); return; }
        try { setCheckoutData(JSON.parse(raw)); }
        catch { navigate('/'); }
    }, []);

    if (!checkoutData) return null;

    const {
        showId, seats, totalAmount, subtotal, fee,
        standardSeats, premiumSeats, pricing,
        movie, theatre, showTime, screenNumber,
    } = checkoutData;

    const handleConfirm = async () => {
        setBooking(true);
        setError('');
        try {
            await api.post('/bookings', {
                showId,
                seats,
                totalAmount,
                paymentStatus: 'Completed',
            });
            sessionStorage.removeItem('checkoutData');
            setSuccess(true);
            setTimeout(() => navigate('/my-bookings'), 2200);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    // Success state
    if (success) return (
        <div className="co-success fade-in">
            <div className="co-success__icon"><FiCheck /></div>
            <h2 className="co-success__title">Booking Confirmed!</h2>
            <p className="co-success__sub">Redirecting to your bookings…</p>
        </div>
    );

    return (
        <div className="co-page fade-in">
            <div className="container co-inner">
                {/* Left panel */}
                <div className="co-left">
                    {movie.posterUrl && (
                        <img src={movie.posterUrl} alt={movie.title} className="co-poster" />
                    )}
                    <div className="co-left__text">
                        <h1 className="co-movie-title">{movie.title}</h1>
                        <p className="co-left__sub">Complete Your Booking</p>
                        <p className="co-left__desc">
                            Secure your selected seats and proceed to payment to secure
                            your seats for the premier experience at Cinemax.
                        </p>
                        <button
                            id="btn-modify-seats"
                            className="btn-ghost co-modify-btn"
                            onClick={() => navigate(-1)}
                        >
                            <FiArrowLeft /> Modify Seats
                        </button>
                    </div>
                </div>

                {/* Right panel — summary */}
                <div className="co-right">
                    <div className="co-summary-card">
                        <h2 className="co-summary-title">Booking Summary</h2>

                        <div className="co-summary-venue">
                            <div className="co-venue-row">
                                <FiMapPin className="co-venue-icon" />
                                <div>
                                    <p className="co-venue-name">{theatre.name}</p>
                                    <p className="co-venue-loc">{theatre.location}, {theatre.city}</p>
                                </div>
                            </div>
                            <div className="co-venue-row">
                                <FiCalendar className="co-venue-icon" />
                                <div>
                                    <p className="co-venue-name">{formatDate(showTime)}</p>
                                    <p className="co-venue-loc">{formatTime(showTime)}</p>
                                </div>
                            </div>
                            <div className="co-venue-row">
                                <FiMonitor className="co-venue-icon" />
                                <p className="co-venue-name">Screen {screenNumber}</p>
                            </div>
                        </div>

                        {/* Seat list */}
                        <div className="co-seats-row">
                            <span className="co-seats-label">Seats:</span>
                            <div className="co-seats-list">
                                {[...seats].sort().map(s => (
                                    <span key={s} className="co-seat-chip">{s}</span>
                                ))}
                            </div>
                        </div>

                        <div className="co-divider" />

                        {/* Price breakdown */}
                        <div className="co-price-breakdown">
                            {standardSeats?.length > 0 && (
                                <div className="co-price-row">
                                    <span>Tickets (Standard) × {standardSeats.length}</span>
                                    <span>${(standardSeats.length * (pricing?.standard || 0)).toFixed(2)}</span>
                                </div>
                            )}
                            {premiumSeats?.length > 0 && (
                                <div className="co-price-row">
                                    <span>Tickets (Premium) × {premiumSeats.length}</span>
                                    <span>${(premiumSeats.length * (pricing?.premium || 0)).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="co-price-row co-price-row--fee">
                                <span>Convenience Fee</span>
                                <span>${(fee || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="co-total-row">
                            <span>Total Amount</span>
                            <span className="co-total-amount">${totalAmount.toFixed(2)}</span>
                        </div>

                        {error && (
                            <div className="co-error" role="alert">{error}</div>
                        )}

                        <button
                            id="btn-confirm-booking"
                            className="btn-primary co-confirm-btn"
                            onClick={handleConfirm}
                            disabled={booking}
                        >
                            {booking ? 'Processing…' : '✓ Confirm Booking →'}
                        </button>

                        <div className="co-footer-links">
                            <button className="co-text-link" onClick={() => navigate('/')}>Back to Home</button>
                            <span>·</span>
                            <button className="co-text-link" onClick={() => navigate(-1)}>Change Seats</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
