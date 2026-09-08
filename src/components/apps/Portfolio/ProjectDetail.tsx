import { useEffect, useRef } from 'react'
import type { Project } from '../../../data'
import styles from './Portfolio.module.css'

interface Props {
  project: Project
  onBack: () => void
}

/**
 * Route-backed project detail rendered as an internal Portfolio view (plan §2).
 * Focus moves here on mount; Escape returns to the project list (plan §10).
 */
export default function ProjectDetail({ project, onBack }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [project.slug])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Scoped to the detail subtree: Escape only closes when focus is within the
    // detail view, so it never collides with the AI modal or the Terminal (§10).
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onBack()
      }
    }
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [onBack])

  return (
    <div
      ref={containerRef}
      className={styles.detail}
      tabIndex={-1}
      role="group"
      aria-labelledby="project-detail-heading"
    >
      <button type="button" className={styles.backButton} onClick={onBack}>
        ← Back to projects
      </button>

      <div>
        <h2 id="project-detail-heading" className={styles.detailHeading}>
          {project.title}
        </h2>
        <div className={styles.detailMeta}>
          <span>{project.category}</span>
          <span>{project.role}</span>
          <span>{project.date}</span>
        </div>
      </div>

      <div className={styles.detailMedia} aria-hidden="true">
        {project.media[0]?.alt ?? 'media placeholder'}
      </div>

      <p className={styles.prose}>{project.summary}</p>

      {project.desktopOnlyDemo ? (
        <div className={styles.demoCallout}>
          <strong>Desktop Demo.</strong> This demo is built for a desktop browser with a
          keyboard and mouse. {project.demoUrl ? null : 'The public demo link is coming in Stage 2.'}
          {project.demoUrl ? (
            <>
              {' '}
              <a href={project.demoUrl} target="_blank" rel="noreferrer">
                Open the Desktop Demo <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      {project.technologies.length > 0 ? (
        <section className={styles.detailSection}>
          <h3>Technologies</h3>
          <div className={styles.techRow}>
            {project.technologies.map((t) => (
              <span key={t} className={styles.tech}>
                {t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {project.sections.map((s) => (
        <section key={s.heading} className={styles.detailSection}>
          <h3>{s.heading}</h3>
          <p>{s.body}</p>
        </section>
      ))}

      {project.links.length > 0 ? (
        <section className={styles.detailSection}>
          <h3>Links</h3>
          <div className={styles.contactLinks}>
            {project.links.map((l) => (
              <a
                key={l.href}
                className={styles.contactLink}
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {l.label}
                {l.external ? (
                  <>
                    {' '}
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </>
                ) : null}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {project.placeholder ? (
        <p className={styles.placeholderNote}>
          Placeholder content — the finalized case study is added in Stage 2.
        </p>
      ) : null}
    </div>
  )
}
