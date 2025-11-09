import { MorphoDashboard } from '@/components/MorphoDashboard';
import { KineticParticles } from '@/components/KineticParticles';
import { ShootingStars } from '@/components/ShootingStars';

/**
 * Morpho Vaults V2 Page
 *
 * View and manage Morpho adapter allocations, harvest yield, and track public goods funding
 */
export function MorphoVault() {
  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />
      {/* Shooting Stars */}
      <ShootingStars />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Morpho Vaults V2</h1>
            <p className="text-muted-foreground">
              Track your Morpho adapter allocations and harvest yield for public goods
            </p>
          </div>

          <MorphoDashboard />
        </div>
      </div>
    </div>
  );
}
