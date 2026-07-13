import { useEffect, useState, useCallback } from 'react';
import { listLogisticsProviders, createLogisticsProvider, updateLogisticsProvider, deleteLogisticsProvider } from '../../lib/api/logisticsProviders';
import LogisticsProviderForm from './LogisticsProviderForm';
import LogisticsProviderRatesPanel from './LogisticsProviderRatesPanel';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function LogisticsProvidersList() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formState, setFormState] = useState(null); // null | {} | provider
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [ratesFor, setRatesFor] = useState(null); // null | provider

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return listLogisticsProviders()
      .then((data) => setProviders(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleFormSubmit(payload) {
    if (formState?.id) {
      await updateLogisticsProvider(formState.id, payload);
      setNotice('Logistics provider updated.');
    } else {
      await createLogisticsProvider(payload);
      setNotice('Logistics provider created.');
    }
    setFormState(null);
    await load();
  }

  async function handleDelete() {
    setDeleteError('');
    try {
      await deleteLogisticsProvider(pendingDelete.id);
      setNotice('Logistics provider deleted.');
      setPendingDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'contact_email', header: 'Contact email', render: (row) => row.contact_email || '—' },
    { key: 'contact_phone', header: 'Contact phone', render: (row) => row.contact_phone || '—' },
    { key: 'regions_served', header: 'Regions served', render: (row) => row.regions_served || '—' },
    { key: 'rates', header: 'Rates', render: (row) => `${(row.rates || []).length} configured` },
    { key: 'active', header: 'Status', render: (row) => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={() => setRatesFor(row)}>Rates</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFormState(row)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => { setPendingDelete(row); setDeleteError(''); }}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Logistics Providers</h1>
          <div className="page-subtitle">Manually-maintained shipping carrier directory (DHL, FedEx, UPS, Chronopost, Colissimo...)</div>
        </div>
        <button className="btn" onClick={() => setFormState({})}>+ New Provider</button>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="panel">
        <DataTable columns={columns} rows={providers} loading={loading} error={error} emptyMessage="No logistics providers yet." />
      </div>

      {formState !== null && (
        <LogisticsProviderForm
          initial={formState.id ? formState : null}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormState(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title={`Delete "${pendingDelete.name}"?`}
          message="This cannot be undone."
          tone="danger"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        >
          {deleteError && <div className="alert alert-error">{deleteError}</div>}
        </ConfirmDialog>
      )}

      {ratesFor && (
        <LogisticsProviderRatesPanel
          provider={ratesFor}
          onClose={() => { setRatesFor(null); load(); }}
          onChanged={load}
        />
      )}
    </div>
  );
}
