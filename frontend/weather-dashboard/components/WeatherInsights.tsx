'use client'

import { motion } from 'framer-motion'
import { AlertCircle, TrendingUp, Cloud, Zap } from 'lucide-react'

interface WeatherInsightsProps {
  weatherData: any
  forecastData: any
}

export default function WeatherInsights({ weatherData, forecastData }: WeatherInsightsProps) {
  const generateInsights = () => {
    const insights = []
    const humidity = weatherData.main?.humidity || 0
    const temp = weatherData.main?.temp || 0
    const windSpeed = weatherData.wind?.speed || 0

    // Humidity insight
    if (humidity > 80) {
      insights.push({
        icon: Zap,
        title: 'High Humidity Detected',
        description: 'The air is very humid today. Consider bringing an umbrella or moisture protection.',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
      })
    }

    // Wind insight
    if (windSpeed > 10) {
      insights.push({
        icon: TrendingUp,
        title: 'Strong Winds Expected',
        description: 'Wind speeds are high today. Be cautious outdoors and secure loose items.',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
      })
    }

    // Temperature insight
    if (temp > 30) {
      insights.push({
        icon: AlertCircle,
        title: 'High Temperature Alert',
        description: 'It&apos;s going to be very hot. Stay hydrated and use sun protection.',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
      })
    } else if (temp < 0) {
      insights.push({
        icon: Cloud,
        title: 'Freezing Conditions',
        description: 'Temperatures are below freezing. Watch out for ice on roads and surfaces.',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
      })
    }

    // Forecast insight
    if (forecastData && forecastData.list) {
      const maxRain = Math.max(...forecastData.list.map((item: any) => item.pop || 0))
      if (maxRain > 0.6) {
        insights.push({
          icon: AlertCircle,
          title: 'High Rain Probability',
          description: 'Significant rainfall expected in the coming days. Plan accordingly.',
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
        })
      }
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        icon: Cloud,
        title: 'Weather Conditions Normal',
        description: 'Today looks like a regular day weather-wise. Enjoy the outdoors!',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
      })
    }

    return insights
  }

  const insights = generateInsights()

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
      className="space-y-4"
    >
      <h2 className="text-2xl font-pixel text-cyan-400 mb-6">Weather Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className={`${insight.bgColor} rounded-xl p-5 border ${insight.borderColor} backdrop-blur-sm transition-all cursor-pointer group`}
            >
              <div className="flex gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`${insight.color} mt-1`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                </motion.div>
                <div className="flex-1">
                  <h3 className={`${insight.color} font-semibold mb-1 text-sm lg:text-base`}>
                    {insight.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
