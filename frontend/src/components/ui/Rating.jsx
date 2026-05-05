import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { gsap } from 'gsap';
import './Rating.css';

const Rating = ({
  value = 0,
  max = 5,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = React.useState(0);
  const [animatedValue, setAnimatedValue] = React.useState(0);
  const starsRef = React.useRef([]);

  React.useEffect(() => {
    // Animate rating value on mount
    gsap.to(
      { value: animatedValue },
      {
        value: value,
        duration: 1,
        ease: 'power2.out',
        onUpdate: function () {
          setAnimatedValue(this.targets()[0].value);
        },
      }
    );
  }, [value]);

  const handleMouseEnter = (index) => {
    if (readonly) return;
    setHoverValue(index + 1);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverValue(0);
  };

  const handleClick = (index) => {
    if (readonly || !onChange) return;
    onChange(index + 1);

    // Bouncy animation on click
    gsap.to(starsRef.current[index], {
      scale: 1.5,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });
  };

  const displayValue = hoverValue || animatedValue;

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = starValue <= Math.floor(displayValue);
    const isHalf = !isFilled && starValue <= displayValue;
    const isEmpty = !isFilled && !isHalf;

    let Icon = FaStar;
    let className = 'rating-star';

    if (isHalf) {
      Icon = FaStarHalfAlt;
      className += ' rating-star-half';
    } else if (isEmpty) {
      className += ' rating-star-empty';
    }

    return (
      <button
        key={index}
        ref={(el) => (starsRef.current[index] = el)}
        type="button"
        className={className}
        disabled={readonly}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
        aria-label={`Rate ${starValue} stars`}
      >
        <Icon />
      </button>
    );
  };

  const sizeClasses = {
    sm: 'rating-sm',
    md: 'rating-md',
    lg: 'rating-lg',
  };

  return (
    <div className={`rating ${sizeClasses[size]} ${className}`}>
      <div className="rating-stars">
        {Array.from({ length: max }).map((_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className="rating-value">
          {displayValue.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
};

export default Rating;
