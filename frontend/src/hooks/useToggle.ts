import { useState } from 'react'

export default function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  return { value, on: () => setValue(true), off: () => setValue(false), toggle: () => setValue(v => !v) }
}
