import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareButtonProps {
  totalYield?: bigint;
  recipientCount?: number;
}

export function ShareButton({ totalYield, recipientCount = 0 }: ShareButtonProps) {
  const yieldValue = totalYield ? (Number(totalYield) / 1e18).toFixed(4) : '0';

  const shareText = `I'm funding public goods with ImpactVault! 🌟\n\n💰 $${yieldValue} yield generated\n🎯 ${recipientCount} projects supported\n\nMy DeFi yield is making a real-world impact. Join me in supporting public goods! #ImpactVault #PublicGoods #DeFi`;

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareFarcaster = () => {
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    toast.success('Impact message copied to clipboard!');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          Share Your Impact 📢
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleShareTwitter}>
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFarcaster}>
          Share on Farcaster
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyText}>
          Copy Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
