import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  profile,
  experience,
  contactLinks,
  featuredProjects,
  getProject,
  links,
} from '../../../data'
import { useRouteControls } from '../../../routing/useRouteControls'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'
import styles from './Portfolio.module.css'

interface Props {
  /** Mobile bypass (plan §6): render inline with document scrolling, no window chrome. */
  bare?: boolean
}

const Dot = () => <span className={styles.dot} aria-hidden="true"> · </span>

export default function Portfolio({ bare = false }: Props) {
  const { route, goToPrimary } = useRouteControls()
  const { pathname } = useLocation()
  const projectsHeadingRef = useRef<HTMLHeadingElement>(null)
  const rootRef = useRef<HTMLElement>(null)

  const backToList = useCallback(
    () => goToPrimary('portfolio', 'projects'),
    [goToPrimary],
  )

  const onProjectsSection =
    route.type === 'portfolio' && route.section === 'projects'
  useEffect(() => {
    if (onProjectsSection) projectsHeadingRef.current?.focus({ preventScroll: true })
  }, [onProjectsSection])

  useEffect(() => {
    if (bare) window.scrollTo({ top: 0 })
    else rootRef.current?.scrollTo({ top: 0 })
  }, [pathname, bare])

  const shell = (children: ReactNode) => (
    <main
      id="main"
      tabIndex={-1}
      aria-label="Portfolio"
      className={bare ? styles.rootBare : styles.root}
      ref={rootRef}
    >
      {children}
    </main>
  )

  if (route.type === 'project') {
    const project = getProject(route.slug)
    if (project) {
      return shell(<ProjectDetail project={project} onBack={backToList} />)
    }
  }

  if (route.type === 'project' || route.type === 'project-not-found') {
    return shell(
      <div className={styles.notFound}>
        <Link to="/projects" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
          ← Back to projects
        </Link>
        <h1 className={styles.detailTitle}>Project not found</h1>
        <p className={styles.prose}>
          There’s no project at that address. It may have been renamed or removed.
        </p>
      </div>,
    )
  }

  const featured = featuredProjects()

  return shell(
    <>
      <div className={styles.appHeader}>
        <div className={styles.appHeaderId}>
          <span className={styles.appHeaderTick} aria-hidden="true" />
          <span className={styles.appHeaderLabel}>Work Index</span>
          <span className={styles.appHeaderMeta}>
            <span className={styles.dot}>·</span> Purdue CIT{' '}
            <span className={styles.dot}>·</span>{' '}
            {profile.location.replace('Indiana', 'IN')}
          </span>
        </div>
        <div className={styles.appHeaderActions}>
          <a
            className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
            href={links.resume.href}
            target="_blank"
            rel="noreferrer"
          >
            Resume ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
            href={links.linkedin.href}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>

      <div className={styles.inner}>
        {/* ---- profile ---- */}
        <section className={styles.section} aria-labelledby="pf-profile">
          <div className={styles.rail}>
            <span id="pf-profile" className={styles.railLabel}>
              Profile
            </span>
            <span className={styles.railLine} />
          </div>

          <div className={`${styles.panel} ${styles.profilePanel}`}>
            <div className={styles.profileMain}>
              <h1 className={styles.name}>{profile.name}</h1>
              <div className={styles.role}>{profile.title}</div>
              <div className={styles.tagline}>
                {profile.focusAreas.map((a, i) => (
                  <span key={a}>
                    {i > 0 ? <Dot /> : null}
                    {a}
                  </span>
                ))}
              </div>
              <p className={styles.intro}>{profile.intro}</p>
            </div>

            <dl className={styles.profileFacts}>
              <div className={styles.profileField}>
                <dt className={styles.fieldLabel}>School</dt>
                <dd className={styles.fieldValue}>
                  Purdue University{' '}
                  <span className={styles.muted}>— Computer Information Technology</span>
                </dd>
              </div>
              <div className={styles.profileField}>
                <dt className={styles.fieldLabel}>Based</dt>
                <dd className={styles.fieldValue}>{profile.facts.based}</dd>
              </div>
              <div className={styles.profileField}>
                <dt className={styles.fieldLabel}>Now</dt>
                <dd className={styles.fieldValue}>
                  {profile.facts.now.role}
                  <br />
                  <span className={styles.link}>{profile.facts.now.org}</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <div className={styles.divider} />

        {/* ---- featured work ---- */}
        <section className={styles.section} aria-labelledby="pf-featured">
          <div className={styles.rail}>
            <h2 id="pf-featured" className={styles.railLabel} ref={projectsHeadingRef} tabIndex={-1}>
              Featured work
            </h2>
            <span className={styles.railLine} />
            <span className={styles.railCount}>01 of {String(featured.length).padStart(2, '0')}</span>
          </div>

          {featured[0] ? <ProjectCard project={featured[0]} variant="flagship" /> : null}

          {featured.length > 1 ? (
            <div className={styles.compactGrid}>
              {featured.slice(1).map((project) => (
                <ProjectCard key={project.slug} project={project} variant="compact" />
              ))}
            </div>
          ) : null}
        </section>

        <div className={styles.divider} />

        {/* ---- experience / about / contact ---- */}
        <div className={styles.lowerGrid}>
          <section className={styles.section} aria-labelledby="pf-experience">
            <div className={styles.rail}>
              <h2 id="pf-experience" className={styles.railLabel}>
                Experience
              </h2>
              <span className={styles.railLine} />
            </div>
            <div className={styles.xpList}>
              {experience.map((entry) => (
                <div key={entry.id} className={styles.xpEntry}>
                  <div className={styles.xpHead}>
                    <h3 className={styles.xpRole}>{entry.role}</h3>
                    <span className={styles.xpDate}>
                      {entry.start} —{entry.end ? ` ${entry.end}` : ''}
                    </span>
                  </div>
                  <div className={styles.xpOrg}>
                    {entry.organization}
                    {entry.current ? (
                      <>
                        {' '}
                        <span className={styles.sep}>·</span>{' '}
                        <span className={styles.current}>Current</span>
                      </>
                    ) : null}
                  </div>
                  <p className={styles.xpSummary}>{entry.summary}</p>
                </div>
              ))}
              <a
                className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                href={links.resume.href}
                target="_blank"
                rel="noreferrer"
                style={{ alignSelf: 'flex-start', marginTop: '12px' }}
              >
                Full resume ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="pf-about">
            <div className={styles.rail}>
              <h2 id="pf-about" className={styles.railLabel}>
                About
              </h2>
              <span className={styles.railLine} />
            </div>
            <p className={styles.prose}>{profile.about}</p>
          </section>

          <section className={styles.section} aria-labelledby="pf-contact">
            <div className={styles.rail}>
              <h2 id="pf-contact" className={styles.railLabel}>
                Contact
              </h2>
              <span className={styles.railLine} />
            </div>
            <div className={styles.contactList}>
              {contactLinks.map((link) => (
                <a
                  key={link.href}
                  className={styles.contactLink}
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {link.label} <span aria-hidden="true">↗</span>
                  {link.external ? (
                    <span className="sr-only"> (opens in a new tab)</span>
                  ) : null}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>,
  )
}
