import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut } from 'lucide-react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-lg transition-all">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3"
            >
              <Wallet className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-medium">{connector.name}</div>
                <div className="text-xs text-gray-500">
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
