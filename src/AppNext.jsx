import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Menu, Palette, Search, Sparkles, X } from 'lucide-react'
import { dashboardGroups, dashboards } from './app/dashboardRegistry'
import DashboardFeature from './features/DashboardFeature'

const themes = ['rose-dark', 'rose-light', 'blue-dark']

function initialTheme() {
  const saved = window.localStorage.getItem('dashito-argento.theme')
  return themes.includes(saved) ? saved : 'blue-dark'
}

function initialDashboard() {
  const slug = window.location.hash.replace('#/', '')
  return dashboards.find((item) => item.slug === slug)?.id || 'tab-power'
}

function ThemePicker({ theme, onTheme }) {
  return <div className="theme-picker" aria-label="Elegir apariencia">{themes.map((item) => <button key={item} type="button" className={`${item} ${theme === item ? 'is-active' : ''}`} onClick={() => onTheme(item)} aria-label={`Usar tema ${item}`} />)}</div>
}

function Sidebar({ open, collapsed, activeId, theme, onTheme, onSelect, onClose, onCollapse }) {
  return <>
    <aside className={`sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
      <button className="brand" type="button" onClick={() => onSelect('tab-power')} aria-label="Ir a Poder adquisitivo">
        <span className="brand__mark"><img src="./dashito-argento.svg" alt="" /></span>
        {!collapsed ? <span className="brand__copy"><strong>Dashito Argento</strong><small>economía en criollo</small></span> : null}
      </button>
      <button className="sidebar__close" type="button" onClick={onClose} aria-label="Cerrar menú lateral"><X size={18} /></button>
      <div className="freshness"><span><i />{!collapsed ? 'Cierre editorial' : null}</span>{!collapsed ? <strong>21 AGO 2026</strong> : null}</div>
      <nav className="sidebar__nav" aria-label="Dashboards">
        {dashboardGroups.map((group) => <section key={group.label}>
          {!collapsed ? <p>{group.label}</p> : null}
          {group.items.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={activeId === item.id ? 'is-active' : ''} title={item.label} onClick={() => { onSelect(item.id); onClose() }}><Icon size={16} /><span>{item.label}</span></button> })}
        </section>)}
      </nav>
      <div className="sidebar__footer">
        {!collapsed ? <><p>Apariencia</p><ThemePicker theme={theme} onTheme={onTheme} /></> : null}
        {!collapsed ? <div className="react-status"><span>REACT</span><small>{dashboards.length} features · sin iframe</small></div> : null}
        {!collapsed ? <div className="potato-signature"><span>🥔</span><small>las papitas siguen por acá</small></div> : null}
      </div>
      <button className="sidebar__collapse" type="button" onClick={onCollapse} aria-label={collapsed ? 'Expandir navegación' : 'Contraer navegación'}>{collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}</button>
    </aside>
    {open ? <button className="sidebar-backdrop" type="button" aria-label="Cerrar navegación" onClick={onClose} /> : null}
  </>
}

function Header({ dashboard, onMenu, onSearch, theme, onThemeCycle }) {
  const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
  return <header className="app-header">
    <div className="app-header__identity"><button type="button" className="icon-button mobile-menu" onClick={onMenu} aria-label="Abrir navegación"><Menu size={18} /></button><div><span>Dashito Argento / {dashboard.group}</span><strong>{dashboard.label}</strong></div></div>
    <button type="button" className="header-search" onClick={onSearch}><Search size={14} /><span>Buscar dashboard</span><kbd>{shortcut}</kbd></button>
    <div className="app-header__actions"><span className="runtime-pill is-ready"><i />componentes React</span><span className="date-pill"><CalendarDays size={13} /> 21 AGO 2026</span><button type="button" className="icon-button" onClick={onThemeCycle} aria-label={`Cambiar apariencia; tema actual ${theme}`}><Palette size={16} /></button></div>
  </header>
}

function SearchPalette({ activeId, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  useEffect(() => inputRef.current?.focus(), [])
  const results = dashboards.filter((item) => `${item.label} ${item.group} ${item.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
  return <div className="palette-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="search-palette" role="dialog" aria-modal="true" aria-labelledby="search-title">
    <div className="search-palette__field"><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pobreza, salarios, BCRA…" aria-label="Buscar dashboard" /><button type="button" onClick={onClose} aria-label="Cerrar búsqueda"><X size={17} /></button></div>
    <div className="search-palette__head"><span id="search-title">FEATURES REACT</span><small>{results.length} resultados</small></div>
    <div className="search-results">{results.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={activeId === item.id ? 'is-active' : ''} onClick={() => { onSelect(item.id); onClose() }}><span><Icon size={16} /></span><div><strong>{item.label}</strong><small>{item.description}</small></div><ChevronRight size={14} /></button> })}</div>
    <footer><span><kbd>esc</kbd> cerrar</span><span>{dashboards.length} dashboards · React + datos auditados</span></footer>
  </section></div>
}

function BottomNav({ activeId, onSelect, onMenu }) {
  const items = ['tab-power', 'tab-rates', 'tab-poverty'].map((id) => dashboards.find((item) => item.id === id))
  return <nav className="bottom-nav" aria-label="Navegación móvil">{items.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={activeId === item.id ? 'is-active' : ''} onClick={() => onSelect(item.id)}><Icon size={19} /><small>{item.label.replace('Tasas e ', '')}</small></button> })}<button type="button" onClick={onMenu}><Menu size={19} /><small>Más</small></button></nav>
}

export default function AppNext() {
  const [theme, setTheme] = useState(initialTheme)
  const [activeId, setActiveId] = useState(initialDashboard)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768)
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dashboard = useMemo(() => dashboards.find((item) => item.id === activeId) || dashboards[0], [activeId])

  useEffect(() => { window.localStorage.setItem('dashito-argento.theme', theme); document.documentElement.dataset.dashitoTheme = theme; const colors = { 'rose-dark': '#160b12', 'rose-light': '#faf8f6', 'blue-dark': '#07111e' }; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]) }, [theme])
  useEffect(() => { const media = window.matchMedia('(max-width: 768px)'); const sync = (event) => { setSidebarOpen(!event.matches); if (event.matches) setCollapsed(false) }; sync(media); media.addEventListener('change', sync); return () => media.removeEventListener('change', sync) }, [])
  useEffect(() => { const keydown = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) } if (event.key === 'Escape') { setSearchOpen(false); if (window.innerWidth <= 768) setSidebarOpen(false) } }; window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown) }, [])
  useEffect(() => { document.title = `${dashboard.label} · Dashito Argento`; window.history.replaceState(null, '', `#/${dashboard.slug}`); document.querySelector('.feature-canvas')?.scrollTo({ top: 0, behavior: 'auto' }) }, [dashboard])

  const selectDashboard = (id) => { setActiveId(id); if (window.innerWidth <= 768) setSidebarOpen(false) }
  const cycleTheme = () => setTheme((current) => themes[(themes.indexOf(current) + 1) % themes.length])
  return <div className="app-shell" data-theme={theme}>
    <Sidebar open={sidebarOpen} collapsed={collapsed} activeId={activeId} theme={theme} onTheme={setTheme} onSelect={selectDashboard} onClose={() => { if (window.innerWidth <= 768) setSidebarOpen(false) }} onCollapse={() => setCollapsed((value) => !value)} />
    <div className="app-main"><Header dashboard={dashboard} onMenu={() => setSidebarOpen((value) => !value)} onSearch={() => setSearchOpen(true)} theme={theme} onThemeCycle={cycleTheme} /><div className="dashboard-context"><span><Sparkles size={12} /> {dashboard.description}</span><strong>{dashboard.group}</strong></div><DashboardFeature activeId={activeId} onNavigate={selectDashboard} /></div>
    <BottomNav activeId={activeId} onSelect={selectDashboard} onMenu={() => setSidebarOpen(true)} />
    {searchOpen ? <SearchPalette activeId={activeId} onClose={() => setSearchOpen(false)} onSelect={selectDashboard} /> : null}
  </div>
}
