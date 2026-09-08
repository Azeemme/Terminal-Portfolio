import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** Name shown in the fallback, e.g. "Terminal". */
  appName: string
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Non-crashing fallback for an app whose module fails to load or throws while
 * rendering (plan §11 — "failed lazy-loaded apps have graceful non-crashing
 * states"). Keeps the desktop and other windows alive.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.appName}] failed to render`, error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '24px', color: '#d4d4d4', fontSize: '14px' }}>
          <p style={{ marginBottom: '8px' }}>
            {this.props.appName} could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: '#2a2a2a',
              color: '#d4d4d4',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
