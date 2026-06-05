'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface AmbientEffectsProps {
  weatherCondition?: string
}

export default function AmbientEffects({ weatherCondition }: AmbientEffectsProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
  }, [])

  const getEffectType = (condition?: string) => {
    switch (condition?.toLowerCase()) {
      case 'rain':
      case 'rainy':
        return 'rain'
      case 'snow':
      case 'snowy':
        return 'snow'
      case 'thunderstorm':
      case 'storm':
        return 'storm'
      default:
        return 'clear'
    }
  }

  const effectType = getEffectType(weatherCondition)

  return (
    <>
      {/* Rain Effect */}
      {effectType === 'rain' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-0.5 h-8 bg-gradient-to-b from-cyan-400/60 to-cyan-400/0"
              initial={{ x: `${particle.x}%`, y: '-10%', opacity: 0 }}
              animate={{
                y: '110%',
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow Effect */}
      {effectType === 'snow' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-cyan-200 rounded-full blur-sm"
              initial={{ x: `${particle.x}%`, y: '-10%', opacity: 0 }}
              animate={{
                y: '110%',
                x: `${particle.x + (Math.random() - 0.5) * 20}%`,
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Storm Effect - Lightning Flashes */}
      {effectType === 'storm' && (
        <>
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.slice(0, 10).map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-0.5 h-12 bg-gradient-to-b from-purple-400/80 to-purple-400/0"
                initial={{ x: `${particle.x}%`, y: '-10%', opacity: 0 }}
                animate={{
                  y: '110%',
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>

          {/* Lightning Flash */}
          <motion.div
            className="fixed inset-0 pointer-events-none bg-purple-300/0"
            animate={{ backgroundColor: ['rgba(147, 51, 234, 0)', 'rgba(147, 51, 234, 0.2)', 'rgba(147, 51, 234, 0)'] }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 3 + Math.random() * 3,
            }}
          />
        </>
      )}

      {/* Clear/Sunny - Floating Light Particles */}
      {effectType === 'clear' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.slice(0, 10).map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full blur-sm"
              initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 0 }}
              animate={{
                y: [particle.y - 10, particle.y + 10],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Animated Background Gradients */}
      <motion.div
        className="fixed inset-0 pointer-events-none opacity-30"
        animate={{
          background: [
            'radial-gradient(at 20% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(at 80% 20%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(at 40% 80%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(at 20% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </>
  )
}
