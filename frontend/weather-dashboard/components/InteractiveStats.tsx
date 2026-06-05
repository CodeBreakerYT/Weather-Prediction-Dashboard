'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Wind, Droplets, Eye, Gauge, Zap, Compass, AlertCircle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface InteractiveStatsProps {
  weatherData: any
  forecastData: any
  unit: 'C' | 'F'
}

export default function InteractiveStats({ weatherData, forecastData, unit }: InteractiveStatsProps) {
  const [expandedStat, setExpandedStat] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'area'>('line')

  const humidity = weatherData.main?.humidity || 0
  const windSpeed = weatherData.wind?.speed || 0
  const windGust = weatherData.wind?.gust || windSpeed * 1.2
  const windDeg = weatherData.wind?.deg || 0
  const visibility = (weatherData.visibility || 0) / 1000
  const pressure = weatherData.main?.pressure || 0
  const cloudCoverage = weatherData.clouds?.all || 0
  const uvIndex = weatherData.uvi || 'N/A'
  const feelsLike = Math.round(weatherData.main?.feels_like || 0)
  const dewPoint = Math.round(feelsLike - (100 - humidity) / 5)

  // Prepare chart data from forecast
  const chartData =
    forecastData?.list?.slice(0, 8).map((item: any) => ({
      time: new Date(item.dt * 1000).getHours() + ':00',
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed),
    })) || []

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(deg / 22.5) % 16]
  }

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 30) return { label: 'Dry', color: 'text-orange-400', bg: 'bg-orange-500/10' }
    if (humidity < 60) return { label: 'Comfortable', color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
    if (humidity < 80) return { label: 'Humid', color: 'text-blue-400', bg: 'bg-blue-500/10' }
    return { label: 'Very Humid', color: 'text-purple-400', bg: 'bg-purple-500/10' }
  }

  const getWindLevel = (speed: number) => {
    if (speed < 5) return { label: 'Calm', color: 'text-green-400' }
    if (speed < 11) return { label: 'Light Breeze', color: 'text-cyan-400' }
    if (speed < 19) return { label: 'Moderate', color: 'text-yellow-400' }
    if (speed < 28) return { label: 'Fresh Wind', color: 'text-orange-400' }
    return { label: 'Strong Wind', color: 'text-red-400' }
  }

  const stats = [
    {
      id: 'humidity',
      icon: Droplets,
      label: 'Humidity',
      value: `${humidity}%`,
      unit: 'Relative',
      color: 'text-blue-400',
      details: {
        dewPoint,
        status: getHumidityStatus(humidity),
        description: `The air contains ${humidity}% of its maximum water capacity at current temperature.`,
        chart: true,
      },
    },
    {
      id: 'wind',
      icon: Wind,
      label: 'Wind Speed',
      value: `${Math.round(windSpeed)}`,
      unit: 'm/s',
      color: 'text-cyan-400',
      details: {
        gust: Math.round(windGust),
        direction: getWindDirection(windDeg),
        level: getWindLevel(windSpeed),
        description: `Wind is blowing from the ${getWindDirection(windDeg)} at ${Math.round(windSpeed)} m/s with gusts up to ${Math.round(windGust)} m/s.`,
      },
    },
    {
      id: 'visibility',
      icon: Eye,
      label: 'Visibility',
      value: `${visibility.toFixed(1)}`,
      unit: 'km',
      color: 'text-purple-400',
      details: {
        status: visibility > 10 ? 'Excellent' : visibility > 5 ? 'Good' : 'Limited',
        description: `Visibility is ${visibility.toFixed(1)} km. ${
          visibility < 1 ? 'Fog is present.' : visibility < 5 ? 'Moderate fog or haze.' : 'Clear visibility.'
        }`,
      },
    },
    {
      id: 'pressure',
      icon: Gauge,
      label: 'Pressure',
      value: `${pressure}`,
      unit: 'mb',
      color: 'text-pink-400',
      details: {
        trend: pressure > 1013 ? 'Rising' : 'Falling',
        stability: pressure > 1020 ? 'Stable' : pressure > 1000 ? 'Normal' : 'Low',
        description: `Atmospheric pressure is ${pressure} mb. This is ${pressure > 1013 ? 'above' : 'below'} standard sea level pressure.`,
      },
    },
    {
      id: 'clouds',
      icon: Cloud,
      label: 'Cloud Cover',
      value: `${cloudCoverage}`,
      unit: '%',
      color: 'text-slate-400',
      details: {
        coverage: cloudCoverage < 20 ? 'Clear' : cloudCoverage < 50 ? 'Partly Cloudy' : cloudCoverage < 80 ? 'Mostly Cloudy' : 'Overcast',
        description: `${cloudCoverage}% of the sky is covered by clouds. ${
          cloudCoverage < 20 ? 'Great for stargazing!' : cloudCoverage > 80 ? 'Heavy cloud cover.' : 'Scattered clouds.'
        }`,
      },
    },
    {
      id: 'feelslike',
      icon: Zap,
      label: 'Feels Like',
      value: `${feelsLike}°`,
      unit: unit,
      color: 'text-orange-400',
      details: {
        difference: feelsLike - Math.round(weatherData.main?.temp || 0),
        description: `The temperature feels ${Math.abs(feelsLike - Math.round(weatherData.main?.temp || 0))} degrees ${feelsLike > Math.round(weatherData.main?.temp || 0) ? 'warmer due to wind chill and humidity.' : 'cooler due to wind chill.'}`,
      },
    },
  ]

  return (
    <div className="w-full">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => {
          const isExpanded = expandedStat === stat.id
          const Icon = stat.icon

          return (
            <motion.div
              key={stat.id}
              layoutId={`stat-${stat.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setExpandedStat(isExpanded ? null : stat.id)}
              className="cursor-pointer"
            >
              <motion.div
                className={`bg-slate-950/60 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all ${
                  isExpanded ? 'ring-2 ring-cyan-500/50' : ''
                }`}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-cyan-400"
                  >
                    ▼
                  </motion.div>
                </div>
                <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                <motion.div
                  layout
                  className="flex items-baseline gap-1"
                >
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.unit}</p>
                </motion.div>
              </motion.div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    layoutId={`details-${stat.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-900/60 backdrop-blur-lg rounded-xl p-4 border border-cyan-500/30 mt-2 overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {/* Status Badge */}
                      {stat.details.status && (
                        <div className={`inline-block ${stat.details.status.bg} rounded-full px-3 py-1 mb-3`}>
                          <p className={`text-xs font-semibold ${stat.details.status.color}`}>
                            {stat.details.status.label}
                          </p>
                        </div>
                      )}

                      {/* Details Grid */}
                      {stat.id === 'wind' && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Direction</p>
                            <p className="text-lg font-bold text-cyan-400">{stat.details.direction}</p>
                          </div>
                          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Gust Speed</p>
                            <p className="text-lg font-bold text-cyan-400">{stat.details.gust} m/s</p>
                          </div>
                        </div>
                      )}

                      {stat.id === 'humidity' && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Dew Point</p>
                            <p className="text-lg font-bold text-cyan-400">{stat.details.dewPoint}°</p>
                          </div>
                          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Saturation</p>
                            <p className="text-lg font-bold text-cyan-400">{humidity}%</p>
                          </div>
                        </div>
                      )}

                      {stat.id === 'pressure' && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Trend</p>
                            <p className={`text-sm font-bold ${stat.details.trend === 'Rising' ? 'text-green-400' : 'text-red-400'}`}>
                              {stat.details.trend}
                            </p>
                          </div>
                          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Stability</p>
                            <p className="text-sm font-bold text-cyan-400">{stat.details.stability}</p>
                          </div>
                        </div>
                      )}

                      {stat.id === 'feelslike' && (
                        <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50 mb-3">
                          <p className="text-xs text-slate-400 mb-1">Temperature Difference</p>
                          <p className={`text-lg font-bold ${stat.details.difference > 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                            {stat.details.difference > 0 ? '+' : ''}{stat.details.difference}° {unit}
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-300 leading-relaxed">{stat.details.description}</p>
                      </div>

                      {/* Chart for humidity */}
                      {stat.id === 'humidity' && chartData.length > 0 && (
                        <div className="mt-4 bg-slate-950/50 rounded-lg p-3 border border-slate-700/50">
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#0f172a',
                                  border: '1px solid #0891b2',
                                  borderRadius: '8px',
                                }}
                                labelStyle={{ color: '#06b6d4' }}
                              />
                              <Area
                                type="monotone"
                                dataKey="humidity"
                                stroke="#06b6d4"
                                fillOpacity={1}
                                fill="url(#humidityGrad)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
