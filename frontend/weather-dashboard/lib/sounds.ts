export class SoundManager {
  private audioContext: AudioContext | null = null
  private isMuted = false

  constructor() {
    this.initAudioContext()
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      try {
        const contextClass = (window as any).AudioContext || (window as any).webkitAudioContext
        this.audioContext = new contextClass()
      } catch (e) {
        console.warn('Web Audio API not supported')
      }
    }
  }

  private play(frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') {
    if (!this.audioContext || this.isMuted) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (e) {
      console.warn('Error playing sound:', e)
    }
  }

  private playNotes(notes: Array<{ freq: number; duration: number }>) {
    if (!this.audioContext || this.isMuted) return

    let currentTime = this.audioContext.currentTime
    notes.forEach(({ freq, duration }) => {
      this.playAtTime(freq, duration, currentTime)
      currentTime += duration
    })
  }

  private playAtTime(frequency: number, duration: number, startTime: number) {
    if (!this.audioContext || this.isMuted) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    } catch (e) {
      console.warn('Error playing sound:', e)
    }
  }

  clickSound() {
    this.play(800, 0.1, 'square')
  }

  successSound() {
    this.playNotes([
      { freq: 523, duration: 0.1 }, // C5
      { freq: 659, duration: 0.1 }, // E5
      { freq: 784, duration: 0.2 }, // G5
    ])
  }

  errorSound() {
    this.playNotes([
      { freq: 300, duration: 0.15 },
      { freq: 200, duration: 0.15 },
      { freq: 100, duration: 0.3 },
    ])
  }

  notificationSound() {
    this.playNotes([
      { freq: 659, duration: 0.1 }, // E5
      { freq: 784, duration: 0.15 }, // G5
    ])
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
  }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : null
