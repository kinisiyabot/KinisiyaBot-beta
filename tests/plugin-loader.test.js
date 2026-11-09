import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolvePluginExports, unloadPlugin } from '../lib/plugin-loader.js'

test('single default export keeps the file name as key', () => {
  const out = resolvePluginExports({ default: { command: 'x' } }, 'a.js')
  assert.deepEqual(Object.keys(out), ['a.js'])
})

test('array default export is spread into indexed keys', () => {
  const out = resolvePluginExports({ default: [{ command: 'x' }, { command: 'y' }] }, 'b.js')
  assert.deepEqual(Object.keys(out), ['b.js', 'b.js#1'])
  assert.equal(out['b.js'].command, 'x')
  assert.equal(out['b.js#1'].command, 'y')
})

test('named handler export is used when there is no default', () => {
  const out = resolvePluginExports({ handler: { command: 'z' } }, 'c.js')
  assert.equal(out['c.js'].command, 'z')
})

test('module without default falls back to the module namespace', () => {
  const out = resolvePluginExports({ all() {} }, 'd.js')
  assert.equal(typeof out['d.js'].all, 'function')
})

test('unloadPlugin removes the base key and all indexed variants', () => {
  const plugins = resolvePluginExports({ default: [{}, {}, {}] }, 'e.js')
  plugins['other.js'] = {}
  unloadPlugin(plugins, 'e.js')
  assert.deepEqual(Object.keys(plugins), ['other.js'])
})

test('unloadPlugin does not remove files that merely share a prefix', () => {
  const plugins = { 'a.js': {}, 'a.jsx.js': {}, 'a.js#1': {} }
  unloadPlugin(plugins, 'a.js')
  assert.deepEqual(Object.keys(plugins), ['a.jsx.js'])
})
