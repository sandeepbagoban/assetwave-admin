import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listListings, updateListing, listImports } from '../../lib/api/listings';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

import { downloadInventory } from '../../lib/api/client';
const LIMIT = 20;

export default function ListingsList() {
  const [editing, setEditing] = useState(null);
  const [imports, setImports] = useState([]);
  useEffect(() => { listImports({ limit: 100 }).then(setImports).catch(e => setError(e.message)); }, []);
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
      render: (row) => row.price_amount == null ? 'Price on request' : `${row.currency || 'USD'} ${Number(row.price_amount).toLocaleString()}`,
    },
    { key: 'quantity', header: 'Qty' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', header: 'Actions', render: row => <button className="btn" onClick={() => setEditing({ ...row })}>Edit</button> },
    { key: 'seller', header: 'Seller', render: (row) => row.seller?.name || '—' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Listings</h1>
          <div className="page-subtitle">Manage all listings and review inventory imports</div>
        </div>
        <button className="btn" onClick={() => downloadInventory().catch(e => setError(e.message))}>Export to Excel</button>
        <Link className="btn" to="/listings/import">Bulk Import</Link>
      </div>

      {editing && <form className="panel" onSubmit={async e => { e.preventDefault(); try { await updateListing(editing.id, { title: editing.title, description: editing.description, price_amount: editing.price_amount === '' ? null : editing.price_amount, currency: editing.currency, status: editing.status }); setEditing(null); load(page, filters); } catch (err) { setError(err.message); } }}>
        <h2>Edit listing</h2><label>Title<input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>Description<textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
        <label>Price (optional)<input type="number" min="0.01" step="0.01" value={editing.price_amount ?? ''} onChange={e => setEditing({ ...editing, price_amount: e.target.value })} /></label>
        <label>Currency<select value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })}>{['USD','EUR','GBP','MUR','ZAR','AED','INR','AUD','CAD','CHF','SGD','JPY'].map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Status<select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}><option value="active">Published</option><option value="draft">Unpublished</option><option value="sold">Sold</option></select></label><button className="btn">Save changes</button><button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>
      </form>}
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

      <div className="panel"><h2>Recent inventory imports</h2>{imports.length === 0 ? <p>No imports yet.</p> : <ul>{imports.map(job => <li key={job.id}>{job.filename} — {job.status} — {job.rowCount} rows, {job.errorCount} errors</li>)}</ul>}</div>
      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          meta={meta}
          onPageChange={setPage}
          emptyMessage="No listings found."
        />
      </div>
    </div>
  );
}
