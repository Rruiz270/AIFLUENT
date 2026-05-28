'use client'

import { useEffect } from 'react'

function getThemeForHour(): 'light' | 'dark' {
  const hour = new Date().getHours()
  // Light: 5am–5:59pm (5–17), Dark: 6pm–4:59am (18–4)
  return hour >= 5 && hour < 18 ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function applyTheme() {
      const theme = getThemeForHour()
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    applyTheme()

    // Check every minute for theme change
    const interval = setInterval(applyTheme, 60_000)
    return () => clearInterval(interval)
  }, [])

  return <>{children}</>
}
