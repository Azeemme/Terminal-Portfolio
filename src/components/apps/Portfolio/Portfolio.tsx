import { useCallback, useEffect, useRef } from 'react'
import {
  profile,
  experience,
  contactLinks,
  featuredProjects,
  getProject,
  links,
} from '../../../data'
import { useLocation } from 'react-router-dom'
import { useRouteControls } from '../../../routing/useRouteControls'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'
import styles from './Portfolio.module.css'

export default function Portfolio() {
  const { route, openProject, goToPrimary } = useRouteControls()
  const { pathname } = useLocation()
  const projectsHeadingRef = useRef<HTMLHeadingElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const backToList = useCallback(
    () => goToPrimary('portfolio', 'projects'),
    [goToPrimary],
  )

  // On /projects, move focus/scroll to the project list (plan §10).
  const onProjectsSection =
    route.type === 'portfolio' && route.section === 'projects'
  useEffect(() => {
    if (onProjectsSection) projectsHeadingRef.current?.focus()
  }, [onProjectsSection])

  // Reset scroll on any Portfolio URL change (home ⇆ list ⇆ any detail).
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  if (route.type === 'project') {
    const project = getProject(route.slug)
    if (project) {
      return (
        <div className={styles.root} ref={rootRef}>
          <div className={styles.inner}>
            <ProjectDetail project={project} onBack={backToList} />
          </div>
        </div>
      )
    }
  }

  if (route.type === 'project' || route.type === 'project-not-found') {
    return (
      <div className={styles.root} ref={rootRef}>
        <div className={styles.inner}>
          <div className={styles.detail}>
            <button type="button" className={styles.backButton} onClick={backToList}>
              ← Back to projects
            </button>
            <h2 className={styles.detailHeading}>Project not found</h2>
            <p className={styles.prose}>
              There’s no project at that address. It may have been renamed or removed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const featured = featuredProjects()

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.positioning}>
            {profile.title} <span aria-hidden="true">/</span> {profile.tagline}
          </p>
          <p className={styles.intro}>{profile.intro}</p>
          <div className={styles.actions}>
            <a
              className={`${styles.action} ${styles.actionPrimary}`}
              href={links.resume.href}
              target="_blank"
              rel="noreferrer"
            >
              Resume <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              className={styles.action}
              href={links.linkedin.href}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="portfolio-featured">
          <h2 id="portfolio-featured" className={styles.sectionHeading} ref={projectsHeadingRef} tabIndex={-1}>
            Featured work
          </h2>
          <div className={styles.cardGrid}>
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} onOpen={openProject} />
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="portfolio-experience">
          <h2 id="portfolio-experience" className={styles.sectionHeading}>
            Experience
          </h2>
          <div className={styles.list}>
            {experience.map((entry) => (
              <div key={entry.id}>
                <div className={styles.entryRole}>{entry.role}</div>
                <div className={styles.entryOrg}>{entry.organization}</div>
                <p className={styles.entrySummary}>{entry.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="portfolio-about">
          <h2 id="portfolio-about" className={styles.sectionHeading}>
            About
          </h2>
          <p className={styles.prose}>{profile.about}</p>
          <p className={styles.prose}>{profile.education}</p>
        </section>

        <section className={styles.section} aria-labelledby="portfolio-contact">
          <h2 id="portfolio-contact" className={styles.sectionHeading}>
            Contact
          </h2>
          <div className={styles.contactLinks}>
            {contactLinks.map((link) => (
              <a
                key={link.href}
                className={styles.contactLink}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {link.label}
                {link.external ? (
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
      </div>
    </div>
  )
}
