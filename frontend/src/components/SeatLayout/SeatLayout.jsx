import React from 'react';
import { FiCheck } from 'react-icons/fi';
import './SeatLayout.css';

export default function SeatLayout({
    layout = {},
    bookedSeats = [],
    lockedSeats = [],
    selectedSeats = [],
    onSeatClick,
}) {
    const { rows, cols, premiumRows = [] } = layout;

    // Generate an array of row identifiers (A, B, C...)
    // Assuming a max of 26 rows. For more, logic would need AA, AB, etc.
    const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));
    const colLabels = Array.from({ length: cols }, (_, i) => i + 1);

    return (
        <div className="sl-container fade-in">
            {/* The Screen */}
            <div className="sl-screen-wrap">
                <div className="sl-screen-arch" />
                <p className="sl-screen-text">SCREEN</p>
            </div>

            {/* Seat Grid */}
            <div className="sl-grid-wrap">
                <div className="sl-grid" style={{ '--cols': cols }}>
                    {rowLabels.map((rowLabel, rIdx) => {
                        const isPremium = premiumRows.includes(rIdx);

                        return (
                            <React.Fragment key={rowLabel}>
                                {/* Row Label (Left) */}
                                <span className="sl-row-label">{rowLabel}</span>

                                {/* Seats */}
                                <div className="sl-seat-row">
                                    {colLabels.map((colVal) => {
                                        const seatId = `${rowLabel}${colVal}`;
                                        const isBooked = bookedSeats.includes(seatId);
                                        const isLocked = lockedSeats.includes(seatId);
                                        const isUnavailable = isBooked || isLocked;
                                        const isSelected = selectedSeats.includes(seatId);

                                        let seatStatusClass = 'sl-seat--available';
                                        if (isUnavailable) seatStatusClass = 'sl-seat--unavailable';
                                        else if (isSelected) seatStatusClass = 'sl-seat--selected';

                                        const premiumClass = isPremium ? 'sl-seat--premium' : '';

                                        return (
                                            <button
                                                key={seatId}
                                                id={`seat-${seatId}`}
                                                disabled={isUnavailable}
                                                aria-label={`Seat ${seatId} ${isUnavailable ? 'unavailable' : 'available'}`}
                                                className={`sl-seat ${seatStatusClass} ${premiumClass}`}
                                                onClick={() => onSeatClick(seatId)}
                                                title={`${seatId}${isPremium ? ' (Premium)' : ''}`}
                                            >
                                                {isSelected && <FiCheck className="sl-seat-tick" title="Selected" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Row Label (Right) */}
                                <span className="sl-row-label">{rowLabel}</span>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="sl-legend">
                <div className="sl-legend-item">
                    <div className="sl-seat sl-seat--available" />
                    <span>Available</span>
                </div>
                <div className="sl-legend-item">
                    <div className="sl-seat sl-seat--selected">
                        <FiCheck className="sl-seat-tick" />
                    </div>
                    <span>Selected</span>
                </div>
                <div className="sl-legend-item">
                    <div className="sl-seat sl-seat--unavailable" />
                    <span>Booked</span>
                </div>
                <div className="sl-legend-item">
                    <div className="sl-seat sl-seat--available sl-seat--premium" />
                    <span>VIP Premium</span>
                </div>
            </div>
        </div>
    );
}
