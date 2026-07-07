import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listSellers } from '../../lib/api/sellers';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'suspended', label: 'Suspended' },
];

const LIMIT = 20;

export default function SellersList() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback((kybStatus, pageNum) => {
    setLoading(true);
    setError('');
    listSellers({ kyb_status: kybStatus || undefined, page: pageNum, limit: LIMIT })
      .then((data) => {
        setRows(data || []);
        setMeta(data?.meta || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(tab, page); }, [tab, page, load]);

  function selectTab(key) {
    setTab(key);
    setPage(1);
  }

  const columns = [
    { key: 'org_name', header: 'Organization', render: (row) => <Link to={`/sellers/${row.id}`}>{row.org_name}</Link> },
    { key: 'user_email', header: 'Contact Email' },
    { key: 'account_type', header: 'Account Type' },
    { key: 'country', header: 'Country' },
    { key: 'kyb_status', header: 'KYB Status', render: (row) => <StatusBadge status={row.kyb_status} /> },
    { key: 'verified', header: 'Verified', render: (row) => (row.verified ? 'Yes' : 'No') },
    {
      key: 'created_at',
      header: 'Applied',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => <Link className="btn btn-secondary btn-sm" to={`/sellers/${row.id}`}>Review</Link>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sellers</h1>
          <div className="page-subtitle">KYB review queue and seller directory</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => selectTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          meta={meta}
          onPageChange={setPage}
          emptyMessage={tab ? `No ${tab} sellers.` : 'No sellers found.'}
        />
      </div>
    </div>
  );
}
