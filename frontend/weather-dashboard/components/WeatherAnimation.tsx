'use client'

import { motion } from 'framer-motion'

interface WeatherAnimationProps {
  condition: string
  temperature: number
  humidity: number
}

export default function WeatherAnimation({ condition, temperature, humidity }: WeatherAnimationProps) {
  const isSunny = condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sunny')
  const isRainy = condition.toLowerCase().includes('rain')
  const isSnow = condition.toLowerCase().includes('snow')
  const isStormy = condition.toLowerCase().includes('thunder') || condition.toLowerCase().includes('storm')
  const isCloudy = condition.toLowerCase().includes('cloud')

  // Cloud animation variants
  const cloudVariants = {
    animate: {
      x: [0, 30, 0],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
  }

  const cloudVariants2 = {
    animate: {
      x: [30, 0, 30],
      transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
    },
  }

  // Sun animation variants
  const sunVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: 'linear' },
    },
  }

  const sunGlowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  }

  // Rain drop animation
  const rainDropVariants = {
    animate: {
      y: [0, 100],
      opacity: [1, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeIn' },
    },
  }

  // Snow animation
  const snowVariants = {
    animate: {
      y: [0, 150],
      x: [0, 20, -20, 0],
      opacity: [0, 1, 1, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeIn' },
    },
  }

  // Lightning animation
  const lightningVariants = {
    animate: {
      opacity: [0, 1, 0],
      transition: { duration: 0.2, repeat: Infinity, repeatDelay: 3 },
    },
  }

  return (
    <div className="w-full h-96 relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/50 to-slate-950 border border-cyan-500/20">
      {/* Sky gradient background */}
      <motion.div
        className={`absolute inset-0 ${
          isSunny
            ? 'bg-gradient-to-b from-cyan-900/40 via-blue-900/30 to-slate-900'
            : isRainy
              ? 'bg-gradient-to-b from-slate-800/60 via-slate-900/50 to-slate-950'
              : isStormy
                ? 'bg-gradient-to-b from-purple-900/60 via-slate-900/50 to-slate-950'
                : isSnow
                  ? 'bg-gradient-to-b from-cyan-900/40 via-slate-900/40 to-slate-950'
                  : 'bg-gradient-to-b from-slate-800/50 via-slate-900/50 to-slate-950'
        }`}
      />

      {/* Glow effect */}
      {isSunny && (
        <motion.div
          variants={sunGlowVariants}
          animate="animate"
          className="absolute top-20 right-20 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl"
        />
      )}

      {/* SUN ANIMATION */}
      {isSunny && (
        <motion.div
          className="absolute top-16 right-16 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Sun rays */}
          <motion.svg
            variants={sunVariants}
            animate="animate"
            className="w-32 h-32 text-yellow-400"
            viewBox="0 0 100 100"
          >
            {/* Outer rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="50"
                y1="10"
                x2="50"
                y2="0"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
                opacity="0.8"
              />
            ))}
          </motion.svg>

          {/* Main sun circle */}
          <motion.div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl shadow-yellow-500/50"
            />
          </motion.div>
        </motion.div>
      )}

      {/* CLOUDS ANIMATION */}
      {(isCloudy || isRainy || isStormy || !isSunny) && (
        <>
          {/* Main cloud 1 */}
          <motion.div
            variants={cloudVariants}
            animate="animate"
            className="absolute top-12 left-10 z-20"
          >
            <svg className="w-40 h-24 text-slate-300" viewBox="0 0 200 120">
              <defs>
                <linearGradient id="cloudGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {/* Cloud puffs */}
              <circle cx="40" cy="60" r="35" fill="url(#cloudGradient1)" />
              <circle cx="80" cy="40" r="45" fill="url(#cloudGradient1)" />
              <circle cx="130" cy="50" r="38" fill="url(#cloudGradient1)" />
              <circle cx="160" cy="70" r="30" fill="url(#cloudGradient1)" />
              {/* Cloud base */}
              <rect x="30" y="70" width="140" height="35" rx="15" fill="url(#cloudGradient1)" />
            </svg>
          </motion.div>

          {/* Cloud 2 */}
          <motion.div
            variants={cloudVariants2}
            animate="animate"
            className="absolute top-32 right-20 z-15"
          >
            <svg className="w-36 h-20 text-slate-400" viewBox="0 0 180 100">
              <defs>
                <linearGradient id="cloudGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d1d5db" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <circle cx="35" cy="50" r="30" fill="url(#cloudGradient2)" />
              <circle cx="70" cy="35" r="40" fill="url(#cloudGradient2)" />
              <circle cx="115" cy="45" r="33" fill="url(#cloudGradient2)" />
              <circle cx="145" cy="60" r="25" fill="url(#cloudGradient2)" />
              <rect x="25" y="60" width="130" height="30" rx="12" fill="url(#cloudGradient2)" />
            </svg>
          </motion.div>

          {/* Dark storm cloud if stormy */}
          {isStormy && (
            <motion.div
              className="absolute top-20 left-1/3 z-25"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <svg className="w-44 h-28 text-slate-700" viewBox="0 0 220 140">
                <defs>
                  <linearGradient id="stormCloud" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="70" r="40" fill="url(#stormCloud)" />
                <circle cx="100" cy="40" r="55" fill="url(#stormCloud)" />
                <circle cx="160" cy="55" r="45" fill="url(#stormCloud)" />
                <circle cx="200" cy="80" r="32" fill="url(#stormCloud)" />
                <rect x="30" y="80" width="170" height="45" rx="18" fill="url(#stormCloud)" />
              </svg>
            </motion.div>
          )}
        </>
      )}

      {/* RAIN ANIMATION */}
      {isRainy && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              variants={rainDropVariants}
              animate="animate"
              className="absolute w-1 h-6 bg-gradient-to-b from-cyan-300 to-cyan-500/50 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40 - 20}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* SNOW ANIMATION */}
      {isSnow && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              variants={snowVariants}
              animate="animate"
              className="absolute w-3 h-3 bg-white rounded-full opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40 - 40}%`,
                animationDelay: `${i * 0.5}s`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
      )}

      {/* LIGHTNING ANIMATION */}
      {isStormy && (
        <>
          <motion.div
            variants={lightningVariants}
            animate="animate"
            className="absolute inset-0 bg-white/20 z-30"
            style={{ animationDelay: '0s' }}
          />
          <motion.svg
            variants={lightningVariants}
            animate="animate"
            className="absolute top-10 right-20 w-24 h-48 text-yellow-300 z-30"
            viewBox="0 0 40 120"
            style={{ animationDelay: '0s' }}
          >
            <polygon
              points="20,0 24,50 40,50 20,120 16,70 0,70"
              fill="currentColor"
              opacity="0.8"
            />
          </motion.svg>
        </>
      )}

      {/* TEMPERATURE AND INFO OVERLAY */}
      <div className="absolute bottom-6 left-6 z-40">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-950/70 backdrop-blur-md rounded-lg px-4 py-3 border border-cyan-500/30"
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-pixel text-cyan-400">{temperature}°</p>
              <p className="text-xs text-slate-400 capitalize">{condition}</p>
            </div>
            <div className="border-l border-cyan-500/30 pl-4">
              <p className="text-xs text-slate-400">Humidity</p>
              <p className="text-lg font-semibold text-cyan-300">{humidity}%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
