import { useEffect, useState } from 'react'
import { useWindowStore } from '../../store/windowStore'
import styles from './Dock.module.css'

export default function Dock() {
  const { windows, openApp, focusApp } = useWindowStore()
  const isHidden = Object.values(windows).some((w) => w.isOpen && w.isMaximized)
  const [showModal, setShowModal] = useState(false)

  const onTerminalClick = () => {
    const win = windows.terminal
    if (!win || !win.isOpen) {
      openApp('terminal')
      return
    }

    if (win.isMinimized) {
      openApp('terminal')
      return
    }

    focusApp('terminal')
  }

  useEffect(() => {
    if (!showModal) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showModal])

  return (
    <>
      <div className={`${styles.dock}${isHidden ? ` ${styles.dockHidden}` : ''}`}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Terminal"
          title="Terminal"
          onClick={onTerminalClick}
        >
          <span aria-hidden="true">&gt;_</span>
          {windows.terminal?.isOpen ? (
            <span className={styles.indicator} />
          ) : null}
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="AI Chat"
          title="AI Chat"
          onClick={() => setShowModal(true)}
        >
          <span aria-hidden="true">AI</span>
          {windows.aichat?.isOpen && !windows.aichat?.isMinimized ? (
            <span className={styles.indicator} />
          ) : null}
        </button>
      </div>

      {showModal ? (
        <div
          className={styles.modal}
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>AI Chat — Coming Soon</div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
