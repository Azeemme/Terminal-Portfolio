import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Last-resort full-page fallback (plan §11 — a failed chunk load or render must
 * never leave a blank screen). Distinct from `AppErrorBoundary`, which isolates a
 * single desktop window.
 */
export default class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[root] unrecoverable render error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          background: 'linear-gradient(344deg, #0a1830, #1a2a4a, #0d3b66)',
          color: '#e6ebf2',
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        }}
      >
        <div
          role="alert"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ fontSize: '13px', color: '#aeb9c9', maxWidth: '40ch' }}>
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 18px',
              border: '1px solid #4ec9b0',
              borderRadius: '8px',
              background: 'transparent',
              color: '#4ec9b0',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            Reload
          </button>
          <a
            href="/"
            style={{
              padding: '10px 18px',
              border: '1px solid #3a4a63',
              borderRadius: '8px',
              color: '#e6ebf2',
              textDecoration: 'none',
            }}
          >
            Go to Portfolio
          </a>
        </div>
      </main>
    )
  }
}
