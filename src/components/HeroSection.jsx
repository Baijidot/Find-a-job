export default function HeroSection() {
  return (
    <div className="text-center mb-10 animate-fade-in">
      {/* Sparkle Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="hero-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path d="M12 2L14.09 8.26L20 9.27L15.54 13.47L16.82 19.27L12 16.02L7.18 19.27L8.46 13.47L4 9.27L9.91 8.26L12 2Z" fill="url(#hero-sparkle)" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold mb-4">
        <span className="gradient-text">拿个offer</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
        从 Job Description 看清真实的工作内容与要求
      </p>
    </div>
  )
}
