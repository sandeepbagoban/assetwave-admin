const TONE_MAP = {
  active: 'success',
  approved: 'success',
  released: 'success',
  delivered: 'success',
  paid: 'info',
  shipped: 'info',
  pending: 'warning',
  pending_payment: 'warning',
  draft: 'neutral',
  suspended: 'danger',
  rejected: 'danger',
  disputed: 'danger',
  cancelled: 'danger',
  refunded: 'warning',
  archived: 'neutral',
  sold: 'info',
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-neutral">unknown</span>;
  const tone = TONE_MAP[status] || 'neutral';
  return <span className={`badge badge-${tone}`}>{String(status).replace(/_/g, ' ')}</span>;
}
