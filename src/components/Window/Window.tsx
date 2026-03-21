import React from 'react'
import { Rnd } from 'react-rnd'
import { useWindowStore } from '../../store/windowStore'
import styles from './Window.module.css'

interface WindowProps {
  id: string
  children: React.ReactNode
}

export default function Window({ id, children }: WindowProps) {
  const window = useWindowStore((s) => s.windows[id])
  const focusApp = useWindowStore((s) => s.focusApp)
  const minimizeApp = useWindowStore((s) => s.minimizeApp)
  const maximizeApp = useWindowStore((s) => s.maximizeApp)
  const closeApp = useWindowStore((s) => s.closeApp)
  const updatePosition = useWindowStore((s) => s.updatePosition)
  const updateSize = useWindowStore((s) => s.updateSize)

  if (!window || !window.isOpen) return null

  return (
    <Rnd
      position={window.position}
      size={window.size}
      style={{
        zIndex: window.zIndex,
        visibility: window.isMinimized ? 'hidden' : undefined,
        pointerEvents: window.isMinimized ? 'none' : undefined,
      }}
      dragHandleClassName="window-drag-handle"
      minWidth={400}
      minHeight={300}
      bounds="window"
      enableResizing={!window.isMaximized}
      disableDragging={window.isMaximized}
      onDragStop={(e, d) => {
        void e
        updatePosition(id, { x: d.x, y: d.y })
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        void e
        void direction
        void delta
        const newSize = { width: ref.offsetWidth, height: ref.offsetHeight }
        updateSize(id, newSize)
        updatePosition(id, { x: position.x, y: position.y })
      }}
      onMouseDown={() => focusApp(id)}
      className={styles.windowFrame}
    >
      <div className={styles.windowWrapper}>
        <div className={`${styles.windowTitleBar} window-drag-handle`}>
          <div className={styles.titleLeft}>
            {id === 'terminal' ? (
              <img
                className={styles.appIconImg}
                src="/terminal-window-icon.png"
                alt=""
                aria-hidden
              />
            ) : (
              <span className={styles.appIcon} aria-hidden="true" />
            )}
            <span className={styles.titleText}>{window.title}</span>
          </div>
          <div className={styles.titleRight}>
            <button
              type="button"
              className={`${styles.controlButton}`}
              onClick={() => minimizeApp(id)}
              aria-label="Minimize"
              title="Minimize"
            >
              −
            </button>
            <button
              type="button"
              className={`${styles.controlButton}`}
              onClick={() => maximizeApp(id)}
              aria-label="Maximize"
              title="Maximize"
            >
              □
            </button>
            <button
              type="button"
              className={`${styles.controlButton} ${styles.closeButton}`}
              onClick={() => closeApp(id)}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.windowContent}>{children}</div>
      </div>
    </Rnd>
  )
}
