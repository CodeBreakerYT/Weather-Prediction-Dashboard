'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface WeatherAnalyticsProps {
  forecastData: any
  unit: 'C' | 'F'
}

export default function WeatherAnalytics({ forecastData, unit }: WeatherAnalyticsProps) {
  const [activeChart, setActiveChart] = useState('temperature')

  if (!forecastData || !forecastData.list) return null

  // Prepare data for charts
  const chartData = forecastData.list.map((item: any) => ({
    time: new Date(item.dt * 1000).getHours(),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed),
    rainChance: Math.round((item.pop || 0) * 100),
  }))

  const charts = [
    {
      id: 'temperature',
      title: 'Temperature Trend',
      icon: '🌡️',
    },
    {
      id: 'humidity',
      title: 'Humidity Levels',
      icon: '💧',
    },
    {
      id: 'wind',
      title: 'Wind Speed',
      icon: '💨',
    },
    {
      id: 'rain',
      title: 'Rain Probability',
      icon: '🌧️',
    },
  ]

  const renderChart = () => {
    switch (activeChart) {
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5a" />
              <XAxis dataKey="time" stroke="#8b94b8" />
              <YAxis stroke="#8b94b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a2947', border: '1px solid #00d9ff', borderRadius: '8px' }}
                labelStyle={{ color: '#00d9ff' }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#00d9ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTemp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'humidity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5a" />
              <XAxis dataKey="time" stroke="#8b94b8" />
              <YAxis stroke="#8b94b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a2947', border: '1px solid #6366f1', borderRadius: '8px' }}
                labelStyle={{ color: '#6366f1' }}
              />
              <Line type="monotone" dataKey="humidity" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'wind':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5a" />
              <XAxis dataKey="time" stroke="#8b94b8" />
              <YAxis stroke="#8b94b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a2947', border: '1px solid #fbbf24', borderRadius: '8px' }}
                labelStyle={{ color: '#fbbf24' }}
              />
              <Bar dataKey="windSpeed" fill="#fbbf24" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'rain':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5a" />
              <XAxis dataKey="time" stroke="#8b94b8" />
              <YAxis stroke="#8b94b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a2947', border: '1px solid #34d399', borderRadius: '8px' }}
                labelStyle={{ color: '#34d399' }}
              />
              <Bar dataKey="rainChance" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-pixel text-cyan-400">Weather Analytics</h2>

      {/* Chart Selection */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {charts.map((chart) => (
          <motion.button
            key={chart.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveChart(chart.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              activeChart === chart.id
                ? 'glass border border-cyan-500/60 text-cyan-300 glow-cyan'
                : 'glass border border-cyan-500/30 text-slate-400 hover:text-cyan-300'
            }`}
          >
            <span className="mr-2">{chart.icon}</span>
            {chart.title}
          </motion.button>
        ))}
      </div>

      {/* Chart Container */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-950/60 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30"
      >
        {renderChart()}
      </motion.div>
    </motion.div>
  )
}
