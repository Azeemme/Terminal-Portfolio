import type { ComponentType } from 'react'
import { useWindowStore } from '../../store/windowStore'
import Window from '../Window/Window'
import Dock from '../Dock/Dock'
import Terminal from '../apps/Terminal/Terminal'
import styles from './Desktop.module.css'

const appComponents: Record<string, ComponentType> = {
  terminal: Terminal,
}

export default function Desktop() {
  const { windows } = useWindowStore()

  return (
    <div className={styles.desktop}>
      {Object.values(windows).map((win) => {
        const AppComponent = appComponents[win.id]
        if (!AppComponent) return null // aichat currently has no app component
        return (
          <Window key={win.id} id={win.id}>
            <AppComponent />
          </Window>
        )
      })}
      <Dock />
    </div>
  )
}
