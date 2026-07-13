import { useState } from 'react';
import { createLogisticsProviderRate, updateLogisticsProviderRate, deleteLogisticsProviderRate } from '../../lib/api/logisticsProviderRates';

const EMPTY_NEW = { country_code: '', price_amount: '', currency: 'USD' };

export default function LogisticsProviderRatesPanel({ provider, onClose, onChanged }) {
  const [rates, setRates] = useState(provider.rates || []);
  const [newRate, setNewRate] = useState(EMPTY_NEW);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ price_amount: '', currency: 'USD' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!newRate.price_amount || Number(newRate.price_amount) < 0) {
      setError('Price is required and must be >= 0.');
      return;
    }
    setBusy(true);
    try {
      const created = await createLogisticsProviderRate(provider.id, {
        country_code: newRate.country_code ? newRate.country_code.toUpperCase() : null,
        price_amount: Number(newRate.price_amount),
        currency: newRate.currency || 'USD',
      });
      setRates((r) => [...r, created]);
      setNewRate(EMPTY_NEW);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(rate) {
    setEditingId(rate.id);
    setEditDraft({ price_amount: String(rate.price_amount), currency: rate.currency });
    setError('');
  }

  async function handleSaveEdit(rateId) {
    setError('');
    if (!editDraft.price_amount || Number(editDraft.price_amount) < 0) {
      setError('Price must be >= 0.');
      return;
    }
    setBusy(true);
    try {
      const updated = await updateLogisticsProviderRate(provider.id, rateId, {
        price_amount: Number(editDraft.price_amount),
        currency: editDraft.currency,
      });
      setRates((r) => r.map((x) => (x.id === rateId ? updated : x)));
      setEditingId(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(rateId) {
    setError('');
    setBusy(true);
    try {
      await deleteLogisticsProviderRate(provider.id, rateId);
      setRates((r) => r.filter((x) => x.id !== rateId));
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...rates].sort((a, b) => (a.country_code || 'zz').localeCompare(b.country_code || 'zz'));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h2>Shipping rates — {provider.name}</h2>
        <p className="text-muted">One rate per country code, or a single rate with no country code as the default/fallback for anywhere else.</p>
        {error && <div className="alert alert-error">{error}</div>}

        <table style={{ width: '100%', marginBottom: 16 }}>
          <thead>
            <tr>
              <th>Country</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={4} className="text-muted">No rates yet — this provider can't be selected at checkout until it has at least one.</td></tr>
            )}
            {sorted.map((rate) => (
              <tr key={rate.id}>
                <td>{rate.country_code || 'Default (any country)'}</td>
                <td>
                  {editingId === rate.id ? (
                    <input
                      type="number" min="0" step="0.01" style={{ width: 90 }}
                      value={editDraft.price_amount}
                      onChange={(e) => setEditDraft((d) => ({ ...d, price_amount: e.target.value }))}
                    />
                  ) : rate.price_amount}
                </td>
                <td>
                  {editingId === rate.id ? (
                    <input
                      style={{ width: 60 }}
                      value={editDraft.currency}
                      onChange={(e) => setEditDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))}
                    />
                  ) : rate.currency}
                </td>
                <td>
                  <div className="btn-row">
                    {editingId === rate.id ? (
                      <>
                        <button className="btn btn-sm" disabled={busy} onClick={() => handleSaveEdit(rate.id)}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(rate)}>Edit</button>
                        <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => handleDelete(rate.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={handleAdd} className="btn-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Country (2-letter, blank = default)</label>
            <input
              maxLength={2} style={{ width: 90, textTransform: 'uppercase' }}
              value={newRate.country_code}
              onChange={(e) => setNewRate((r) => ({ ...r, country_code: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Price</label>
            <input
              type="number" min="0" step="0.01" style={{ width: 100 }}
              value={newRate.price_amount}
              onChange={(e) => setNewRate((r) => ({ ...r, price_amount: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Currency</label>
            <input
              style={{ width: 60 }}
              value={newRate.currency}
              onChange={(e) => setNewRate((r) => ({ ...r, currency: e.target.value.toUpperCase() }))}
            />
          </div>
          <button type="submit" className="btn" disabled={busy}>+ Add rate</button>
        </form>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
