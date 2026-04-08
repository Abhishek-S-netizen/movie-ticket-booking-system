import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SeatLayout from '../../components/SeatLayout/SeatLayout';
import { FiMapPin, FiCalendar, FiClock, FiMonitor } from 'react-icons/fi';
import './SeatSelection.css';

const CONVENIENCE_FEE_RATE = 0.05; // 5%

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(d) {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function SeatSelection() {
    const { id: showId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [show, setShow] = useState(null);
    const [seatStatus, setSeatStatus] = useState({ bookedSeats: [], lockedSeats: [] });
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);
    const [error, setError] = useState('');

    // Derive the screen's seatLayout from the show
    const seatLayout = (() => {
        if (!show?.theatreId?.screens) return { rows: 8, cols: 12, premiumRows: [] };
        const screen = show.theatreId.screens.find(s => s.screenNumber === show.screenNumber);
        return screen?.seatLayout || { rows: 8, cols: 12, premiumRows: [] };
    })();

    // Fetch show + seat status
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [showRes, seatRes] = await Promise.all([
                    api.get(`/shows/${showId}`),
                    api.get(`/bookings/shows/${showId}/seats`),
                ]);
                setShow(showRes.data || {});
                setSeatStatus(seatRes.data || { bookedSeats: [], lockedSeats: [] });
            } catch {
                setError('Unable to load show details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [showId]);

    // Periodically refresh seat status every 15s
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const r = await api.get(`/bookings/shows/${showId}/seats`);
                setSeatStatus(r.data || { bookedSeats: [], lockedSeats: [] });
            } catch { }
        }, 15000);
        return () => clearInterval(interval);
    }, [showId]);

    const handleSeatClick = useCallback((seatId) => {
        if (!user) { navigate('/login'); return; }
        setSelectedSeats(prev =>
            prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
        );
    }, [user, navigate]);

    // Determine if a seat is in a premium row
    const isPremiumSeat = (seatId) => {
        const rowIdx = seatId.charCodeAt(0) - 65;
        return (seatLayout.premiumRows || []).includes(rowIdx);
    };

    // Price calc
    const { standardSeats, premiumSeats, subtotal, fee, total } = (() => {
        const std = selectedSeats.filter(s => !isPremiumSeat(s));
        const prm = selectedSeats.filter(s => isPremiumSeat(s));
        const stdPrice = show?.pricing?.standard || 0;
        const prmPrice = show?.pricing?.premium || 0;
        const sub = std.length * stdPrice + prm.length * prmPrice;
        const f = Math.round(sub * CONVENIENCE_FEE_RATE * 100) / 100;
        return { standardSeats: std, premiumSeats: prm, subtotal: sub, fee: f, total: sub + f };
    })();

    const handleProceed = async () => {
        if (!user) { navigate('/login'); return; }
        if (!selectedSeats.length) return;
        setLocking(true);
        setError('');
        try {
            await api.post(`/bookings/shows/${showId}/lock`, { seats: selectedSeats });

            // Store booking context in sessionStorage for Checkout page
            sessionStorage.setItem('checkoutData', JSON.stringify({
                showId,
                seats: selectedSeats,
                totalAmount: total,
                subtotal,
                fee,
                standardSeats,
                premiumSeats,
                pricing: show.pricing,
                movie: {
                    title: show.movieId?.title,
                    posterUrl: show.movieId?.posterUrl,
                },
                theatre: {
                    name: show.theatreId?.name,
                    location: show.theatreId?.location,
                    city: show.theatreId?.city,
                },
                showTime: show.showTime,
                screenNumber: show.screenNumber,
            }));

            navigate('/checkout');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to lock seats. Please try again.');
        } finally {
            setLocking(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '15vh' }}>
            <div className="spinner" />
        </div>
    );

    if (error && !show) return (
        <div className="ss-error">
            <p>{error}</p>
            <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    return (
        <div className="ss-page fade-in">
            {/* Header */}
            <div className="ss-header">
                <div className="container ss-header__inner">
                    <div className="ss-header__movie">
                        <h1 className="ss-movie-title">{show?.movieId?.title}</h1>
                        <div className="ss-show-meta">
                            <span><FiCalendar /> {formatDate(show?.showTime)}</span>
                            <span><FiClock /> {formatTime(show?.showTime)}</span>
                            <span><FiMonitor /> Screen {show?.screenNumber}</span>
                            <span><FiMapPin /> {show?.theatreId?.name}, {show?.theatreId?.city}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container ss-body">
                {/* Seat grid */}
                <div className="ss-main">
                    <SeatLayout
                        layout={seatLayout}
                        bookedSeats={seatStatus?.bookedSeats || []}
                        lockedSeats={seatStatus?.lockedSeats || []}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                    />
                    {error && <p className="ss-inline-error">{error}</p>}
                </div>

                {/* Booking summary */}
                <aside className="ss-summary">
                    <h3 className="ss-summary__title">Booking Summary</h3>

                    <div className="ss-summary__body">
                        {selectedSeats.length === 0 ? (
                            <p className="ss-summary__empty">Select seats to see pricing</p>
                        ) : (
                            <>
                                <div className="ss-summary__seats">
                                    {standardSeats.length > 0 && (
                                        <div className="ss-price-row">
                                            <span>Standard × {standardSeats.length}</span>
                                            <span>${(standardSeats.length * (show?.pricing?.standard || 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {premiumSeats.length > 0 && (
                                        <div className="ss-price-row">
                                            <span>Premium × {premiumSeats.length}</span>
                                            <span>${(premiumSeats.length * (show?.pricing?.premium || 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="ss-price-row ss-price-row--fee">
                                        <span>Convenience Fee (5%)</span>
                                        <span>${fee.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="ss-summary__total">
                                    <span>Total Price</span>
                                    <span className="ss-total-amount">${total.toFixed(2)}</span>
                                </div>

                                <div className="ss-selected-list">
                                    <span className="ss-selected-label">Seats: </span>
                                    {[...selectedSeats].sort().map((s, i) => (
                                        <span key={s} className={`ss-seat-tag ${isPremiumSeat(s) ? 'ss-seat-tag--premium' : ''}`}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        id="btn-proceed-checkout"
                        className="btn-primary ss-proceed-btn"
                        disabled={selectedSeats.length === 0 || locking}
                        onClick={handleProceed}
                    >
                        {locking ? 'Securing seats…' : '🎟 Proceed to Checkout'}
                    </button>

                    {!user && (
                        <p className="ss-login-hint">
                            <button className="ss-login-link" onClick={() => navigate('/login')}>
                                Log in
                            </button> to book seats
                        </p>
                    )}
                </aside>
            </div>
        </div>
    );
}
