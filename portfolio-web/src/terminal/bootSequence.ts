import type { Terminal } from '@xterm/xterm'
import { ASCII_ART } from '../assets/ascii-art'

const ART_VISIBLE_WIDTH = 71 // visible char width of the art (no ANSI codes)
const COL_GAP = 4            // gap between art and info panel

// Strip ANSI escape codes to get visible character count
function visibleLength(line: string): number {
  return line.replace(/\x1b\[[0-9;]*m/g, '').length
}

// Colorize a string with an ANSI 256 color
function c(code: number, text: string): string {
  return `\x1b[38;5;${code}m${text}\x1b[0m`
}

function buildInfoLines(): string[] {
  return [
    '',
    c(82,  'Azeem Ehtisham'),
    c(238, '─'.repeat(14)),
    '',
    `${c(82, 'Role')}     ${c(255, 'Software Engineer')}`,
    `         ${c(255, '& Creative Technologist')}`,
    '',
    `${c(82, 'GitHub')}   ${c(39, 'github.com/Azeemme')}`,
    `${c(82, 'LinkedIn')} ${c(39, 'linkedin.com/in/azeemehtisham')}`,
    `${c(82, 'Email')}    ${c(39, 'azeemmehtisham@gmail.com')}`,
    `${c(82, 'Photos')}   ${c(39, 'ehtishamphoto.pixieset.com')}`,
    '',
    c(238, '─'.repeat(30)),
    '',
    `${c(240, "Type")} ${c(255, "'help'")} ${c(240, 'to see available commands')}`,
    '',
    `  ${c(82, 'ls')}      ${c(240, 'list directory')}`,
    `  ${c(82, 'cd')}      ${c(240, 'change directory')}`,
    `  ${c(82, 'cat')}     ${c(240, 'read file contents')}`,
    `  ${c(82, 'whoami')}  ${c(240, 'about me')}`,
    `  ${c(82, 'social')}  ${c(240, 'links & contact')}`,
    `  ${c(82, 'open')}    ${c(240, 'open repo on GitHub')}`,
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
