import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

import { runBootSequence } from '../../../terminal/bootSequence'
import { commandRegistry, initializeCommands } from '../../../terminal/commandRegistry'
import type { DirEntry, TerminalContext } from '../../../terminal/types'
import { GITHUB_USERNAME } from '../../../terminal/filesystem/fakeFiles'
import styles from './Terminal.module.css'

function getPromptString(currentPath: string[]): string {
  const pathStr = currentPath.length === 1 ? '' : '/' + currentPath.slice(1).join('/')
  // green user@host, reset colon, cyan path, reset $
  return `\x1b[38;5;82mazeem@portfolio\x1b[0m:\x1b[38;5;39m~${pathStr}\x1b[0m$ `
}

function replaceInputLine(terminal: Terminal, promptStr: string, newBuffer: string) {
  terminal.write('\r\x1b[K' + promptStr + newBuffer)
}

export default function TerminalApp() {
  const terminalRef = useRef<Terminal | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const hasBooted = useRef(false)

  const dirCache = useRef<Map<string, DirEntry[]>>(new Map())

  // Mutable terminal state (not stored in xterm.js)
  const inputBuffer = useRef<string>('')
  const currentPath = useRef<string[]>(['~'])
  const history = useRef<string[]>([])
  const historyIndex = useRef<number>(history.current.length)
  const promptString = useRef<string>(getPromptString(['~']))

  function buildContext(t: Terminal): TerminalContext {
    return {
      terminal: t,
      currentPath: currentPath.current,
      setCurrentPath: (path: string[]) => {
        currentPath.current = path
        promptString.current = getPromptString(path)
      },
      writeOutput: (text: string) => {
        t.write(text + '\r\n')
      },
      writeError: (text: string) => {
        t.write('\x1b[2m' + text + '\x1b[0m\r\n')
      },
      getCachedDir: (pathKey: string) => dirCache.current.get(pathKey) || null,
      setCachedDir: (pathKey: string, entries: DirEntry[]) => {
        dirCache.current.set(pathKey, entries)
      },
      username: import.meta.env.VITE_GITHUB_USERNAME || GITHUB_USERNAME,
      token: import.meta.env.VITE_GITHUB_TOKEN || '',
    }
  }

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return

    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
      fontSize: 14,
      lineHeight: 1.0,
      theme: {
        background: '#1a1a1a',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        cursorAccent: '#1a1a1a',
        black: '#1a1a1a',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#d7ba7d',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f44747',
        brightGreen: '#b5cea8',
        brightYellow: '#d7ba7d',
        brightBlue: '#9cdcfe',
        brightMagenta: '#c586c0',
        brightCyan: '#4ec9b0',
        brightWhite: '#ffffff',
      },
      scrollback: 1000,
      allowTransparency: false,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)
    terminal.open(containerRef.current)
    fitAddon.fit()

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    function printPrompt(t: Terminal, path: string[]) {
      promptString.current = getPromptString(path)
      t.write(promptString.current)
    }

    async function executeCommand(input: string, ctx: TerminalContext) {
      const parts = input.trim().split(/\s+/)
      const name = parts[0]
      const args = parts.slice(1)

      if (!name) {
        return
      }

      const command = commandRegistry[name]
      if (!command) {
        ctx.writeError(`bash: ${name}: command not found`)
        return
      }

      await command.execute(args, ctx)
    }

    initializeCommands()

    if (!hasBooted.current) {
      hasBooted.current = true
      runBootSequence(terminal)
    }

    printPrompt(terminal, currentPath.current)

    terminal.onData((data) => {
      // Printable characters (0x20–0x7e)
      if (data.length === 1) {
        const code = data.charCodeAt(0)
        if (code >= 0x20 && code <= 0x7e) {
          inputBuffer.current += data
          terminal.write(data)
          return
        }
      }

      // Enter (\r)
      if (data === '\r') {
        terminal.write('\r\n')
        const input = inputBuffer.current.trim()
        inputBuffer.current = ''

        if (input) {
          const last = history.current[history.current.length - 1]
          if (last !== input) {
            history.current.push(input)
            if (history.current.length > 500) history.current.shift()
          }

          const ctx = buildContext(terminal)
          executeCommand(input, ctx).then(() => {
            printPrompt(terminal, currentPath.current)
          })
        } else {
          printPrompt(terminal, currentPath.current)
        }

        historyIndex.current = history.current.length
        return
      }

      // Backspace (\x7f)
      if (data === '\x7f') {
        if (inputBuffer.current.length === 0) return
        inputBuffer.current = inputBuffer.current.slice(0, -1)
        terminal.write('\b \b')
        return
      }

      // Up arrow (\x1b[A)
      if (data === '\x1b[A') {
        if (history.current.length === 0) return
        historyIndex.current = Math.max(0, historyIndex.current - 1)
        inputBuffer.current = history.current[historyIndex.current] || ''
        replaceInputLine(terminal, promptString.current, inputBuffer.current)
        return
      }

      // Down arrow (\x1b[B)
      if (data === '\x1b[B') {
        if (historyIndex.current >= history.current.length) return // already at bottom
        historyIndex.current += 1
        inputBuffer.current =
          historyIndex.current < history.current.length
            ? history.current[historyIndex.current]
            : ''
        replaceInputLine(terminal, promptString.current, inputBuffer.current)
        return
      }

      // Tab (\t) — autocomplete logic (FR-041 through FR-046)
      if (data === '\t') {
        const buffer = inputBuffer.current
        if (!buffer) return // empty buffer -- do nothing

        const parts = buffer.split(/\s+/)
        const isCommandPosition = parts.length <= 1

        function handleAutocompleteResult(
          terminalInstance: Terminal,
          candidates: string[],
          partial: string,
          fullBuffer: string,
          isCommand: boolean,
        ) {
          if (candidates.length === 0) {
            // FR-046: zero matches -- do nothing
            return
          }

          if (candidates.length === 1) {
            // FR-044: exactly one match
            const match = candidates[0]
            let suffix = ''

            if (!isCommand) {
              const pathKey = currentPath.current.join('/')
              const cached = dirCache.current.get(pathKey)
              const entry = cached?.find((e) => e.name === match)
              if (entry?.type === 'dir') suffix = '/'
            }

            // Replace the partial token in the buffer with the full match
            const beforePartial = fullBuffer.slice(0, fullBuffer.length - partial.length)
            inputBuffer.current = beforePartial + match + suffix
            replaceInputLine(terminalInstance, promptString.current, inputBuffer.current)
            return
          }

          // FR-045: multiple matches
          terminalInstance.write('\r\n')
          terminalInstance.write(candidates.join('  ') + '\r\n')
          // Reprint prompt with current buffer (unmodified)
          terminalInstance.write(promptString.current + fullBuffer)
        }

        if (isCommandPosition) {
          // Command-name autocomplete (FR-042)
          const partial = parts[0] || ''
          const candidates = Object.keys(commandRegistry).filter((name) => name.startsWith(partial))
          handleAutocompleteResult(terminal, candidates, partial, buffer, true)
        } else {
          // Argument autocomplete (FR-043)
          const partial = parts[parts.length - 1] || ''
          const pathKey = currentPath.current.join('/')
          const cached = dirCache.current.get(pathKey)
          if (!cached) return // no cached entries -- do NOT trigger network request (FR-043)

          const candidates = cached.map((e) => e.name).filter((name) => name.startsWith(partial))
          handleAutocompleteResult(terminal, candidates, partial, buffer, false)
        }
        return
      }

      // Ctrl+C (\x03)
      if (data === '\x03') {
        terminal.write('^C\r\n')
        inputBuffer.current = ''
        historyIndex.current = history.current.length
        printPrompt(terminal, currentPath.current)
        return
      }

      // Ctrl+L (\x0c)
      if (data === '\x0c') {
        terminal.write('\r\x1b[K') // clear current line before wiping screen
        terminal.clear()
        inputBuffer.current = ''
        runBootSequence(terminal)
        printPrompt(terminal, currentPath.current)
        return
      }
    })

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          fitAddonRef.current?.fit()
        } catch {
          // ignore
        }
      })
    })
    observer.observe(containerRef.current)

    return () => {
      hasBooted.current = false // reset so next mount runs boot
      observer.disconnect()
      terminal.dispose()
      terminalRef.current = null
    }
  }, [])

  return <div ref={containerRef} className={styles.terminalContainer} />
}
