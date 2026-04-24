export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl animate-pulse" />

        {/* Logo box */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top layer */}
            <path
              d="M12 3L21 7.5L12 12L3 7.5Z"
              fill="white"
              style={{
                animation: 'layerPulse 1.5s ease-in-out infinite',
                animationDelay: '0s',
              }}
            />
            {/* Middle layer */}
            <path
              d="M3 12L12 16.5L21 12"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                animation: 'layerPulse 1.5s ease-in-out infinite',
                animationDelay: '0.25s',
              }}
            />
            {/* Bottom layer */}
            <path
              d="M3 16.5L12 21L21 16.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                animation: 'layerPulse 1.5s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes layerPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
