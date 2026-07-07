import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../../lib/api/orders';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const STATUSES = [
  '', 'pending_payment', 'paid', 'shipped', 'delivered', 'released', 'refunded', 'disputed', 'cancelled',
];

const LIMIT = 20;

export default function OrdersList() {
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback((statusFilter, pageNum) => {
    setLoading(true);
    setError('');
    listOrders({ status: statusFilter || undefined, page: pageNum, limit: LIMIT })
      .then((data) => {
        setRows(data || []);
        setMeta(data?.meta || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(status, page); }, [status, page, load]);

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setPage(1);
  }

  const columns = [
    { key: 'id', header: 'Order ID', render: (row) => <Link to={`/orders/${row.id}`}>{row.id.slice(0, 8)}…</Link> },
    { key: 'buyer_name', header: 'Buyer', render: (row) => row.buyer_name || row.buyer_email || '—' },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) => `${row.currency || 'USD'} ${Number(row.total_amount).toLocaleString()}`,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'items', header: 'Items', render: (row) => row.items?.length ?? 0 },
    {
      key: 'placed_at',
      header: 'Placed',
      render: (row) => (row.placed_at ? new Date(row.placed_at).toLocaleString() : '—'),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => <Link className="btn btn-secondary btn-sm" to={`/orders/${row.id}`}>View</Link>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders &amp; Escrow</h1>
          <div className="page-subtitle">Escrow lifecycle: pending_payment → paid → shipped → delivered → released/refunded</div>
        </div>
      </div>

      <div className="filters-bar">
        <select value={status} onChange={handleStatusChange}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>
          ))}
        </select>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          meta={meta}
          onPageChange={setPage}
          emptyMessage="No orders found for this filter."
        />
      </div>
    </div>
  );
}
