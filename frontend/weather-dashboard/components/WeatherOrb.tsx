'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Wind, Droplets } from 'lucide-react'

interface WeatherOrbProps {
  data: any
}

export default function WeatherOrb({ data }: WeatherOrbProps) {
  const [expanded, setExpanded] = useState(false)

  const temp = Math.round(data.main?.temp || 0)
  const humidity = data.main?.humidity || 0
  const windSpeed = data.wind?.speed || 0
  const condition = data.weather?.[0]?.main || 'Clear'

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer"
    >
      {/* Main Orb */}
      <motion.div
        animate={{
          scale: expanded ? 1.2 : 1,
          rotate: 360,
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 0.3 },
        }}
        className="relative mx-auto"
        style={{ width: 'fit-content' }}
      >
        {/* Outer Glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 w-56 h-56 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-50"
        />

        {/* Middle Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-56 h-56 rounded-full border-2 border-cyan-500/30"
        />

        {/* Core Orb */}
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
            y: [0, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative w-56 h-56 rounded-full overflow-hidden group"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 opacity-90" />

          {/* Animated Light */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-pixel text-cyan-100 mb-2"
            >
              {temp}°
            </motion.div>
            <p className="text-xs text-cyan-200 uppercase tracking-widest">{condition}</p>
          </div>

          {/* Border */}
          <div className="absolute inset-0 rounded-full border-3 border-cyan-400/50" />
        </motion.div>
      </motion.div>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          {/* Humidity */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-slate-950/60 backdrop-blur-lg rounded-lg p-4 border border-cyan-500/30 text-center"
          >
            <Droplets className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-cyan-300">{humidity}%</p>
            <p className="text-xs text-slate-400">Humidity</p>
          </motion.div>

          {/* Wind Speed */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-slate-950/60 backdrop-blur-lg rounded-lg p-4 border border-cyan-500/30 text-center"
          >
            <Wind className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-blue-300">{windSpeed}</p>
            <p className="text-xs text-slate-400">m/s</p>
          </motion.div>

          {/* Condition */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-slate-950/60 backdrop-blur-lg rounded-lg p-4 border border-cyan-500/30 text-center"
          >
            <Cloud className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-purple-300">{condition}</p>
            <p className="text-xs text-slate-400">Status</p>
          </motion.div>
        </motion.div>
      )}

      {/* Click Hint */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center text-xs text-slate-500 mt-4"
      >
        Click to expand
      </motion.p>
    </motion.div>
  )
}
