import { useState } from 'react'
import type { ProjectMedia } from '../../../data'
import styles from './Portfolio.module.css'

interface Props {
  media: ProjectMedia
  /** Overlay caption (falls back to `media.caption`). */
  caption?: string
  className?: string
}

/**
 * Capture panel with an overlay caption. Self-healing: if the image file is
 * missing (the approved design assets could not be pulled into the repo — see
 * docs/portfolio-revamp-status.md), it degrades to a labelled graph-paper
 * placeholder with no broken image and no layout shift.
 */
export default function ProjectMediaFrame({ media, caption, className }: Props) {
  const [failed, setFailed] = useState(false)
  const cap = caption ?? media.caption
  const cls = className ? `${styles.capture} ${className}` : styles.capture

  return (
    <div className={cls}>
      {failed ? (
        <div className={styles.captureFallback} role="img" aria-label={media.alt}>
          <span aria-hidden="true">{media.alt}</span>
        </div>
      ) : (
        <img
          className={styles.captureImg}
          src={media.src}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          style={media.objectPosition ? { objectPosition: media.objectPosition } : undefined}
          onError={() => setFailed(true)}
        />
      )}
      {cap ? <span className={styles.captureCaption}>{cap}</span> : null}
    </div>
  )
}
