import { useState, useEffect, useCallback } from 'react'
import { WEATHER_BY_CITY } from '@/lib/mockWeatherData'

interface GeolocationCoords {
  latitude: number
  longitude: number
  city: string
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)

  // Reverse geocode coordinates to city name
  const getCityFromCoords = useCallback(async (lat: number, lon: number): Promise<string> => {
    // Simple fallback mapping for demo
    const coordMap: Record<string, string> = {
      '51,0': 'London',
      '40,-74': 'New York',
      '35,139': 'Tokyo',
      '48,2': 'Paris',
      '-33,151': 'Sydney',
    }

    const key = `${Math.round(lat)},${Math.round(lon)}`
    return coordMap[key] || 'London'
  }, [])

  const requestPermission = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      const city = await getCityFromCoords(latitude, longitude)

      setCoords({ latitude, longitude, city })
      setHasPermission(true)
      localStorage.setItem('weatherLocationPermission', 'granted')
      localStorage.setItem('lastKnownCoords', JSON.stringify({ latitude, longitude }))
    } catch (err: any) {
      setHasPermission(false)
      setError(err.message || 'Failed to get location')
      localStorage.setItem('weatherLocationPermission', 'denied')
    } finally {
      setLoading(false)
    }
  }, [getCityFromCoords])

  // Check for previously granted permission
  useEffect(() => {
    const checkStoredPermission = () => {
      const stored = localStorage.getItem('weatherLocationPermission')
      if (stored === 'granted') {
        const lastCoords = localStorage.getItem('lastKnownCoords')
        if (lastCoords) {
          try {
            setCoords({
              ...JSON.parse(lastCoords),
              city: 'London',
            })
            setHasPermission(true)
          } catch {
            setShowPermissionPrompt(true)
          }
        }
      } else if (stored === 'denied') {
        setHasPermission(false)
      } else {
        setShowPermissionPrompt(true)
      }
    }

    checkStoredPermission()
  }, [])

  return {
    coords,
    loading,
    error,
    hasPermission,
    showPermissionPrompt,
    setShowPermissionPrompt,
    requestPermission,
  }
}
