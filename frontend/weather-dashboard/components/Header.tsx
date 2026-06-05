'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Search, RefreshCw, Bell, Sun, Moon, Settings } from 'lucide-react'

interface HeaderProps {
  city: string
  setCity: (city: string) => void
  unit: 'C' | 'F'
  setUnit: (unit: 'C' | 'F') => void
  onRefresh: () => void
  loading: boolean
}

export default function Header({
  city,
  setCity,
  unit,
  setUnit,
  onRefresh,
  loading,
}: HeaderProps) {
  const [searchInput, setSearchInput] = useState(city)
  const [showTheme, setShowTheme] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearch = () => {
    if (searchInput.trim()) {
      setCity(searchInput)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const popularCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney']

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-950/60 backdrop-blur-lg border border-cyan-500/20 border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex flex-col gap-4">
        {/* Top row: Logo + Controls */}
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-cyan-400 font-pixel text-lg"
          >
            <div className="glow-cyan p-3 rounded-lg bg-cyan-500/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-pixel text-cyan-400">WEATHER</p>
              <p className="text-xs font-pixel text-slate-400">EXPLORER</p>
            </div>
          </motion.div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Unit Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
              className="bg-slate-950/60 backdrop-blur-lg px-4 py-2 rounded-lg text-cyan-400 font-mono text-sm border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
            >
              °{unit}
            </motion.button>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={loading}
              className="bg-slate-950/60 backdrop-blur-lg p-3 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 transition-all disabled:opacity-50"
            >
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </motion.button>

            {/* Notification */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-slate-950/60 backdrop-blur-lg p-3 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-full right-0 mt-2 bg-slate-900/90 backdrop-blur-lg rounded-lg border border-cyan-500/30 p-4 w-64 z-50"
                  >
                    <p className="text-sm font-semibold text-cyan-400 mb-3">Weather Alerts</p>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 p-2 rounded bg-slate-800/50 border border-slate-700/50">📢 High humidity detected today</p>
                      <p className="text-xs text-slate-300 p-2 rounded bg-slate-800/50 border border-slate-700/50">🌅 Sunset time: 7:45 PM</p>
                      <p className="text-xs text-slate-300 p-2 rounded bg-slate-800/50 border border-slate-700/50">💨 Wind speeds increasing</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTheme(!showTheme)}
              className="bg-slate-950/60 backdrop-blur-lg p-3 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 transition-all"
            >
              {showTheme ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-950/60 backdrop-blur-lg p-3 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 transition-all"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex-1 flex items-center gap-2 bg-slate-950/60 backdrop-blur-lg px-4 py-3 rounded-lg border border-slate-700/50 focus-within:border-cyan-500/50 transition-all">
            <Search className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search city..."
              className="flex-1 bg-transparent text-cyan-50 placeholder-slate-500 outline-none text-sm font-sans"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </motion.button>
        </motion.div>

        {/* Quick City Suggestions */}
        <motion.div
          className="flex gap-2 flex-wrap items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-slate-400">Quick cities:</p>
          {popularCities.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchInput(c)
                setCity(c)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                city === c
                  ? 'bg-cyan-500/30 border-cyan-500/60 text-cyan-300'
                  : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-cyan-500/50'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </motion.div>

        {/* Current City Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-xs text-slate-400"
        >
          Current Location: <span className="text-cyan-400 font-semibold">{city}</span>
        </motion.div>
      </div>
    </motion.header>
  )
}

import { AnimatePresence } from 'framer-motion'
