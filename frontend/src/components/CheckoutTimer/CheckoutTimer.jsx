import React, { useState, useEffect } from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import './CheckoutTimer.css';

/**
 * Reusable timer component for seat locks
 * @param {string|Date} expiryTimestamp - When the lock expires
 * @param {function} onExpire - Callback when time hits zero
 */
const CheckoutTimer = ({ expiryTimestamp, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!expiryTimestamp) return;

        const calculateTimeLeft = () => {
            const difference = new Date(expiryTimestamp) - new Date();
            if (difference <= 0) {
                return 0;
            }
            return Math.floor(difference / 1000); // return seconds
        };

        // Initial calculation
        const initialTime = calculateTimeLeft();
        setTimeLeft(initialTime);

        // If already expired
        if (initialTime === 0 && onExpire) {
            onExpire();
            return;
        }

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTimestamp, onExpire]);

    if (timeLeft === null || timeLeft <= 0) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Visual urgency: Red text if less than 60 seconds
    const isUrgent = timeLeft < 60;

    return (
        <div className={`checkout-timer ${isUrgent ? 'timer-urgent' : ''}`}>
            <div className="timer-content">
                <FiClock className="timer-icon" />
                <span className="timer-label">Seats held for</span>
                <span className="timer-countdown">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
            </div>
            {isUrgent && (
                <div className="timer-warning">
                    <FiAlertCircle /> Final minute! Complete your booking now.
                </div>
            )}
        </div>
    );
};

export default CheckoutTimer;
