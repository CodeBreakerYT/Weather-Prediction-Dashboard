'use client'

import { useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { motion } from 'framer-motion'
import { MapPin, Cloud, Droplets, Wind } from 'lucide-react'

interface LocationWeatherProps {
  onLocationSelect: (city: string, lat: number, lng: number) => void
  currentCity?: string
}

const WeatherMarker = ({ temp, condition }: { temp: number; condition: string }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-3 shadow-lg cursor-pointer glow-cyan border-2 border-cyan-300 text-white font-bold text-sm"
  >
    {Math.round(temp)}°
  </motion.div>
)

export default function LocationMap({ onLocationSelect, currentCity }: LocationWeatherProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 })
  const [zoom, setZoom] = useState(12)
  const [cities, setCities] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter({ lat: latitude, lng: longitude })
          fetchWeatherForLocation(latitude, longitude)
        },
        () => {
          console.log('Geolocation denied, using default location')
        }
      )
    }
  }, [])

  const fetchWeatherForLocation = async (lat: number, lng: number) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/weather/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
      const data = await response.json()
      setSelectedLocation(data)
    } catch (error) {
      console.error('Error fetching location weather:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (e: any) => {
    const { lat, lng } = e
    setMapCenter({ lat, lng })
    fetchWeatherForLocation(lat, lng)
  }

  const handleSearch = async () => {
    if (!searchInput.trim()) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/search-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchInput }),
      })
      const results = await response.json()

      if (results.length > 0) {
        const firstResult = results[0]
        const { lat, lng, name } = firstResult
        setMapCenter({ lat, lng })
        setZoom(10)
        fetchWeatherForLocation(lat, lng)
        onLocationSelect(name, lat, lng)
      }
    } catch (error) {
      console.error('Error searching city:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-950/60 backdrop-blur-lg border-b border-cyan-500/20 p-4 z-50 relative"
      >
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700/50 focus-within:border-cyan-500/50 transition-all">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-cyan-50 placeholder-slate-500 outline-none font-sans"
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
        </div>
      </motion.div>

      {/* Map */}
      <div className="h-96 relative">
        {apiKey ? (
          <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            center={mapCenter}
            zoom={zoom}
            onClick={handleMapClick}
            onChildMouseEnter={() => {}}
            onChildMouseLeave={() => {}}
          >
            {selectedLocation && (
              <WeatherMarker
                lat={selectedLocation.coordinates?.lat || mapCenter.lat}
                lng={selectedLocation.coordinates?.lng || mapCenter.lng}
                temp={selectedLocation.current?.main?.temp || 0}
                condition={selectedLocation.current?.weather?.[0]?.main || 'Clear'}
              />
            )}
          </GoogleMapReact>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900/50 border border-cyan-500/20">
            <div className="text-center">
              <p className="text-cyan-400 mb-2">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
              <p className="text-slate-400 text-sm">to your environment variables to enable maps</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Info Card */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-lg border-t border-cyan-500/20 p-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Temperature</p>
              <p className="text-xl font-semibold text-cyan-400">
                {Math.round(selectedLocation.current?.main?.temp || 0)}°C
              </p>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Condition
              </p>
              <p className="text-sm font-semibold text-cyan-400">
                {selectedLocation.current?.weather?.[0]?.main || 'Clear'}
              </p>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Droplets className="w-3 h-3" /> Humidity
              </p>
              <p className="text-sm font-semibold text-cyan-400">
                {selectedLocation.current?.main?.humidity || 0}%
              </p>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Wind className="w-3 h-3" /> Wind
              </p>
              <p className="text-sm font-semibold text-cyan-400">
                {selectedLocation.current?.wind?.speed || 0} m/s
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
