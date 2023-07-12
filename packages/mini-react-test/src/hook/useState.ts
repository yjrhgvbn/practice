import { curComponent, getHookIndex, updateComponent } from '../react-dom'

export function useState<T>(initState: T) {
  const target = curComponent!
  const hookIndex = getHookIndex()
  const oldValue: T = curComponent?.state?.[hookIndex] === undefined ? initState : curComponent?.state?.[hookIndex]
  const setState = (newValue: T) => {
    if (newValue !== oldValue) {
      target.state[hookIndex] = newValue
      updateComponent(target)
    }
  }

  return [oldValue, setState]
}
