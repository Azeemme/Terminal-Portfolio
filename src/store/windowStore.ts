import { create } from 'zustand'

export interface AppWindow {
  id: string
  title: string
  isOpen: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  prevPosition?: { x: number; y: number }
  prevSize?: { width: number; height: number }
  isMaximized: boolean
}

export interface WindowStore {
  windows: Record<string, AppWindow>
  topZ: number
  openApp: (id: string) => void
  closeApp: (id: string) => void
  minimizeApp: (id: string) => void
  maximizeApp: (id: string) => void
  focusApp: (id: string) => void
  updatePosition: (id: string, pos: { x: number; y: number }) => void
  updateSize: (id: string, size: { width: number; height: number }) => void
}

export const DOCK_HEIGHT = 60

function centeredRect(maxW: number, maxH: number, marginX: number, marginY: number) {
  const width = Math.min(maxW, window.innerWidth - marginX * 2)
  const height = Math.min(maxH, window.innerHeight - DOCK_HEIGHT - marginY * 2)
  return {
    size: { width, height },
    position: {
      x: Math.max(0, Math.round((window.innerWidth - width) / 2)),
      y: Math.max(0, Math.round((window.innerHeight - DOCK_HEIGHT - height) / 2)),
    },
  }
}

// Larger approved Stage 2 default (design: 1250 × 858) while still visibly a window.
const portfolioRect = centeredRect(1250, 858, 32, 40)

const INITIAL_WINDOWS: Record<string, AppWindow> = {
  portfolio: {
    id: 'portfolio',
    title: 'Portfolio',
    // Opened by the route bridge based on the URL — not mounted invisibly (plan §3).
    isOpen: false,
    isMinimized: false,
    position: portfolioRect.position,
    size: portfolioRect.size,
    zIndex: 100,
    isMaximized: false,
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    // Registered but closed initially (plan §3); opened via route / dock.
    isOpen: false,
    isMinimized: false,
    position: {
      x: Math.round(window.innerWidth * 0.1),
      y: Math.round((window.innerHeight - DOCK_HEIGHT) * 0.1),
    },
    size: {
      width: Math.round(window.innerWidth * 0.8),
      height: Math.round((window.innerHeight - DOCK_HEIGHT) * 0.8),
    },
    zIndex: 100,
    isMaximized: false,
  },
  aichat: {
    id: 'aichat',
    title: 'AI Chat',
    isOpen: false,
    isMinimized: false,
    position: { x: 120, y: 80 },
    size: { width: 600, height: 500 },
    zIndex: 100,
    isMaximized: false,
  },
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: INITIAL_WINDOWS,
  topZ: 100,

  openApp: (id: string) => {
    const win = get().windows[id]
    if (!win) return

    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: true,
          isMinimized: false,
        },
      },
    }))

    get().focusApp(id)
  },

  closeApp: (id: string) => {
    const win = get().windows[id]
    if (!win) return

    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          prevPosition: undefined,
          prevSize: undefined,
        },
      },
    }))
  },

  minimizeApp: (id: string) => {
    const win = get().windows[id]
    if (!win) return

    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMinimized: true,
        },
      },
    }))
  },

  maximizeApp: (id: string) => {
    const win = get().windows[id]
    if (!win) return

    if (!win.isMaximized) {
      const prevPosition = win.position
      const prevSize = win.size

      set((state) => ({
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            prevPosition,
            prevSize,
            position: { x: 0, y: 0 },
            size: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            isMaximized: true,
          },
        },
      }))
      return
    }

    const restoreSize = win.prevSize ?? {
      width: Math.round(window.innerWidth * 0.8),
      height: Math.round((window.innerHeight - DOCK_HEIGHT) * 0.8),
    }
    const restorePos = win.prevPosition ?? {
      x: Math.round(window.innerWidth * 0.1),
      y: Math.round((window.innerHeight - DOCK_HEIGHT) * 0.1),
    }
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          position: restorePos,
          size: restoreSize,
          prevPosition: undefined,
          prevSize: undefined,
          isMaximized: false,
        },
      },
    }))
  },

  focusApp: (id: string) => {
    const win = get().windows[id]
    if (!win) return

    set((state) => ({
      topZ: state.topZ + 1,
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          zIndex: state.topZ + 1,
        },
      },
    }))
  },

  updatePosition: (id: string, pos: { x: number; y: number }) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          position: pos,
        },
      },
    }))
  },

  updateSize: (id: string, size: { width: number; height: number }) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          size,
        },
      },
    }))
  },
}))
