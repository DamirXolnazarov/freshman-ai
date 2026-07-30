import { useRive } from '@rive-app/react-canvas'

// Generic wrapper: point it at any .riv file in /public, get back the
// player + the state-machine inputs so a parent component can drive it.
// Usage: const { RiveComponent, rive } = useRiveWidget('roadmap-build.riv', 'Build')
export function useRiveWidget(fileName, stateMachine) {
  const { rive, RiveComponent } = useRive({
    src: `/${fileName}`,
    stateMachines: stateMachine,
    autoplay: true,
  })
  return { rive, RiveComponent }
}