import React from 'react'
import { Rnd } from 'react-rnd'
import { useWindowStore } from '../../store/windowStore'
import { useRouteControls } from '../../routing/useRouteControls'
import styles from './Window.module.css'

interface WindowProps {
  id: string
  children: React.ReactNode
}

export default function Window({ id, children }: WindowProps) {
  const win = useWindowStore((s) => s.windows[id])
  const focusApp = useWindowStore((s) => s.focusApp)
  const minimizeApp = useWindowStore((s) => s.minimizeApp)
  const maximizeApp = useWindowStore((s) => s.maximizeApp)
  const updatePosition = useWindowStore((s) => s.updatePosition)
  const updateSize = useWindowStore((s) => s.updateSize)
  const { focusWindow, closeWindow } = useRouteControls()

  if (!win || !win.isOpen) return null

  // Title-bar controls: raise the window (z-order) without triggering a route
  // navigation. `stopPropagation` also blocks react-rnd's drag-start and the
  // frame's `focusWindow` (which would navigate on a background window) — so the
  // explicit `focusApp` here restores baseline "click the title bar to raise".
  const raiseOnly = (e: React.MouseEvent) => {
    e.stopPropagation()
    focusApp(id)
  }

  return (
    <Rnd
      position={win.position}
      size={win.size}
      style={{
        zIndex: win.zIndex,
        visibility: win.isMinimized ? 'hidden' : undefined,
        pointerEvents: win.isMinimized ? 'none' : undefined,
      }}
      dragHandleClassName="window-drag-handle"
      minWidth={400}
      minHeight={300}
      bounds="window"
      enableResizing={!win.isMaximized}
      disableDragging={win.isMaximized}
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
      onMouseDown={() => focusWindow(id)}
      onFocusCapture={() => focusWindow(id)}
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
            <span className={styles.titleText}>{win.title}</span>
          </div>
          <div className={styles.titleRight} onMouseDown={raiseOnly}>
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
              onClick={() => closeWindow(id)}
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
