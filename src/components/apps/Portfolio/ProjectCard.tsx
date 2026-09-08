import { Link } from 'react-router-dom'
import type { Project } from '../../../data'
import styles from './Portfolio.module.css'

interface Props {
  project: Project
}

const STATUS_LABEL: Record<Project['status'], string | null> = {
  public: null,
  hidden: null,
  'coming-soon': 'Coming soon',
}

/**
 * A project card is a real link to `/projects/:slug` (plan §5 — project details
 * are route-backed and shareable). The heading inside keeps the "Featured work"
 * section navigable by heading.
 */
export default function ProjectCard({ project }: Props) {
  const badge = STATUS_LABEL[project.status]

  return (
    <Link to={`/projects/${project.slug}`} className={styles.card}>
      <span className={styles.cardMedia} aria-hidden="true">
        media placeholder
      </span>
      <span className={styles.cardTitleRow}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </span>
      <span className={styles.cardCategory}>{project.category}</span>
      <span className={styles.cardSummary}>{project.summary}</span>
    </Link>
  )
}
