import { useEffect } from 'react'
import { RESUME_PATH } from '../../data'
import styles from './StandalonePage.module.css'

/**
 * Optional lowercase `/resume` → static `/Resume.pdf` (plan §7). Uses a real
 * document navigation (not the SPA router) so the browser fetches the asset.
 */
export default function ResumeRedirect() {
  useEffect(() => {
    window.location.replace(RESUME_PATH)
  }, [])

  return (
    <main className={styles.page}>
      <p className={styles.text}>
        Opening the résumé… If nothing happens,{' '}
        <a className={styles.link} href={RESUME_PATH}>
          open it directly
        </a>
        .
      </p>
    </main>
  )
}
