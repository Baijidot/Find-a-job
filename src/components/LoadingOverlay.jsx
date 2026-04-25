export default function LoadingOverlay({ step }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="loading-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M12 2L14.09 8.26L20 9.27L15.54 13.47L16.82 19.27L12 16.02L7.18 19.27L8.46 13.47L4 9.27L9.91 8.26L12 2Z" fill="url(#loading-sparkle)" className="animate-pulse" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">正在分析中...</h3>
        <p className="text-sm text-slate-400 animate-pulse">{step}</p>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            step.includes('解析') ? 'bg-indigo-500 scale-125' : 'bg-slate-700'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            step.includes('技能') ? 'bg-pink-500 scale-125' : 'bg-slate-700'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            step.includes('计划') ? 'bg-emerald-500 scale-125' : 'bg-slate-700'
          }`} />
        </div>
      </div>
    </div>
  )
}
