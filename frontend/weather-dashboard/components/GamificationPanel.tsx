'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Flame, Wind, Cloud, Compass } from 'lucide-react'

export default function GamificationPanel() {
  const [level] = useState(7)
  const [xp] = useState(2450)
  const [xpMax] = useState(5000)
  const [achievements] = useState([
    { icon: Cloud, label: 'Storm Hunter', unlocked: true },
    { icon: Wind, label: 'Wind Tracker', unlocked: true },
    { icon: Zap, label: 'Forecast Master', unlocked: false },
    { icon: Compass, label: 'Climate Explorer', unlocked: false },
  ])

  const xpPercentage = (xp / xpMax) * 100

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
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h2 className="text-2xl font-pixel text-cyan-400 mb-6">Weather Explorer</h2>

      {/* Level Card */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-950/60 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
      >
        <div className="text-center mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Trophy className="w-12 h-12 text-yellow-400 glow-pink" />
          </motion.div>
          <p className="text-5xl font-pixel text-purple-300 my-2">{level}</p>
          <p className="text-sm text-slate-400">Current Level</p>
        </div>

        {/* XP Bar */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">Experience</span>
            <span className="text-xs text-purple-300 font-semibold">
              {xp} / {xpMax}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 glow-purple"
            />
          </div>
        </div>

        {/* Next Level Info */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-center text-xs text-slate-400"
        >
          {xpMax - xp} XP to Level {level + 1}
        </motion.div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-lg font-pixel text-cyan-400">Achievements</h3>

        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <motion.div
                key={index}
                whileHover={{ scale: achievement.unlocked ? 1.05 : 0.98 }}
                className={`rounded-lg p-4 text-center border transition-all ${
                  achievement.unlocked
                    ? 'glass border-yellow-500/30 cursor-pointer hover:border-yellow-500/60'
                    : 'bg-slate-900/30 border-slate-700/30 opacity-60'
                }`}
              >
                <motion.div
                  animate={achievement.unlocked ? { rotate: 360, scale: [1, 1.1, 1] } : {}}
                  transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
                  className={`w-6 h-6 mx-auto mb-2 ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'}`}
                >
                  <Icon className="w-full h-full" />
                </motion.div>
                <p className="text-xs font-semibold text-slate-300">{achievement.label}</p>
                {achievement.unlocked && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs text-yellow-400 mt-1 block"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="bg-slate-950/60 backdrop-blur-lg rounded-xl p-4 border border-red-500/30 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl mb-2"
        >
          🔥
        </motion.div>
        <p className="text-2xl font-pixel text-red-400">12 Days</p>
        <p className="text-xs text-slate-400">Exploration Streak</p>
      </motion.div>
    </motion.div>
  )
}
