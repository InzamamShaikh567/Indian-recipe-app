import React from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaUtensils, FaFire, FaHeart } from 'react-icons/fa';
import Button from '../ui/Button';
import './Hero.css';

const Hero = () => {
  const heroRef = React.useRef(null);
  const titleRef = React.useRef(null);
  const subtitleRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  const statsRef = React.useRef(null);

  React.useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      heroRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    )
      .fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.3'
      )
      .fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.5'
      )
      .fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.4'
      )
      .fromTo(
        statsRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
        '-=0.3'
      );
  }, []);

  return (
    <div ref={heroRef} className="hero">
      <div className="hero-content">
        <h1 ref={titleRef} className="hero-title">
          Discover the Art of
          <span className="hero-highlight"> Indian Cooking</span>
        </h1>
        <p ref={subtitleRef} className="hero-subtitle">
          Explore authentic recipes passed down through generations. From aromatic curries to delightful sweets, bring the flavors of India to your kitchen.
        </p>
        <div ref={ctaRef} className="hero-cta">
          <Link to="/add-recipe">
            <Button size="lg" className="hero-btn">
              <FaUtensils />
              Share your own Recipe
            </Button>
          </Link>
          <Link to="/favorites">
            <Button variant="outline" size="lg" className="hero-btn">
              <FaHeart />
              My Favorites
            </Button>
          </Link>
        </div>
        <div ref={statsRef} className="hero-stats">
          <div className="hero-stat">
            <FaFire className="hero-stat-icon" />
            <div className="hero-stat-content">
              <span className="hero-stat-value">500+</span>
              <span className="hero-stat-label">Recipes</span>
            </div>
          </div>
          <div className="hero-stat">
            <FaHeart className="hero-stat-icon" />
            <div className="hero-stat-content">
              <span className="hero-stat-value">10K+</span>
              <span className="hero-stat-label">Food Lovers</span>
            </div>
          </div>
          <div className="hero-stat">
            <FaUtensils className="hero-stat-icon" />
            <div className="hero-stat-content">
              <span className="hero-stat-value">6</span>
              <span className="hero-stat-label">Categories</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-background">
        <div className="hero-pattern" />
        <div className="hero-gradient" />
      </div>
    </div>
  );
};

export default Hero;
