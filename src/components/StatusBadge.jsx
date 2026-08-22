function StatusBadge({ label = 'Status', tone = 'neutral' }) {
  return <span className={`status-badge badge-${tone}`}>{label}</span>;
}

export default StatusBadge;