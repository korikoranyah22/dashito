import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const legacyRoot = resolve(projectRoot, '..', 'Legacy', 'inflacion')
const sourcePath = resolve(legacyRoot, 'index.html')
const html = readFileSync(sourcePath, 'utf8')

const publicLegacy = resolve(projectRoot, 'public', 'legacy')
const generatedData = resolve(projectRoot, 'src', 'data', 'generated')
mkdirSync(publicLegacy, { recursive: true })
mkdirSync(generatedData, { recursive: true })

function decodeText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&middot;/gi, '·')
    .replace(/&iquest;/gi, '¿')
    .replace(/&aacute;/gi, 'á')
    .replace(/&eacute;/gi, 'é')
    .replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó')
    .replace(/&uacute;/gi, 'ú')
    .replace(/&ntilde;/gi, 'ñ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function tabButtons(documentHtml) {
  return [...documentHtml.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)]
    .map((match) => {
      const attributes = match[1]
      if (!/\btab-btn\b/i.test(attributes)) return null
      const id = attributes.match(/\bdata-tab=["']([^"']+)["']/i)?.[1]
      return id ? { id, label: decodeText(match[2]) } : null
    })
    .filter(Boolean)
}

function sectionFor(id) {
  const startMatch = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i').exec(html)
  if (!startMatch) throw new Error(`No se encontró ${id} en Legacy`)
  const start = startMatch.index
  const tags = /<\/?section\b[^>]*>/gi
  tags.lastIndex = start
  let depth = 0
  let match
  while ((match = tags.exec(html))) {
    depth += /^<\/section/i.test(match[0]) ? -1 : 1
    if (depth === 0) return html.slice(start, tags.lastIndex)
  }
  throw new Error(`No se pudo cerrar ${id}`)
}

const buttons = tabButtons(html)
if (buttons.length !== 30) throw new Error(`Se esperaban 30 tabs Legacy y se encontraron ${buttons.length}`)

const tabs = buttons.map((tab, index) => {
  const markup = sectionFor(tab.id)
  return {
    ...tab,
    order: index,
    headings: [...markup.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map((match) => decodeText(match[1])),
    chartIds: [...markup.matchAll(/\bid=["']([^"']*(?:Chart|chart)[^"']*)["']/g)].map((match) => match[1]),
    noteCount: (markup.match(/\b(?:note|caveat|callout|reading|method|audit)\b/gi) || []).length,
    markup,
  }
})

const controls = `<div class="legacy-parity-controls" hidden>${tabs.map((tab) => `<button class="tab-btn${tab.order === 0 ? ' active' : ''}" data-tab="${tab.id}" type="button">${tab.label}</button>`).join('')}</div>`
writeFileSync(resolve(publicLegacy, 'tabs.html'), `${controls}\n${tabs.map((tab) => tab.markup).join('\n')}\n`, 'utf8')

const styles = [...html.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)].map((match) => match[1])
writeFileSync(resolve(publicLegacy, 'base.css'), `${styles.join('\n\n')}\n`, 'utf8')

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map((match) => match[1])
if (scripts.length !== 5) throw new Error(`Se esperaban 5 scripts Legacy y se encontraron ${scripts.length}`)
const scriptNames = ['plotly.js', 'runtime-core.js', 'runtime-emae.js', 'runtime-morosidad.js', 'runtime-pendulo.js']
scripts.forEach((content, index) => writeFileSync(resolve(publicLegacy, scriptNames[index]), `${content}\n`, 'utf8'))

const themeSource = resolve(projectRoot, 'data', 'legacy-archive', 'dashito-legacy.css')
const scopedTheme = readFileSync(themeSource, 'utf8').replace(/html\[data-dashito-theme(?:=[^\]]+)?\](?:\s+body)?/g, (selector) => `${selector.replace(/\s+body$/, '')} .legacy-theme-scope`)
writeFileSync(resolve(projectRoot, 'public', 'dashito-legacy.css'), scopedTheme, 'utf8')

for (const folder of ['emae', 'morosidad', 'pendulo_distributivo']) {
  const source = resolve(legacyRoot, 'data', 'derivados', folder)
  const destination = resolve(projectRoot, 'data', 'derivados', folder)
  mkdirSync(dirname(destination), { recursive: true })
  cpSync(source, destination, { recursive: true, force: true })
}

const manifest = tabs.map(({ id, label, order, headings, chartIds, noteCount }) => ({ id, label, order, headings, chartIds, noteCount }))
writeFileSync(resolve(generatedData, 'legacy-tabs-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Paridad Legacy importada: ${tabs.length} tabs, ${manifest.reduce((sum, tab) => sum + tab.chartIds.length, 0)} contenedores de gráficos.`)
tabs.forEach((tab) => console.log(`${String(tab.order + 1).padStart(2, '0')} ${tab.id}: ${tab.headings.length} títulos · ${tab.chartIds.length} gráficos · ${tab.noteCount} notas`))
