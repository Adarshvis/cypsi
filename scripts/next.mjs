/**
 * Starts Next.js on the port set in .env (PORT), so the port is never hardcoded.
 *
 *   node scripts/next.mjs dev     # used by `pnpm dev`
 *   node scripts/next.mjs start   # used by `pnpm start`
 *
 * Why a launcher: Next.js binds its server before it reads .env, so a PORT in
 * .env is otherwise ignored. This loads .env with Next's own loader (same files
 * and precedence: .env.local, .env.development, .env …), then starts Next with
 * that port. A PORT set in the shell still wins over .env.
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import nextEnv from '@next/env'

const [command = 'dev', ...rest] = process.argv.slice(2)
const isDev = command === 'dev'

nextEnv.loadEnvConfig(process.cwd(), isDev)

const DEFAULT_PORT = '3555'
const port = String(process.env.PORT || DEFAULT_PORT).trim()
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  console.error(`Invalid PORT "${port}" in .env (expected a number between 1 and 65535).`)
  process.exit(1)
}
process.env.PORT = port

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
const child = spawn(process.execPath, [nextBin, command, '-p', port, ...rest], {
  stdio: 'inherit',
  env: process.env,
})

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('exit', (code, signal) => (signal ? process.kill(process.pid, signal) : process.exit(code ?? 0)))
