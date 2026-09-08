import { Link } from 'react-router-dom'
import styles from '../routes/StandalonePage.module.css'

/**
 * `/terminal` on a phone/small tablet (plan §6). The terminal is desktop-only;
 * this is a lightweight state with a one-tap route back to Portfolio. It never
 * loads xterm.js.
 */
export default function TerminalUnavailable() {
  return (
    <main className={styles.page}>
      <div className={styles.code} aria-hidden="true">
        &gt;_
      </div>
      <h1 className={styles.title}>The Terminal is built for desktop</h1>
      <p className={styles.text}>
        It needs a keyboard and a larger screen. Everything it shows — projects,
        experience, links — is on the Portfolio too.
      </p>
      <nav className={styles.actions}>
        <Link to="/" className={`${styles.link} ${styles.linkPrimary}`}>
          Go to Portfolio
        </Link>
      </nav>
    </main>
  )
}
