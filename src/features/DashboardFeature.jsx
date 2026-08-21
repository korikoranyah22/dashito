import LegacyParityFeature from './legacy-parity/LegacyParityFeature'

export default function DashboardFeature({ activeId, onNavigate }) {
  return <LegacyParityFeature activeId={activeId} onNavigate={onNavigate} />
}
