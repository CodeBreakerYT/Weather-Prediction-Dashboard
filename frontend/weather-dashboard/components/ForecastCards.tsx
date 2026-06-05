'use client'

import { motion } from 'framer-motion'
import { Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react'

interface ForecastCardsProps {
  forecast: any
  unit: 'C' | 'F'
}

export default function ForecastCards({ forecast, unit }: ForecastCardsProps) {
  if (!forecast || !forecast.list) return null

  // Get daily forecasts (one per day)
  const dailyForecasts = forecast.list
    .filter((_: any, index: number) => index % 8 === 0)
    .slice(0, 7)

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'clouds':
        return <Cloud className="w-8 h-8" />
      case 'rain':
      case 'rainy':
        return <CloudRain className="w-8 h-8" />
      case 'snow':
        return <CloudSnow className="w-8 h-8" />
      case 'thunderstorm':
        return <Zap className="w-8 h-8" />
      default:
        return <Cloud className="w-8 h-8" />
    }
  }

  const getDayName = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h2 className="text-2xl font-pixel text-cyan-400 mb-6">7-Day Forecast</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dailyForecasts.map((day: any, index: number) => {
          const high = Math.round(day.main?.temp_max || 0)
          const low = Math.round(day.main?.temp_min || 0)
          const condition = day.weather?.[0]?.main || 'Clear'
          const rainChance = Math.round((day.pop || 0) * 100)
          const dayName = getDayName(day.dt)

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-950/60 backdrop-blur-lg rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer group"
            >
              {/* Day */}
              <p className="text-sm font-semibold text-cyan-400 mb-3 uppercase">{dayName}</p>

              {/* Icon */}
              <motion.div className="flex justify-center mb-4">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-cyan-300 group-hover:text-cyan-200 transition-colors"
                >
                  {getWeatherIcon(condition)}
                </motion.div>
              </motion.div>

              {/* Condition */}
              <p className="text-center text-xs text-slate-400 mb-3">{condition}</p>

              {/* Temperature */}
              <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">High</p>
                    <p className="text-xl font-semibold text-cyan-300">{high}°</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Low</p>
                    <p className="text-xl font-semibold text-indigo-300">{low}°</p>
                  </div>
                </div>
              </div>

              {/* Rain Chance */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Rain Chance</span>
                  <span className="font-semibold text-blue-300">{rainChance}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rainChance}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  />
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
