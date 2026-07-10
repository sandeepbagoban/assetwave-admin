import { useState } from 'react';

export default function LogisticsProviderForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [contactEmail, setContactEmail] = useState(initial?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(initial?.contact_phone || '');
  const [regionsServed, setRegionsServed] = useState(initial?.regions_served || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [active, setActive] = useState(initial ? Boolean(initial.active) : true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        regions_served: regionsServed.trim() || null,
        notes: notes.trim() || null,
        active,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit Logistics Provider' : 'New Logistics Provider'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="lp-name">Name</label>
            <input id="lp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="DHL Express, Chronopost, UPS..." autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="lp-email">Contact email</label>
            <input id="lp-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="lp-phone">Contact phone</label>
            <input id="lp-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="lp-regions">Regions served</label>
            <input id="lp-regions" value={regionsServed} onChange={(e) => setRegionsServed(e.target.value)} placeholder="EU, North America..." />
          </div>
          <div className="form-group">
            <label htmlFor="lp-notes">Notes</label>
            <textarea id="lp-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Account number, rate notes, internal contact..." />
          </div>
          <div className="form-group form-check">
            <label>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              {' '}Active (selectable at checkout)
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
