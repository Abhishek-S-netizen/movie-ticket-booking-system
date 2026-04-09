import React, { createContext, useContext, useState, useCallback } from 'react';

const UIFeedbackContext = createContext(null);

export function UIFeedbackProvider({ children }) {
    const [alerts, setAlerts] = useState([]);
    const [confirm, setConfirm] = useState(null);

    /**
     * Show a temporary toast alert
     * @param {string} message 
     * @param {string} type - 'info' | 'success' | 'error' | 'warning'
     */
    const showAlert = useCallback((message, type = 'info') => {
        const id = Date.now();
        setAlerts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }, 4000);
    }, []);

    /**
     * Show a confirmation modal
     * @param {Object} options - { title, message, onConfirm, onCancel }
     */
    const showConfirm = useCallback((options) => {
        const { title, message, onConfirm, onCancel, confirmText, cancelText } = options;

        return new Promise((resolve) => {
            setConfirm({
                title: title || 'Are you sure?',
                message: message || '',
                confirmText: confirmText || 'Confirm',
                cancelText: cancelText || 'Cancel',
                onConfirm: () => {
                    setConfirm(null);
                    if (onConfirm) onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    setConfirm(null);
                    if (onCancel) onCancel();
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <UIFeedbackContext.Provider value={{ showAlert, showConfirm, alerts, confirm }}>
            {children}
        </UIFeedbackContext.Provider>
    );
}

export function useUIFeedback() {
    const context = useContext(UIFeedbackContext);
    if (!context) {
        throw new Error('useUIFeedback must be used within a UIFeedbackProvider');
    }
    return context;
}
