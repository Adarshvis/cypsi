import fs from 'fs'
import path from 'path'

/** Reads CMS_DATABASE_URL out of .env and returns its parts, decoded. */
export function readDbConfig(envFile = '.env') {
  const envPath = path.resolve(process.cwd(), envFile)
  const line = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('CMS_DATABASE_URL='))

  if (!line) throw new Error(`CMS_DATABASE_URL not found in ${envFile}`)

  const raw = line.slice('CMS_DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '')
  const u = new URL(raw)

  return {
    raw,
    host: u.hostname,
    port: String(Number(u.port) || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
  }
}

/** Builds a connection URL for a different database on the same server. */
export function urlFor(cfg, database) {
  const user = encodeURIComponent(cfg.user)
  const pass = encodeURIComponent(cfg.password)
  return `postgresql://${user}:${pass}@${cfg.host}:${cfg.port}/${database}`
}

export function clientOptions(cfg, database = cfg.database) {
  return {
    host: cfg.host,
    port: Number(cfg.port),
    user: cfg.user,
    password: cfg.password,
    database,
  }
}
