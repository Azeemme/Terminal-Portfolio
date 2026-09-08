import type { Terminal } from '@xterm/xterm'
import { ASCII_ART } from '../assets/ascii-art'
import { profile } from '../data/profile'
import {
  GITHUB_URL,
  LINKEDIN_URL,
  EMAIL_ADDRESS,
  PORTFOLIO_PHOTO_URL,
} from './filesystem/fakeFiles'

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^mailto:/, '').replace(/\/$/, '')
}

const ART_VISIBLE_WIDTH = 71 // visible char width of the art (no ANSI codes)
const COL_GAP = 4            // gap between art and info panel
const ANSI_ESCAPE = String.fromCharCode(0x1b)

// Strip ANSI escape codes to get visible character count
function visibleLength(line: string): number {
  return line.replace(new RegExp(`${ANSI_ESCAPE}\\[[0-9;]*m`, 'g'), '').length
}

// Colorize a string with an ANSI 256 color
function c(code: number, text: string): string {
  return `\x1b[38;5;${code}m${text}\x1b[0m`
}

function buildInfoLines(): string[] {
  return [
    '',
    c(82, profile.name),
    c(238, '─'.repeat(Math.max(14, profile.name.length))),
    '',
    `${c(82, 'Role')}     ${c(255, profile.title)}`,
    `         ${c(255, profile.tagline)}`,
    '',
    `${c(82, 'GitHub')}   ${c(39, stripScheme(GITHUB_URL))}`,
    `${c(82, 'LinkedIn')} ${c(39, stripScheme(LINKEDIN_URL))}`,
    `${c(82, 'Email')}    ${c(39, stripScheme(EMAIL_ADDRESS))}`,
    `${c(82, 'Photos')}   ${c(39, stripScheme(PORTFOLIO_PHOTO_URL))}`,
    '',
    c(238, '─'.repeat(30)),
    '',
    `${c(240, "Type")} ${c(255, "'help'")} ${c(240, 'to see available commands')}`,
    '',
    `  ${c(82, 'whoami')}      ${c(240, 'about me')}`,
    `  ${c(82, 'projects')}    ${c(240, 'featured work')}`,
    `  ${c(82, 'experience')}  ${c(240, 'work & research')}`,
    `  ${c(82, 'skills')}      ${c(240, 'focus areas & tech')}`,
    `  ${c(82, 'ls')}          ${c(240, 'browse repos')}`,
    `  ${c(82, 'open')}        ${c(240, 'github | linkedin | resume')}`,
    `  ${c(82, 'sudo')}        ${c(240, 'easter eggs')}`,
  ]
}

// Runs once per Terminal mount (guarded by hasBooted in Terminal.tsx).
export function runBootSequence(terminal: Terminal): void {
  const artLines = ASCII_ART.split(/\r?\n/)
  const infoLines = buildInfoLines()
  const totalRows = Math.max(artLines.length, infoLines.length)

  for (let i = 0; i < totalRows; i++) {
    const artLine  = artLines[i]  ?? ''
    const infoLine = infoLines[i] ?? ''

    // Pad art column to fixed width, then write info alongside
    const artPad = ART_VISIBLE_WIDTH - visibleLength(artLine) + COL_GAP
    terminal.write(artLine + '\x1b[0m' + ' '.repeat(Math.max(0, artPad)) + infoLine + '\r\n')
  }

  terminal.write('\r\n')
}
