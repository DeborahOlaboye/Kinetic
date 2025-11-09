import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut } from 'lucide-react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 rounded-lg transition-colors text-white"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 bg-[#78B288] hover:bg-[#5A8F69] text-white rounded-lg transition-all">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full text-left px-4 py-3 hover:bg-accent rounded-lg transition-colors flex items-center gap-3"
            >
              <Wallet className="w-5 h-5 text-[#78B288]" />
              <div>
                <div className="font-medium">{connector.name}</div>
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
