import { useEffect, useState } from 'react'

/**
 * Below this width the simulated desktop is bypassed entirely (plan §6):
 * no draggable windows, no dock, Portfolio renders directly with normal
 * document scrolling. 768px = phones + tablets in portrait; wider split-screen
 * desktop windows keep the desktop.
 */
export const MOBILE_QUERY = '(max-width: 768px)'

function matches(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(MOBILE_QUERY).matches
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
