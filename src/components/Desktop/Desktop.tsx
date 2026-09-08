import { lazy, Suspense, type ComponentType } from 'react'
import { useWindowStore } from '../../store/windowStore'
import Window from '../Window/Window'
import Dock from '../Dock/Dock'
import Portfolio from '../apps/Portfolio/Portfolio'
import AppErrorBoundary from '../common/AppErrorBoundary'
import RouteBridge from '../../routing/RouteBridge'
import styles from './Desktop.module.css'

// Terminal (xterm.js) is heavy and optional — never in the entry chunk (plan §3).
const Terminal = lazy(() => import('../apps/Terminal/Terminal'))

const appComponents: Record<string, ComponentType> = {
  portfolio: Portfolio,
  terminal: Terminal,
}

const appTitles: Record<string, string> = {
  portfolio: 'Portfolio',
  terminal: 'Terminal',
}

function AppLoading() {
  return (
    <div style={{ padding: '24px', color: '#a0a0a0', fontSize: '13px' }} role="status">
      Loading…
    </div>
  )
}

export default function Desktop() {
  const windows = useWindowStore((s) => s.windows)
  const anyWindowOpen = Object.values(windows).some((w) => w.isOpen && appComponents[w.id])

  return (
    <div className={styles.desktop}>
      <RouteBridge />
      {!anyWindowOpen ? (
        <h1 className="sr-only">Azeem Ehtisham — desktop. Use the dock to open Portfolio or Terminal.</h1>
      ) : null}
      {Object.values(windows).map((win) => {
        const AppComponent = appComponents[win.id]
        if (!AppComponent) return null // aichat is a dock modal, not a window
        return (
          <Window key={win.id} id={win.id}>
            <AppErrorBoundary appName={appTitles[win.id] ?? win.title}>
              <Suspense fallback={<AppLoading />}>
                <AppComponent />
              </Suspense>
            </AppErrorBoundary>
          </Window>
        )
      })}
      <Dock />
    </div>
  )
}
