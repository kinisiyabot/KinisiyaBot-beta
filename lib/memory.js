// lib/memory.js
// Simple persistent store for the AI session map used by system.js.
import { promises as fs } from 'fs'
import path from 'path'

const MEMORY_FILE = path.join(process.cwd(), 'memory.json')

export async function loadMemory() {
  const map = new Map()
  try {
    const raw = await fs.readFile(MEMORY_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    for (const [key, value] of Object.entries(parsed || {})) {
      map.set(key, value)
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('loadMemory:', err.message)
    }
  }
  return map
}

export async function saveMemory(map) {
  if (!(map instanceof Map)) return
  const plain = {}
  for (const [key, value] of map.entries()) {
    plain[key] = value
  }
  await fs.writeFile(MEMORY_FILE, JSON.stringify(plain), 'utf8')
}
