import {
  Activity, BarChart3, BriefcaseBusiness, Building2, ChartNoAxesCombined,
  CircleDollarSign, Factory, Gauge, HandCoins, HeartPulse, History, House,
  Landmark, LineChart, PackageOpen, Percent, PiggyBank, Scale, ShieldCheck,
  Ship, ShoppingBasket, TrendingDown, TrendingUp, Users, WalletCards,
} from 'lucide-react'
import legacyTabs from '../data/generated/legacy-tabs-manifest.json'

const metadata = {
  'tab-power': { slug: 'poder-adquisitivo', icon: WalletCards },
  'tab-rates': { slug: 'tasas-inflacion', icon: Percent },
  'tab-pres': { slug: 'inflacion-presidencias', icon: History },
  'tab-poverty': { slug: 'pobreza', icon: Users },
  'tab-social': { slug: 'asistencia-social', icon: HandCoins },
  'tab-gini': { slug: 'desigualdad', icon: Scale },
  'tab-structure': { slug: 'estructura-social', icon: BarChart3 },
  'tab-family': { slug: 'canasta-familiar', icon: ShoppingBasket },
  'tab-risk': { slug: 'riesgo-pais', icon: Gauge },
  'tab-bigmac': { slug: 'indice-big-mac', icon: CircleDollarSign },
  'tab-wholesale': { slug: 'precios-mayoristas', icon: Factory },
  'tab-health-education': { slug: 'salud-educacion', icon: HeartPulse },
  'tab-consumption': { slug: 'consumo', icon: PackageOpen },
  'tab-work': { slug: 'trabajo', icon: BriefcaseBusiness },
  'tab-investment': { slug: 'inversion', icon: Building2 },
  'tab-housing': { slug: 'vivienda', icon: House },
  'tab-growth': { slug: 'crecimiento', icon: ChartNoAxesCombined },
  'tab-emae': { slug: 'actividad-real', icon: Activity },
  'tab-morosidad': { slug: 'morosidad', icon: TrendingDown },
  'tab-pendulo': { slug: 'pendulo-distributivo', icon: Scale },
  'tab-debt-public': { slug: 'deuda-publica', icon: Landmark },
  'tab-fiscal': { slug: 'resultado-fiscal', icon: PiggyBank },
  'tab-trade': { slug: 'balanza-comercial', icon: Ship },
  'tab-bcra': { slug: 'bcra', icon: Activity },
  'tab-debt-spiral': { slug: 'espiral-deuda', icon: TrendingUp },
  'tab-program': { slug: 'programa-escenarios', icon: LineChart },
  'tab-wealth-contribution': { slug: 'grandes-fortunas', icon: CircleDollarSign },
  'tab-milei-cost': { slug: 'lo-que-te-robo-milei', icon: TrendingDown },
  'tab-meli-benefits': { slug: 'privilegios-fiscales', icon: Building2 },
  'tab-casta': { slug: 'la-casta', icon: ShieldCheck },
}

export const dashboards = legacyTabs.map((tab) => ({
  id: tab.id,
  slug: metadata[tab.id].slug,
  label: tab.label,
  icon: metadata[tab.id].icon,
  description: tab.headings[0] || tab.label,
  group: 'Dashboard original',
  legacyOrder: tab.order,
}))

export const dashboardGroups = [{ label: 'Dashboard original', items: dashboards }]
