import { useEffect, useRef, useState } from 'react'
import { useWindowStore } from '../../store/windowStore'
import { useRouteControls } from '../../routing/useRouteControls'
import { RESUME_PATH } from '../../data'
import styles from './Dock.module.css'

export default function Dock() {
  const windows = useWindowStore((s) => s.windows)
  const { route, currentPrimary, goToPrimary } = useRouteControls()
  const isHidden = Object.values(windows).some((w) => w.isOpen && w.isMaximized)
  const [showModal, setShowModal] = useState(false)
  const aiButtonRef = useRef<HTMLButtonElement>(null)
  const closeModalRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!showModal) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Consume Escape so it does not also reach a project detail's handler.
        e.stopPropagation()
        setShowModal(false)
        aiButtonRef.current?.focus()
      }
    }
    // Capture phase so the modal wins Escape regardless of listener order.
    window.addEventListener('keydown', onKeyDown, true)
    closeModalRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [showModal])

  const closeModal = () => {
    setShowModal(false)
    aiButtonRef.current?.focus()
  }

  const portfolioActive =
    currentPrimary === 'portfolio' || windows.portfolio?.isOpen
  const terminalActive = currentPrimary === 'terminal' || windows.terminal?.isOpen

  return (
    <>
      <nav
        className={`${styles.dock}${isHidden ? ` ${styles.dockHidden}` : ''}`}
        aria-label="Application dock"
      >
        <button
          type="button"
          className={`${styles.iconButton}${
            currentPrimary === 'portfolio' ? ` ${styles.iconButtonActive}` : ''
          }`}
          aria-label="Portfolio"
          aria-pressed={currentPrimary === 'portfolio'}
          title="Portfolio"
          onClick={() => goToPrimary('portfolio', route.type === 'project' ? 'projects' : null)}
        >
          <span aria-hidden="true">▤</span>
          {portfolioActive ? <span className={styles.indicator} /> : null}
        </button>

        <button
          type="button"
          className={`${styles.iconButton}${
            currentPrimary === 'terminal' ? ` ${styles.iconButtonActive}` : ''
          }`}
          aria-label="Terminal"
          aria-pressed={currentPrimary === 'terminal'}
          title="Terminal"
          onClick={() => goToPrimary('terminal')}
        >
          <span className={styles.mono} aria-hidden="true">&gt;_</span>
          {terminalActive ? <span className={styles.indicator} /> : null}
        </button>

        <span className={styles.dockDivider} aria-hidden="true" />

        <a
          className={styles.iconButton}
          href={RESUME_PATH}
          target="_blank"
          rel="noreferrer"
          aria-label="Resume (opens in a new tab)"
          title="Resume"
        >
          <span aria-hidden="true">⤓</span>
        </a>

        <button
          ref={aiButtonRef}
          type="button"
          className={`${styles.iconButton} ${styles.iconButtonMuted}`}
          aria-label="AI Chat"
          aria-haspopup="dialog"
          aria-expanded={showModal}
          title="AI Chat"
          onClick={() => setShowModal(true)}
        >
          <span className={styles.mono} aria-hidden="true">AI</span>
        </button>
      </nav>

      {showModal ? (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-modal-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // Minimal focus containment: the modal has one control (plan §10).
              if (e.key === 'Tab') {
                e.preventDefault()
                closeModalRef.current?.focus()
              }
            }}
          >
            <div className={styles.modalHeader}>
              <h2 id="ai-modal-title" className={styles.modalTitle}>AI Chat — Coming Soon</h2>
              <button
                ref={closeModalRef}
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
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
