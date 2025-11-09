import { AaveVaultDashboard } from '@/components/AaveVaultDashboard';
import { KineticParticles } from '@/components/KineticParticles';
import { ShootingStars } from '@/components/ShootingStars';

export function AaveVault() {
  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />
      {/* Shooting Stars */}
      <ShootingStars />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Aave Vault</h1>
            <p className="text-muted-foreground">
              Manage your Aave ERC-4626 vault and distribute yield to public goods
            </p>
          </div>

          <AaveVaultDashboard />
        </div>
      </div>
    </div>
  );
}
