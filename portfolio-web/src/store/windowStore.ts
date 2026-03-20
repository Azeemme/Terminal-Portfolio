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

const INITIAL_WINDOWS: Record<string, AppWindow> = {
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    isOpen: true,
    isMinimized: false,
    position: { x: 80, y: 60 },
    size: { width: 720, height: 480 },
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
              height: window.innerHeight - DOCK_HEIGHT,
            },
            isMaximized: true,
          },
        },
      }))
      return
    }

    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          position: state.windows[id].prevPosition ?? state.windows[id].position,
          size: state.windows[id].prevSize ?? state.windows[id].size,
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
