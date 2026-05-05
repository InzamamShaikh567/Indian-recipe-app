import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Page transition animations
export const pageTransition = {
  in: (element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  },
  out: (element, callback) => {
    gsap.to(element, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: callback,
    });
  },
};

// Card animations
export const cardAnimation = {
  stagger: (elements, delay = 0.1) => {
    gsap.fromTo(
      elements,
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
        stagger: delay,
        ease: 'back.out(1.7)',
      }
    );
  },
};

// Button animations
export const buttonAnimation = {
  hover: (element) => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.2,
      ease: 'back.out(1.7)',
    });
  },
  click: (element) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });
  },
};

// Heart animation for favorites
export const heartAnimation = (element) => {
  const tl = gsap.timeline();

  tl.to(element, {
    scale: 1.3,
    duration: 0.15,
    ease: 'power2.out',
  })
    .to(element, {
      scale: 0.9,
      duration: 0.1,
      ease: 'power2.in',
    })
    .to(element, {
      scale: 1,
      duration: 0.1,
      ease: 'power2.out',
    });
};

// Star animation for ratings
export const starAnimation = (element) => {
  gsap.to(element, {
    scale: 1.5,
    rotation: 15,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: 'power2.out',
  });
};

// Scroll animations
export const scrollAnimation = (element) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 100,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom-=100',
        toggleActions: 'play none none reverse',
      },
    }
  );
};

// Text reveal animation
export const textReveal = (element, delay = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: 'power2.out',
    }
  );
};

// Image parallax effect
export const imageParallax = (element) => {
  gsap.to(element, {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
};

// Floating animation
export const floatingAnimation = (element, duration = 3) => {
  gsap.to(element, {
    y: -10,
    duration,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

// Pulse animation
export const pulseAnimation = (element, duration = 2) => {
  gsap.to(element, {
    scale: 1.05,
    duration: duration / 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

// Shake animation for errors
export const shakeAnimation = (element) => {
  gsap.to(element, {
    x: [-10, 10, -10, 10, -5, 5, 0],
    duration: 0.5,
    ease: 'power2.inOut',
  });
};

// Success checkmark animation
export const successAnimation = (element) => {
  const tl = gsap.timeline();

  tl.fromTo(
    element,
    { scale: 0, rotation: -180 },
    { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
  );
};

// Loading spinner animation
export const loadingAnimation = (element) => {
  gsap.to(element, {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: 'none',
  });
};

// Fade in up animation
export const fadeInUp = (element, delay = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay,
      ease: 'power2.out',
    }
  );
};

// Scale in animation
export const scaleIn = (element, delay = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.8,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      delay,
      ease: 'back.out(1.7)',
    }
  );
};

// Slide in from left
export const slideInLeft = (element, delay = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -50,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay,
      ease: 'power2.out',
    }
  );
};

// Slide in from right
export const slideInRight = (element, delay = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: 50,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay,
      ease: 'power2.out',
    }
  );
};

// Bounce in animation
export const bounceIn = (element, delay = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.3,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay,
      ease: 'elastic.out(1, 0.5)',
    }
  );
};

// Clean up all ScrollTrigger instances
export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

export default {
  pageTransition,
  cardAnimation,
  buttonAnimation,
  heartAnimation,
  starAnimation,
  scrollAnimation,
  textReveal,
  imageParallax,
  floatingAnimation,
  pulseAnimation,
  shakeAnimation,
  successAnimation,
  loadingAnimation,
  fadeInUp,
  scaleIn,
  slideInLeft,
  slideInRight,
  bounceIn,
  cleanupScrollTriggers,
};
