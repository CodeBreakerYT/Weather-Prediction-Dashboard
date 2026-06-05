'use client'

import { motion } from 'framer-motion'
import { Cloud, Wind, Droplets, Eye, Gauge, Sunrise, Sunset } from 'lucide-react'

interface HeroCardProps {
  data: any
  unit: 'C' | 'F'
}

export default function HeroCard({ data, unit }: HeroCardProps) {
  const getWeatherGradient = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return 'from-yellow-600/30 via-orange-600/20 to-red-600/10'
      case 'rainy':
      case 'rain':
        return 'from-blue-600/30 via-cyan-600/20 to-purple-600/10'
      case 'thunderstorm':
      case 'storm':
        return 'from-purple-600/30 via-indigo-600/20 to-pink-600/10'
      case 'snow':
      case 'snowy':
        return 'from-cyan-600/30 via-blue-600/20 to-slate-600/10'
      case 'cloudy':
      case 'clouds':
        return 'from-slate-600/30 via-slate-500/20 to-slate-600/10'
      default:
        return 'from-indigo-600/30 via-cyan-600/20 to-blue-600/10'
    }
  }

  const temp = Math.round(data.main?.temp || 0)
  const feelsLike = Math.round(data.main?.feels_like || 0)
  const condition = data.weather?.[0]?.main || 'Clear'
  const humidity = data.main?.humidity || 0
  const windSpeed = data.wind?.speed || 0
  const visibility = (data.visibility || 0) / 1000
  const pressure = data.main?.pressure || 0
  const sunrise = data.sys?.sunrise || 0
  const sunset = data.sys?.sunset || 0

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stats = [
    { icon: Droplets, label: 'Humidity', value: `${humidity}%`, color: 'text-cyan-400' },
    { icon: Wind, label: 'Wind Speed', value: `${windSpeed} m/s`, color: 'text-blue-400' },
    { icon: Eye, label: 'Visibility', value: `${visibility.toFixed(1)} km`, color: 'text-purple-400' },
    { icon: Gauge, label: 'Pressure', value: `${pressure} mb`, color: 'text-pink-400' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`glass rounded-2xl p-8 border border-cyan-500/30 overflow-hidden relative`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradient(condition)} opacity-50 blur-3xl`} />

      <div className="relative z-10">
        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Temperature Display */}
          <motion.div className="flex flex-col justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl lg:text-8xl font-pixel text-cyan-400 leading-none mb-4"
            >
              {temp}°
            </motion.div>
            <div className="space-y-2">
              <p className="text-xl lg:text-2xl font-semibold text-cyan-300">{condition}</p>
              <p className="text-slate-400">
                Feels like <span className="text-indigo-400 font-semibold">{feelsLike}°</span>
              </p>
            </div>
          </motion.div>

          {/* Weather Icon */}
          <motion.div
            animate={{ rotate: 360, y: [0, -10, 0] }}
            transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, y: { duration: 3, repeat: Infinity } }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-60" />
              <div className="relative bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full w-40 h-40 lg:w-48 lg:h-48 flex items-center justify-center glow-cyan border-2 border-cyan-400/50">
                <Cloud className="w-24 h-24 lg:w-32 lg:h-32 text-cyan-100" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border-t border-cyan-500/20 pt-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className="text-lg font-semibold text-cyan-300">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Sunrise/Sunset */}
        <div className="flex gap-4 border-t border-cyan-500/20 pt-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-1 bg-orange-500/10 rounded-lg p-4 border border-orange-500/30 flex items-center gap-3"
          >
            <Sunrise className="w-6 h-6 text-orange-400" />
            <div>
              <p className="text-xs text-slate-400">Sunrise</p>
              <p className="font-semibold text-orange-300">{formatTime(sunrise)}</p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-1 bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/30 flex items-center gap-3"
          >
            <Sunset className="w-6 h-6 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Sunset</p>
              <p className="font-semibold text-indigo-300">{formatTime(sunset)}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
