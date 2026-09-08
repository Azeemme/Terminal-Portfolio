import type { Project } from '../../../data'
import styles from './Portfolio.module.css'

interface Props {
  project: Project
  onOpen: (slug: string) => void
}

const STATUS_LABEL: Record<Project['status'], string | null> = {
  public: null,
  hidden: null,
  'coming-soon': 'Coming soon',
}

export default function ProjectCard({ project, onOpen }: Props) {
  const badge = STATUS_LABEL[project.status]

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onOpen(project.slug)}
      aria-label={`${project.title} — ${project.category}. Open project details.`}
    >
      <span className={styles.cardMedia} aria-hidden="true">
        media placeholder
      </span>
      <span className={styles.cardTitleRow}>
        <span className={styles.cardTitle}>{project.title}</span>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </span>
      <span className={styles.cardCategory}>{project.category}</span>
      <span className={styles.cardSummary}>{project.summary}</span>
    </button>
  )
}
