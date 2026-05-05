import React from 'react';
import { gsap } from 'gsap';
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoClose } from 'react-icons/io5';
import './Toast.css';

const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'bottom-right',
  className = '',
}) => {
  const toastRef = React.useRef(null);

  React.useEffect(() => {
    if (!toastRef.current) return;

    // Animate in
    gsap.fromTo(
      toastRef.current,
      {
        x: position.includes('right') ? 100 : -100,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }
    );

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, position]);

  const handleClose = () => {
    if (!toastRef.current) return;

    gsap.to(toastRef.current, {
      x: position.includes('right') ? 100 : -100,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const icons = {
    success: <IoCheckmarkCircle />,
    error: <IoWarning />,
    warning: <IoWarning />,
    info: <IoInformationCircle />,
  };

  const positionClasses = {
    'top-left': 'toast-top-left',
    'top-right': 'toast-top-right',
    'top-center': 'toast-top-center',
    'bottom-left': 'toast-bottom-left',
    'bottom-right': 'toast-bottom-right',
    'bottom-center': 'toast-bottom-center',
  };

  return (
    <div
      ref={toastRef}
      className={`toast toast-${type} ${positionClasses[position]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button
        type="button"
        className="toast-close"
        onClick={handleClose}
        aria-label="Close toast"
      >
        <IoClose />
      </button>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = ({ toasts, position = 'bottom-right' }) => {
  return (
    <div className={`toast-container toast-container-${position}`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} position={position} />
      ))}
    </div>
  );
};

export default Toast;
