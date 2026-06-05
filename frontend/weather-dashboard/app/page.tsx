'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import HeroCard from '@/components/HeroCard'
import WeatherOrb from '@/components/WeatherOrb'
import ForecastCards from '@/components/ForecastCards'
import WeatherAnalytics from '@/components/WeatherAnalytics'
import WeatherInsights from '@/components/WeatherInsights'
import GamificationPanel from '@/components/GamificationPanel'
import CityComparison from '@/components/CityComparison'
import AmbientEffects from '@/components/AmbientEffects'
import WeatherAnimation from '@/components/WeatherAnimation'
import LocationMap from '@/components/LocationMap'
import InteractiveStats from '@/components/InteractiveStats'

export default function Home() {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [forecastData, setForecastData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('London')
  const [unit, setUnit] = useState<'C' | 'F'>('C')

  useEffect(() => {
    fetchWeather()
  }, [city, unit])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, unit: unit === 'C' ? 'metric' : 'imperial' }),
      })
      const data = await response.json()
      setWeatherData(data.current)
      setForecastData(data.forecast)
    } catch (error) {
      console.error('Error fetching weather:', error)
    } finally {
      setLoading(false)
    }
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <main className="min-h-screen bg-slate-950 text-cyan-50 overflow-hidden">
      <AmbientEffects weatherCondition={weatherData?.weather?.[0]?.main} />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 max-w-7xl mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Header
            city={city}
            setCity={setCity}
            unit={unit}
            setUnit={setUnit}
            onRefresh={fetchWeather}
            loading={loading}
          />
        </motion.div>

        {loading ? (
          <motion.div
            className="mt-12 flex justify-center items-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full glow-cyan" />
          </motion.div>
        ) : weatherData ? (
          <>
            {/* Weather Animation - Interactive Cloud & Sun */}
            <motion.div variants={itemVariants} className="mt-8">
              <WeatherAnimation 
                condition={weatherData.weather?.[0]?.main || 'Clear'} 
                temperature={Math.round(weatherData.main?.temp || 0)}
                humidity={weatherData.main?.humidity || 0}
              />
            </motion.div>

            {/* Hero Weather Card */}
            <motion.div variants={itemVariants} className="mt-8">
              <HeroCard data={weatherData} unit={unit} />
            </motion.div>

            {/* Interactive Statistics */}
            <motion.div variants={itemVariants} className="mt-12">
              <h2 className="text-xl font-pixel text-cyan-400 mb-4">Interactive Statistics</h2>
              <InteractiveStats weatherData={weatherData} forecastData={forecastData} unit={unit} />
            </motion.div>

            {/* Google Maps Location */}
            <motion.div variants={itemVariants} className="mt-12">
              <h2 className="text-xl font-pixel text-cyan-400 mb-4">Location Weather Map</h2>
              <LocationMap 
                onLocationSelect={(cityName, lat, lng) => {
                  setCity(cityName)
                }}
                currentCity={city}
              />
            </motion.div>

            {/* Interactive Weather Orb */}
            <motion.div variants={itemVariants} className="mt-12 flex justify-center">
              <WeatherOrb data={weatherData} />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mt-12">
              {/* Left Column - Forecast */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <ForecastCards forecast={forecastData} unit={unit} />
              </motion.div>

              {/* Right Column - Gamification */}
              <motion.div variants={itemVariants}>
                <GamificationPanel />
              </motion.div>
            </div>

            {/* Analytics Section */}
            <motion.div variants={itemVariants} className="mt-12">
              <WeatherAnalytics forecastData={forecastData} unit={unit} />
            </motion.div>

            {/* Insights */}
            <motion.div variants={itemVariants} className="mt-12">
              <WeatherInsights weatherData={weatherData} forecastData={forecastData} />
            </motion.div>

            {/* City Comparison */}
            <motion.div variants={itemVariants} className="mt-12 mb-12">
              <CityComparison currentCity={city} unit={unit} />
            </motion.div>
          </>
        ) : (
          <motion.div
            variants={itemVariants}
            className="mt-12 text-center text-cyan-300"
          >
            <p className="text-lg">Failed to load weather data. Please try again.</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
