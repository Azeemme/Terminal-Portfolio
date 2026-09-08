import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Project, ProjectAction } from '../../../data'
import ProjectMediaFrame from './ProjectMediaFrame'
import styles from './Portfolio.module.css'

interface Props {
  project: Project
  onBack: () => void
}

function Rail({ label }: { label: string }) {
  return (
    <div className={styles.rail}>
      <span className={styles.railLabel}>{label}</span>
      <span className={styles.railLine} />
    </div>
  )
}

function DetailAction({ action }: { action: ProjectAction }) {
  const cls = `${styles.btn} ${styles.btnSm} ${
    action.kind === 'primary'
      ? styles.btnPrimary
      : action.kind === 'ghost-teal'
        ? styles.btnGhostTeal
        : styles.btnSecondary
  }`
  return (
    <a className={cls} href={action.href} target="_blank" rel="noreferrer">
      {action.label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/** Highlights a URL fragment inside the demo notice, per the design. */
function DemoNotice({ text }: { text: string }) {
  const url = 'bioreactorxr.azeemme.com'
  const parts = text.split(url)
  return (
    <div className={styles.demoNotice}>
      {parts.length === 2 ? (
        <>
          {parts[0]}
          <span className={styles.accent}>{url}</span>
          {parts[1]}
        </>
      ) : (
        text
      )}
    </div>
  )
}

/**
 * Route-backed project detail, rendered as an internal Portfolio view (plan §2)
 * in the approved "project file" layout. Focus moves here on mount; Escape
 * returns to the project list (plan §10). Main content dominates the facts rail.
 */
export default function ProjectDetail({ project, onBack }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true })
  }, [project.slug])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
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
      className={styles.detailRoot}
      tabIndex={-1}
      role="region"
      aria-labelledby="project-detail-heading"
    >
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbTrail}>
          <Link to="/projects" className={styles.breadcrumbBack}>
            ← Projects
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbSlug}>{project.slug}</span>
        </div>
        {project.detailActions.length > 0 ? (
          <div className={styles.breadcrumbActions}>
            {project.detailActions.map((a) => (
              <DetailAction key={a.label} action={a} />
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <div className={styles.detailHeadingBlock}>
            <span className={styles.detailIndex}>
              {project.index} <span className={styles.slash}>/</span> {project.category}
            </span>
            <h1 id="project-detail-heading" className={styles.detailTitle}>
              {project.title}
            </h1>
            <p className={styles.detailSummary}>{project.summary}</p>
          </div>

          <div className={`${styles.panel} ${styles.detailCapture}`}>
            <ProjectMediaFrame media={project.media} caption={project.detailCaption} />
          </div>

          {project.demoNotice ? <DemoNotice text={project.demoNotice} /> : null}

          {project.systemFlow ? (
            <div className={styles.detailSection}>
              <Rail label="System flow" />
              <div className={styles.flow}>
                {project.systemFlow.map((cell) => (
                  <div key={cell.label} className={styles.flowCell}>
                    <span className={styles.flowLabel}>{cell.label}</span>
                    <span
                      className={`${styles.flowValue} ${cell.highlight ? styles.highlight : ''}`}
                    >
                      {cell.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {project.sections.map((s) => (
            <div key={s.heading} className={styles.detailSection}>
              <Rail label={s.heading} />
              <p className={styles.prose}>{s.body}</p>
            </div>
          ))}
        </div>

        <aside className={styles.factsRail}>
          <div className={styles.factsPanel}>
            <div className={styles.factsPanelTitle}>Project facts</div>
            {project.detailFacts.map((f) => (
              <div key={f.label} className={styles.railField}>
                <span className={styles.railFieldLabel}>{f.label}</span>
                <div className={`${styles.factCell} ${f.highlight ? styles.highlight : ''}`}>
                  {f.value}
                </div>
              </div>
            ))}
            {project.detailTechnologies.length > 0 ? (
              <div className={styles.railField}>
                <span className={styles.railFieldLabel}>Technology</span>
                <div className={styles.chips}>
                  {project.detailTechnologies.map((t) => (
                    <span key={t} className={styles.chip}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
