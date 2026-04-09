import React from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContent';
import { FiX, FiInfo, FiAlertCircle, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import './FeedbackOverlay.css';

export default function FeedbackOverlay() {
    const { alerts, confirm } = useUIFeedback();

    return (
        <>
            {/* Toast Notifications */}
            <div className="toast-container">
                {alerts.map(alert => (
                    <div key={alert.id} className={`toast toast--${alert.type} fade-in-right`}>
                        <div className="toast__icon">
                            {alert.type === 'error' && <FiAlertCircle />}
                            {alert.type === 'success' && <FiCheckCircle />}
                            {alert.type === 'warning' && <FiAlertCircle />}
                            {alert.type === 'info' && <FiInfo />}
                        </div>
                        <div className="toast__message">{alert.message}</div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirm && (
                <div className="modal-overlay fade-in">
                    <div className="confirm-modal scale-in">
                        <div className="confirm-modal__header">
                            <FiHelpCircle className="confirm-modal__icon" />
                            <h3>{confirm.title}</h3>
                        </div>
                        <p className="confirm-modal__message">{confirm.message}</p>
                        <div className="confirm-modal__actions">
                            {confirm.cancelText && (
                                <button
                                    className="btn-ghost"
                                    onClick={confirm.onCancel}
                                >
                                    {confirm.cancelText}
                                </button>
                            )}
                            <button
                                className="btn-primary"
                                onClick={confirm.onConfirm}
                            >
                                {confirm.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
