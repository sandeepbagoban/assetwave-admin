import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listListings } from '../../lib/api/listings';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const LIMIT = 20;

export default function ListingsList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', category: '', brand: '', condition: '' });

  const load = useCallback((pageNum, activeFilters) => {
    setLoading(true);
    setError('');
    listListings({ ...activeFilters, page: pageNum, limit: LIMIT })
      .then((data) => {
        setRows(data || []);
        setMeta(data?.meta || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page, filters); }, [page, load]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    load(1, filters);
  }

  const columns = [
    { key: 'title', header: 'Title', render: (row) => <strong>{row.title}</strong> },
    { key: 'brand', header: 'Brand' },
    { key: 'model', header: 'Model' },
    { key: 'category', header: 'Category', render: (row) => row.category?.name || row.category || '—' },
    { key: 'condition', header: 'Condition', render: (row) => <StatusBadge status={row.condition} /> },
    {
      key: 'price_amount',
      header: 'Price',
      render: (row) => `${row.currency || 'USD'} ${Number(row.price_amount).toLocaleString()}`,
    },
    { key: 'quantity', header: 'Qty' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'seller', header: 'Seller', render: (row) => row.seller?.name || '—' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Listings</h1>
          <div className="page-subtitle">Read-only overview of active marketplace listings</div>
        </div>
        <Link className="btn" to="/listings/import">Bulk Import</Link>
      </div>

      <form className="filters-bar" onSubmit={applyFilters}>
        <input
          placeholder="Search title..."
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <input
          placeholder="Brand"
          value={filters.brand}
          onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
        />
        <select
          value={filters.condition}
          onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
        >
          <option value="">Any condition</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>
        <button className="btn btn-secondary" type="submit">Apply Filters</button>
      </form>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          meta={meta}
          onPageChange={setPage}
          emptyMessage="No active listings found. Note: this view only shows status=active listings from the public browse endpoint."
        />
      </div>
    </div>
  );
}
