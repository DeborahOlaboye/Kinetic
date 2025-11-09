import { useEffect, useState } from 'react';

interface ShootingStar {
  id: number;
  startX: number; // 0-100 (percentage from left)
  startY: number; // 0-50 (percentage from top - only upper half)
  angle: number; // degrees for trajectory
  duration: number; // animation duration in seconds
  delay: number; // delay before starting
  size: number; // length of the trail
  color: string; // color gradient for the star
  shadow: string; // glow color
}

// Color palettes for shooting stars
const starColors = [
  {
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, rgba(120, 178, 136, 0.6) 100%)',
    shadow: '0 0 6px rgba(120, 178, 136, 0.8), 0 0 12px rgba(120, 178, 136, 0.4)',
  },
  {
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, rgba(0, 172, 193, 0.6) 100%)',
    shadow: '0 0 6px rgba(0, 172, 193, 0.8), 0 0 12px rgba(0, 172, 193, 0.4)',
  },
  {
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 152, 0, 0.6) 100%)',
    shadow: '0 0 6px rgba(255, 152, 0, 0.8), 0 0 12px rgba(255, 152, 0, 0.4)',
  },
  {
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, rgba(176, 176, 221, 0.7) 100%)',
    shadow: '0 0 6px rgba(176, 176, 221, 0.8), 0 0 12px rgba(176, 176, 221, 0.4)',
  },
  {
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, rgba(185, 174, 165, 0.6) 100%)',
    shadow: '0 0 6px rgba(185, 174, 165, 0.8), 0 0 12px rgba(185, 174, 165, 0.4)',
  },
];

export function ShootingStars() {
  const [stars, setStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    // Function to create a new shooting star
    const createStar = () => {
      const colorScheme = starColors[Math.floor(Math.random() * starColors.length)];

      // Randomly pick direction: 0 = top-right to bottom-left, 1 = top-left to bottom-right
      const direction = Math.random() > 0.5 ? 1 : -1;

      // For variety, also randomize if it goes more horizontal or more vertical
      const angleVariation = Math.random() * 40 + 20; // 20-60 degrees

      const newStar: ShootingStar = {
        id: Date.now() + Math.random(),
        startX: direction > 0 ? Math.random() * 50 : Math.random() * 50 + 50, // Start from left half or right half
        startY: Math.random() * 40, // Start from upper portion (0-40%)
        angle: direction > 0 ? angleVariation : -angleVariation, // Positive or negative angle
        duration: Math.random() * 0.5 + 0.8, // 0.8-1.3 seconds (fast)
        delay: 0,
        size: Math.random() * 40 + 60, // 60-100px trail length
        color: colorScheme.gradient,
        shadow: colorScheme.shadow,
      };

      setStars(prev => [...prev, newStar]);

      // Remove star after animation completes
      setTimeout(() => {
        setStars(prev => prev.filter(star => star.id !== newStar.id));
      }, (newStar.duration + newStar.delay) * 1000 + 100);
    };

    // Create shooting stars at random intervals (every 2-4.5 seconds)
    const scheduleNextStar = () => {
      const delay = Math.random() * 2500 + 2000; // 2-4.5 seconds
      return setTimeout(() => {
        createStar();
        scheduleNextStar();
      }, delay);
    };

    const timeout = scheduleNextStar();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-shooting-star"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: `${star.size}px`,
            height: '2px',
            transform: `rotate(${star.angle}deg)`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        >
          {/* Gradient trail from bright to transparent */}
          <div
            className="w-full h-full"
            style={{
              background: star.color,
              boxShadow: star.shadow,
              borderRadius: '50%',
            }}
          />
        </div>
      ))}
    </div>
  );
}
