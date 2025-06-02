import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [visible, setVisible] = useState(false);
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  }, []);
  const hideToast = () => setVisible(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </ToastContext.Provider>
  );
}
