import { Link } from 'react-router-dom'
import { RESUME_PATH } from '../../data'
import styles from './StandalonePage.module.css'

/** 404 for unknown routes (plan §11). Rendered outside the desktop shell. */
export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>
        That route doesn’t exist. Head back to the portfolio to explore featured work.
      </p>
      <nav className={styles.actions}>
        <Link to="/" className={`${styles.link} ${styles.linkPrimary}`}>
          Go to Portfolio
        </Link>
        <Link to="/terminal" className={styles.link}>
          Open Terminal
        </Link>
        <a
          className={styles.link}
          href={RESUME_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Resume <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </nav>
    </main>
  )
}
