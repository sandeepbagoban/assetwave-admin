import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listBuyers } from '../../lib/api/buyers';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const LIMIT = 20;

export default function BuyersList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback((pageNum) => {
    setLoading(true);
    setError('');
    listBuyers({ page: pageNum, limit: LIMIT })
      .then((data) => {
        setRows(data || []);
        setMeta(data?.meta || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const columns = [
    { key: 'full_name', header: 'Name', render: (row) => <Link to={`/buyers/${row.id}`}>{row.full_name}</Link> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => <Link className="btn btn-secondary btn-sm" to={`/buyers/${row.id}`}>View</Link>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Buyers</h1>
          <div className="page-subtitle">Buyer accounts on the marketplace</div>
        </div>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          meta={meta}
          onPageChange={setPage}
          emptyMessage="No buyers found."
        />
      </div>
    </div>
  );
}
