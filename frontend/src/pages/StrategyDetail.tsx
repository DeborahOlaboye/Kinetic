// src/pages/StrategyDetail.tsx
import { KineticParticles } from '@/components/KineticParticles';

export function StrategyDetail() {
  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <h1 className="text-4xl font-bold mb-8">Strategy Details</h1>
        <p>Details coming soon...</p>
      </div>
    </div>
  );
}
