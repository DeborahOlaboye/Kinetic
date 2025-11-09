import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut } from 'lucide-react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-secondary/80 rounded-full border border-border">
          <span className="text-sm text-foreground font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-5 py-2.5 bg-destructive hover:bg-destructive/90 rounded-full transition-all duration-300 text-white font-medium hover:scale-105"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-6 py-2.5 bg-[#78B288] hover:bg-[#5A8F69] text-white rounded-full transition-all duration-300 font-medium hover:scale-105 shadow-lg hover:shadow-xl">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
        <div className="p-3">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full text-left px-4 py-3 hover:bg-accent rounded-xl transition-all duration-200 flex items-center gap-3 hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-full bg-[#78B288]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#78B288]" />
              </div>
              <div>
                <div className="font-medium text-foreground">{connector.name}</div>
                <div className="text-xs text-muted-foreground">
                  {connector.type === 'injected' ? 'Browser wallet' : 'WalletConnect'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
