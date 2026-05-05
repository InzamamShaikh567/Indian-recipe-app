import React from 'react';
import { gsap } from 'gsap';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const buttonRef = React.useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Bouncy click animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    if (onClick) onClick(e);
  };

  const handleMouseEnter = () => {
    if (disabled || loading) return;
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: 'back.out(1.7)',
    });
  };

  const handleMouseLeave = () => {
    if (disabled || loading) return;
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.2,
    });
  };

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  );
};

export default Button;
