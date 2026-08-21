import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const source = readFileSync(resolve(root, '..', 'Legacy', 'inflacion', 'index.html'), 'utf8')
const imported = readFileSync(resolve(root, 'public', 'legacy', 'tabs.html'), 'utf8')
const manifest = JSON.parse(readFileSync(resolve(root, 'src', 'data', 'generated', 'legacy-tabs-manifest.json'), 'utf8'))
const runtime = ['runtime-core.js', 'runtime-emae.js', 'runtime-morosidad.js', 'runtime-pendulo.js'].map((file) => readFileSync(resolve(root, 'public', 'legacy', file), 'utf8')).join('\n')

function sectionFor(documentHtml, id) {
  const startMatch = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i').exec(documentHtml)
  if (!startMatch) return null
  const tags = /<\/?section\b[^>]*>/gi
  tags.lastIndex = startMatch.index
  let depth = 0
  let match
  while ((match = tags.exec(documentHtml))) {
    depth += /^<\/section/i.test(match[0]) ? -1 : 1
    if (depth === 0) return documentHtml.slice(startMatch.index, tags.lastIndex)
  }
  return null
}

const results = []
const check = (label, condition) => results.push({ label, condition: Boolean(condition) })

check('30 tabs en el manifiesto', manifest.length === 30)
check('30 ids únicos', new Set(manifest.map((tab) => tab.id)).size === 30)
check('orden continuo 0–29', manifest.every((tab, index) => tab.order === index))

for (const tab of manifest) {
  const sourceSection = sectionFor(source, tab.id)
  check(`${tab.id} conserva el HTML exacto`, sourceSection && imported.includes(sourceSection))
  for (const chartId of tab.chartIds) check(`${tab.id} conserva runtime de ${chartId}`, runtime.includes(chartId))
}

const handlers = [...imported.matchAll(/\bon(?:click|change|input|submit)=["']([\s\S]*?)["']/gi)]
  .map((match) => match[1].match(/^\s*(?:return\s+)?([A-Za-z_$][\w$]*)\s*\(/)?.[1])
  .filter(Boolean)
for (const handler of new Set(handlers)) {
  check(`handler ${handler} disponible`, new RegExp(`(?:function\\s+${handler}\\s*\\(|(?:const|let|var)\\s+${handler}\\s*=)`).test(runtime))
}

for (const result of results) console.log(`${result.condition ? 'PASS' : 'FAIL'} ${result.label}`)
const failed = results.filter((result) => !result.condition)
console.log(`\n${results.length - failed.length}/${results.length} controles aprobados`)
if (failed.length) process.exit(1)

