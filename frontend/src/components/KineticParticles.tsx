import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number; // 0-100 (percentage)
  startY: number; // 0-100 (percentage) - initial vertical position
  size: number; // 2-3.5px
  duration: number; // 20-30s
  delay: number; // random delay
  opacity: number; // 0.35-0.6
  pulseSpeed: number; // 2-4s for size animation
}

export function KineticParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 80-100 particles with random properties
    const particleCount = Math.floor(Math.random() * 21) + 80; // 80-100
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100, // Random horizontal position
        startY: Math.random() * 120, // 0-120% (some start above viewport for continuous flow)
        size: Math.random() * 1.5 + 2, // 2-3.5px
        duration: Math.random() * 10 + 20, // 20-30s
        delay: 0, // No delay - start immediately
        opacity: Math.random() * 0.25 + 0.35, // 0.35-0.6 (more visible)
        pulseSpeed: Math.random() * 2 + 2, // 2-4s pulse cycle
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-drift"
          style={{
            left: `${particle.left}%`,
            bottom: `${particle.startY}%`, // Start at random position (0-120%)
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: '0s', // Start immediately
          }}
        >
          <div
            className="w-full h-full bg-white rounded-full animate-pulse-scale"
            style={{
              animationDuration: `${particle.pulseSpeed}s`,
              animationDelay: '0s', // Start pulsing immediately
            }}
          />
        </div>
      ))}
    </div>
  );
}
