import { Link } from 'react-router-dom'
import { profile } from '../../data/profile'
import { links } from '../../data/links'
import styles from './Hi.module.css'

/**
 * `/hi` — lightweight networking card (plan §14). Mobile-first, one tap to
 * Résumé / LinkedIn / Portfolio. Intentionally imports nothing from the desktop
 * shell, Window, Terminal, or the full data barrel.
 */
export default function Hi() {
  return (
    <main className={styles.page}>
      <h1 className={styles.name}>{profile.name}</h1>
      <p className={styles.title}>{profile.title}</p>
      <p className={styles.tagline}>{profile.tagline}</p>
      <p className={styles.edu}>{profile.education}</p>

      <nav className={styles.links} aria-label="Contact and profile links">
        <Link to="/" className={`${styles.link} ${styles.primary}`}>
          Portfolio
        </Link>
        <a
          className={`${styles.link} ${styles.primary}`}
          href={links.resume.href}
          target="_blank"
          rel="noreferrer"
        >
          Résumé <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a className={styles.link} href={links.linkedin.href} target="_blank" rel="noreferrer">
          LinkedIn <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a className={styles.link} href={links.github.href} target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a className={styles.link} href={links.email.href}>
          Email
        </a>
      </nav>
    </main>
  )
}
