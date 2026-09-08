import { Link } from 'react-router-dom'
import type { Project, ProjectAction } from '../../../data'
import ProjectMediaFrame from './ProjectMediaFrame'
import styles from './Portfolio.module.css'

interface Props {
  project: Project
  variant: 'flagship' | 'compact'
}

function ActionButton({ action }: { action: ProjectAction }) {
  const cls = `${styles.btn} ${
    action.kind === 'primary'
      ? styles.btnPrimary
      : action.kind === 'ghost-teal'
        ? styles.btnGhostTeal
        : styles.btnSecondary
  }`
  if (action.internal) {
    return (
      <Link to={action.href} className={cls}>
        {action.label}
      </Link>
    )
  }
  return (
    <a className={cls} href={action.href} target="_blank" rel="noreferrer">
      {action.label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/**
 * A featured-work card. The card is not a wrapping link (the design shows
 * explicit CTAs); the "View Project →" action is the shareable route link.
 */
export default function ProjectCard({ project, variant }: Props) {
  const cols = project.facts.length >= 3 ? '3' : '2'

  return (
    <article
      className={`${styles.panel} ${styles.card} ${
        variant === 'flagship' ? styles.flagshipCard : ''
      }`}
    >
      <div className={styles.cardMedia}>
        <ProjectMediaFrame media={project.media} />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardIndex}>
          <span>
            {project.index} <span className={styles.slash}>/</span> {project.category}
          </span>
          {project.tag ? <span className={styles.cardTag}>{project.tag}</span> : null}
        </div>

        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardSummary}>{project.cardSummary}</p>

        <div className={styles.factGrid} data-cols={cols}>
          {project.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <div className={`${styles.factCell} ${f.highlight ? styles.highlight : ''}`}>
                {f.value}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chips}>
          {project.technologies.map((t) => (
            <span key={t} className={styles.chip}>
              {t}
            </span>
          ))}
        </div>

        <div className={styles.actions}>
          {project.actions.map((a) => (
            <ActionButton key={a.label} action={a} />
          ))}
        </div>
      </div>
    </article>
  )
}
