import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiX, FiDownload, FiCalendar, FiClock, FiMapPin, FiMonitor } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './TicketModal.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
}
function formatTime(d) {
    return new Date(d).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

export default function TicketModal({ booking, onClose }) {
    const ticketRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    if (!booking) return null;

    const show = booking.showId;
    const movie = show?.movieId;
    const theatre = show?.theatreId;

    const handleDownloadPDF = async () => {
        if (!ticketRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: '#12121e',
                scale: 2,
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`ticket-${booking._id.slice(-8).toUpperCase()}.pdf`);
        } catch (e) {
            console.error('PDF generation failed:', e);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="tm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Ticket Modal">
            <div className="tm-wrapper" onClick={(e) => e.stopPropagation()}>

                {/* Ticket (captured for PDF) */}
                <div className="tm-ticket" ref={ticketRef}>

                    {/* ── Main Section ── */}
                    <div className="tm-main">
                        {/* Poster */}
                        <div className="tm-poster-wrap">
                            {movie?.posterUrl
                                ? <img src={movie.posterUrl} alt={movie?.title} className="tm-poster" crossOrigin="anonymous" />
                                : <div className="tm-poster tm-poster--placeholder">🎬</div>
                            }
                        </div>

                        {/* Details */}
                        <div className="tm-details">
                            <div className="tm-brand">CINEMAX</div>
                            <h2 className="tm-movie-title">{movie?.title || 'Unknown Movie'}</h2>

                            <div className="tm-info-grid">
                                <div className="tm-info-item">
                                    <FiCalendar className="tm-info-icon" />
                                    <div>
                                        <span className="tm-info-label">Date</span>
                                        <span className="tm-info-value">{show?.showTime ? formatDate(show.showTime) : '—'}</span>
                                    </div>
                                </div>
                                <div className="tm-info-item">
                                    <FiClock className="tm-info-icon" />
                                    <div>
                                        <span className="tm-info-label">Time</span>
                                        <span className="tm-info-value">{show?.showTime ? formatTime(show.showTime) : '—'}</span>
                                    </div>
                                </div>
                                <div className="tm-info-item">
                                    <FiMapPin className="tm-info-icon" />
                                    <div>
                                        <span className="tm-info-label">Theatre</span>
                                        <span className="tm-info-value">{theatre?.name || '—'}{theatre?.city ? `, ${theatre.city}` : ''}</span>
                                    </div>
                                </div>
                                <div className="tm-info-item">
                                    <FiMonitor className="tm-info-icon" />
                                    <div>
                                        <span className="tm-info-label">Screen</span>
                                        <span className="tm-info-value">Screen {show?.screenNumber || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seats */}
                            <div className="tm-seats-section">
                                <span className="tm-seats-label">SEATS</span>
                                <div className="tm-seats-list">
                                    {[...booking.seats].sort().map(s => (
                                        <span key={s} className="tm-seat-chip">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Perforated Divider ── */}
                    <div className="tm-perforation">
                        <div className="tm-perf-circle tm-perf-circle--top" />
                        <div className="tm-perf-line" />
                        <div className="tm-perf-circle tm-perf-circle--bottom" />
                    </div>

                    {/* ── Stub Section ── */}
                    <div className="tm-stub">
                        <div className="tm-qr-wrap">
                            <QRCodeSVG
                                value={booking._id}
                                size={100}
                                bgColor="#ffffff"
                                fgColor="#12121e"
                                level="M"
                            />
                            <span className="tm-qr-caption">Scan to verify</span>
                        </div>

                        <div className="tm-stub-details">
                            <div className="tm-stub-row">
                                <span className="tm-stub-label">Booking ID</span>
                                <span className="tm-stub-value tm-mono">{booking._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="tm-stub-row">
                                <span className="tm-stub-label">Amount Paid</span>
                                <span className="tm-stub-value tm-price">${booking.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="tm-stub-row">
                                <span className="tm-stub-label">Payment</span>
                                <span className="tm-stub-value tm-status">{booking.paymentStatus}</span>
                            </div>
                            <div className="tm-stub-row">
                                <span className="tm-stub-label">Status</span>
                                <span className={`tm-stub-value tm-booking-status tm-booking-status--${booking.bookingStatus?.toLowerCase()}`}>
                                    {booking.bookingStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Action Buttons (outside captured area) ── */}
                <div className="tm-actions">
                    <button className="tm-close-btn" onClick={onClose} aria-label="Close ticket">
                        <FiX /> Close
                    </button>
                    <button
                        className="tm-download-btn"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        aria-label="Download ticket as PDF"
                    >
                        <FiDownload /> {downloading ? 'Generating…' : 'Download PDF'}
                    </button>
                </div>

            </div>
        </div>
    );
}
