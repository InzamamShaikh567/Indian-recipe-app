import React from 'react';
import { gsap } from 'gsap';
import './Card.css';

const Card = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  onClick,
  ...props
}) => {
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    if (!cardRef.current) return;

    // Entrance animation - only happens once
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: delay,
        ease: 'back.out(1.7)',
      }
    );

    return () => {
      gsap.killTweensOf(cardRef.current);
    };
  }, [delay]);

  const handleMouseEnter = () => {
    if (!hover) return;
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!hover) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={cardRef}
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
