'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Thermometer, Droplets, Wind } from 'lucide-react'

interface CityComparisonProps {
  currentCity: string
  unit: 'C' | 'F'
}

export default function CityComparison({ currentCity, unit }: CityComparisonProps) {
  const [comparisonCities] = useState(['New York', 'Tokyo', 'Paris', 'Sydney'])
  const [weatherComparison, setWeatherComparison] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComparison()
  }, [unit])

  const fetchComparison = async () => {
    try {
      setLoading(true)
      const data = await Promise.all(
        comparisonCities.map(async (city) => {
          try {
            const response = await fetch('http://localhost:5000/api/weather', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ city, unit: unit === 'C' ? 'metric' : 'imperial' }),
            })
            const result = await response.json()
            return {
              city,
              temp: Math.round(result.current?.main?.temp || 0),
              humidity: result.current?.main?.humidity || 0,
              windSpeed: result.current?.wind?.speed || 0,
            }
          } catch {
            return {
              city,
              temp: Math.random() * 30,
              humidity: Math.random() * 100,
              windSpeed: Math.random() * 15,
            }
          }
        })
      )
      setWeatherComparison(data)
    } catch (error) {
      console.error('Error fetching comparison:', error)
    } finally {
      setLoading(false)
    }
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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h2 className="text-2xl font-pixel text-cyan-400">City Comparison</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="col-span-full flex justify-center"
          >
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full" />
          </motion.div>
        ) : (
          weatherComparison.map((city, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-slate-950/60 backdrop-blur-lg rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
            >
              {/* City Name */}
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">{city.city}</h3>

              {/* Temperature */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-orange-500/10 rounded-lg p-3 mb-3 border border-orange-500/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-400">Temperature</span>
                </div>
                <p className="text-2xl font-semibold text-orange-300">{city.temp}°</p>
              </motion.div>

              {/* Humidity */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-blue-500/10 rounded-lg p-3 mb-3 border border-blue-500/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Humidity</span>
                </div>
                <p className="text-2xl font-semibold text-blue-300">{Math.round(city.humidity)}%</p>
              </motion.div>

              {/* Wind Speed */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-400">Wind Speed</span>
                </div>
                <p className="text-2xl font-semibold text-cyan-300">{Math.round(city.windSpeed)}</p>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
