import confetti from 'canvas-confetti'

export function celebrateSubmission() {
  confetti({
    particleCount: 90,
    spread: 65,
    origin: { y: 0.6 },
    colors: ['#0F1B30', '#D2AF6B', '#F3EBD8'],
    disableForReducedMotion: true,
  })
}